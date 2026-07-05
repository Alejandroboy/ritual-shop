import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { S3Service } from '../s3/s3.service';
import {
  ApprovalStage,
  AssetStage,
  OrderItemAsset,
  StorageType,
} from '@prisma/client';
import * as mime from 'mime-types';
import { ListAssetsQuery } from './dto/list-assets.query';
import { OrdersItemsService } from '../orders/orders-items/orders-items.service';
import { EmailService } from '../email/email.service';
import { TelegramService } from '../notifications/telegram/telegram.service';

export type AssetDto = {
  id: string;
  kind: string;
  stage: AssetStage;
  primary: boolean;
  derivedFromId?: string | null;
  originalName?: string | null;
  fileName?: string | null;
  contentType?: string | null;
  size?: number | null;
  viewUrl: string;
  downloadUrl: string;
  expiresIn: number;
  thumbUrl?: string | null;
  createdAt: Date;
};

function resolveContentType(
  originalName?: string | null,
  stored?: string | null,
  key?: string | null,
) {
  if (stored) return stored;
  const byName = originalName ? mime.lookup(originalName) : false;
  if (byName) return String(byName);
  const byKey = key ? mime.lookup(key) : false;
  if (byKey) return String(byKey);
  return 'application/octet-stream';
}

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
    private readonly ordersItemsService: OrdersItemsService,
    private readonly email: EmailService,
    private readonly telegram: TelegramService,
  ) {}

  private async assertItemBelongsToOrder(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      select: { id: true },
    });
    if (!item)
      throw new NotFoundException('Order item not found for this order');
  }

  async toDtoWithUrls(a: OrderItemAsset): Promise<AssetDto> {
    if (a.storage !== StorageType.s3) {
      const base = process.env.UPLOADS_PUBLIC_BASE ?? '';
      const path = `${base}/${a.path}`;
      return {
        id: a.id,
        kind: a.kind,
        stage: a.stage,
        primary: a.primary,
        derivedFromId: a.derivedFromId,
        originalName: a.originalName,
        fileName: a.fileName,
        contentType: a.contentType,
        size: a.size ?? null,
        viewUrl: path,
        downloadUrl: path,
        expiresIn: 24 * 3600,
        createdAt: a.createdAt,
      };
    }

    const contentType = resolveContentType(
      a.originalName,
      a.contentType,
      a.key,
    );

    const ext =
      a.fileName?.split('.').pop()?.toLowerCase() ||
      a.originalName?.split('.').pop()?.toLowerCase() ||
      contentType?.split('/').pop() ||
      'bin';

    let baseName =
      a.fileName?.replace(/\.[^.]+$/, '') ||
      a.originalName?.replace(/\.[^.]+$/, '') ||
      'file';

    if (a.stage === 'RETOUCHED') {
      if (!baseName.endsWith('_retouch')) {
        baseName = `${baseName}_retouch`;
      }
    }

    const downloadName = `${baseName}.${ext}`;

    const view = await this.s3.signGet(
      { bucket: a.bucket, key: a.key },
      { contentType },
    );
    const dl = await this.s3.signGet(
      { bucket: a.bucket, key: a.key },
      { downloadName, contentType },
    );

    const thumb = a.thumbKey
      ? await this.s3.signGet(
          { bucket: a.bucket, key: a.thumbKey },
          { contentType: 'image/jpeg' },
        )
      : null;

    return {
      id: a.id,
      kind: a.kind,
      stage: a.stage,
      primary: a.primary,
      derivedFromId: a.derivedFromId,
      originalName: a.originalName,
      fileName: a.fileName,
      contentType,
      size: a.size ?? null,
      viewUrl: view.url,
      downloadUrl: dl.url,
      expiresIn: view.expiresIn,
      thumbUrl: thumb?.url ?? null,
      createdAt: a.createdAt,
    };
  }

  async createOriginalFromS3(
    orderId: string,
    itemId: string,
    dto: CreateAssetDto,
  ) {
    await this.assertItemBelongsToOrder(orderId, itemId);
    if (dto.storage !== 's3')
      throw new BadRequestException('Only S3 storage is supported');

    const isImage = dto.contentType?.startsWith('image/') ?? false;

    const asset = await this.prisma.orderItemAsset.create({
      data: {
        orderItemId: itemId,
        storage: 's3',
        bucket: dto.bucket,
        key: dto.key,
        contentType: dto.contentType ?? null,
        size: dto.size ?? null,
        etag: dto.etag ?? null,
        originalName: dto.originalName ?? null,
        fileName: dto.fileName ?? dto.originalName ?? null,
        stage: 'ORIGINAL',
        primary: false,
      },
    });

    if (isImage && dto.key) {
      this.s3
        .generateThumb(dto.key)
        .then((thumbKey) =>
          this.prisma.orderItemAsset.update({
            where: { id: asset.id },
            data: { thumbKey },
          }),
        )
        .catch((err) =>
          console.warn(
            `Thumbnail failed for asset ${asset.id}: ${err.message}`,
          ),
        );
    }

    return asset;
  }

  async createRetouchFromS3(
    orderId: string,
    itemId: string,
    dto: CreateAssetDto & { sourceAssetId: string },
  ) {
    await this.assertItemBelongsToOrder(orderId, itemId);
    if (dto.storage !== 's3')
      throw new BadRequestException('Only S3 storage is supported');

    const src = await this.prisma.orderItemAsset.findUnique({
      where: { id: dto.sourceAssetId },
      select: { id: true, orderItemId: true, stage: true },
    });
    if (!src) throw new NotFoundException('Source asset not found');
    if (src.orderItemId !== itemId) {
      throw new ForbiddenException(
        'Source asset belongs to another order item',
      );
    }
    if (src.stage !== 'ORIGINAL') {
      throw new BadRequestException(
        'Retouch can be created only from ORIGINAL asset',
      );
    }
    await this.ordersItemsService.changeApprovalStage(
      orderId,
      itemId,
      ApprovalStage.IN_PROGRESS,
    );
    await this.ordersItemsService.changeUserActionNeeded(orderId, itemId);

    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
      select: { order: { select: { orderNumber: true } } },
    });
    const orderNumber = item?.order.orderNumber ?? orderId;
    const ext =
      dto.originalName?.split('.').pop()?.toLowerCase() ||
      dto.contentType?.split('/').pop() ||
      'bin';

    const retouchCount = await this.prisma.orderItemAsset.count({
      where: { derivedFromId: src.id },
    });
    const retouchNumber = retouchCount + 1;
    const filename = `${orderNumber}-retouch-${retouchNumber}.${ext}`;

    const isImage = dto.contentType?.startsWith('image/') ?? false;

    const asset = await this.prisma.orderItemAsset.create({
      data: {
        orderItemId: src.orderItemId,
        stage: 'RETOUCHED',
        derivedFromId: src.id,
        kind: 'PHOTO',
        primary: true,
        storage: 's3',
        bucket: dto.bucket,
        key: dto.key,
        contentType: dto.contentType ?? null,
        size: dto.size ?? null,
        etag: dto.etag ?? null,
        originalName: dto.originalName ?? null,
        fileName: filename,
      },
    });

    await this.prisma.discussComment.create({
      data: {
        orderItemId: itemId,
        text: 'Добавлена ретушь',
        userName: 'Администратор',
      },
    });

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        orderNumber: true,
        customerEmail: true,
        customer: { select: { email: true, telegramChatId: true } },
      },
    });
    const customerEmail =
      order?.customerEmail ?? order?.customer?.email ?? null;
    const telegramChatId = order?.customer?.telegramChatId ?? null;
    if (customerEmail)
      this.email
        .newDiscussComment(customerEmail, orderNumber, 'Добавлена ретушь')
        .catch(() => {});
    if (telegramChatId)
      this.telegram
        .newDiscussComment(telegramChatId, orderNumber, 'Добавлена ретушь')
        .catch(() => {});

    if (isImage && dto.key) {
      this.s3
        .generateThumb(dto.key)
        .then((thumbKey) =>
          this.prisma.orderItemAsset.update({
            where: { id: asset.id },
            data: { thumbKey },
          }),
        )
        .catch((err) =>
          console.warn(
            `Thumbnail failed for retouch asset ${asset.id}: ${err.message}`,
          ),
        );
    }

    return asset;
  }

  async list(orderId: string, itemId: string, query?: ListAssetsQuery) {
    await this.assertItemBelongsToOrder(orderId, itemId);

    if (query?.pairs === '1') {
      const assets = await this.prisma.orderItemAsset.findMany({
        where: { orderItemId: itemId },
        orderBy: { createdAt: 'asc' },
      });

      const originals = assets.filter((a) => a.stage === 'ORIGINAL');
      const retouched = assets.filter((a) => a.stage === 'RETOUCHED');

      const byOriginal = new Map<string, OrderItemAsset[]>();

      for (const r of retouched) {
        if (!r.derivedFromId) continue;
        const list = byOriginal.get(r.derivedFromId) ?? [];
        list.push(r);
        byOriginal.set(r.derivedFromId, list);
      }

      return Promise.all(
        originals.map(async (o) => {
          const rs = byOriginal.get(o.id) ?? [];
          return {
            original: await this.toDtoWithUrls(o),
            retouches: await Promise.all(rs.map((r) => this.toDtoWithUrls(r))),
          };
        }),
      );
    }

    const where = query?.stage
      ? { orderItemId: itemId, stage: query.stage }
      : { orderItemId: itemId };

    const list = await this.prisma.orderItemAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(list.map((a) => this.toDtoWithUrls(a)));
  }

  async setPrimary(orderId: string, itemId: string, assetId: string) {
    await this.assertItemBelongsToOrder(orderId, itemId);

    const a = await this.prisma.orderItemAsset.findFirst({
      where: { id: assetId, orderItemId: itemId },
      select: { id: true, stage: true, derivedFromId: true },
    });
    if (!a) throw new NotFoundException('Asset not found for this item');

    if (a.stage === 'RETOUCHED') {
      if (!a.derivedFromId) {
        throw new BadRequestException(
          'Retouched asset must have derivedFromId',
        );
      }
      await this.prisma.$transaction([
        this.prisma.orderItemAsset.updateMany({
          where: { derivedFromId: a.derivedFromId },
          data: { primary: false },
        }),
        this.prisma.orderItemAsset.update({
          where: { id: assetId },
          data: { primary: true },
        }),
      ]);
      return { ok: true };
    }

    await this.prisma.$transaction([
      this.prisma.orderItemAsset.updateMany({
        where: { orderItemId: itemId, stage: 'ORIGINAL' },
        data: { primary: false },
      }),
      this.prisma.orderItemAsset.update({
        where: { id: assetId },
        data: { primary: true },
      }),
    ]);
    return { ok: true };
  }

  async remove(orderId: string, itemId: string, assetId: string) {
    await this.assertItemBelongsToOrder(orderId, itemId);

    const asset = await this.prisma.orderItemAsset.findFirst({
      where: { id: assetId, orderItemId: itemId },
      select: { id: true },
    });
    if (!asset) throw new NotFoundException('Asset not found for this item');

    await this.prisma.orderItemAsset.delete({ where: { id: assetId } });
    return { ok: true };
  }

  async getUrlById(id: string, dl?: string) {
    const a = await this.prisma.orderItemAsset.findUniqueOrThrow({
      where: { id },
    });
    const dto = await this.toDtoWithUrls(a);
    return dl
      ? { url: dto.downloadUrl, expiresIn: dto.expiresIn }
      : { url: dto.viewUrl, expiresIn: dto.expiresIn };
  }
}
