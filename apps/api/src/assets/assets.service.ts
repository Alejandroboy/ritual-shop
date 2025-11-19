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

export type AssetDto = {
  id: string;
  kind: string;
  stage: AssetStage; // NEW
  primary: boolean; // NEW
  derivedFromId?: string | null; // NEW
  originalName?: string | null;
  contentType?: string | null;
  size?: number | null;
  viewUrl: string;
  downloadUrl: string;
  expiresIn: number;
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
        stage: a.stage, // NEW
        primary: a.primary, // NEW
        derivedFromId: a.derivedFromId, // NEW
        originalName: a.originalName,
        contentType: a.contentType,
        size: a.size ?? null,
        viewUrl: path,
        downloadUrl: path,
        expiresIn: 24 * 3600,
      };
    }

    const contentType = resolveContentType(
      a.originalName,
      a.contentType,
      a.key,
    );

    const view = await this.s3.signGet(
      { bucket: a.bucket, key: a.key },
      { contentType },
    );
    const dl = await this.s3.signGet(
      { bucket: a.bucket, key: a.key },
      { downloadName: a.originalName ?? 'file', contentType },
    );

    return {
      id: a.id,
      kind: a.kind,
      stage: a.stage, // NEW
      primary: a.primary, // NEW
      derivedFromId: a.derivedFromId, // NEW
      originalName: a.originalName,
      contentType,
      size: a.size ?? null,
      viewUrl: view.url,
      downloadUrl: dl.url,
      expiresIn: view.expiresIn,
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

    return this.prisma.orderItemAsset.create({
      data: {
        orderItemId: itemId,
        storage: 's3',
        bucket: dto.bucket,
        key: dto.key,
        contentType: dto.contentType ?? null,
        size: dto.size ?? null,
        etag: dto.etag ?? null,
        originalName: dto.originalName ?? null,
        stage: 'ORIGINAL',
        primary: false,
      },
    });
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
    await this.prisma.orderItemAsset.deleteMany({
      where: { derivedFromId: src.id },
    });

    await this.ordersItemsService.changeApprovalStage(
      orderId,
      itemId,
      ApprovalStage.IN_PROGRESS,
      dto.userId,
    );

    await this.ordersItemsService.changeUserActionNeeded(orderId, itemId);

    return this.prisma.orderItemAsset.create({
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
      },
    });
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

      const byOriginal = new Map<string, OrderItemAsset | null>();

      for (const r of retouched) {
        if (!r.derivedFromId) continue;

        const existing = byOriginal.get(r.derivedFromId);

        if (!existing) {
          byOriginal.set(r.derivedFromId, r);
        } else if (!existing.primary && r.primary) {
          byOriginal.set(r.derivedFromId, r);
        } else {
        }
      }

      return Promise.all(
        originals.map(async (o) => {
          const r = byOriginal.get(o.id) ?? null;
          return {
            original: await this.toDtoWithUrls(o),
            retouch: r ? await this.toDtoWithUrls(r) : null,
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
