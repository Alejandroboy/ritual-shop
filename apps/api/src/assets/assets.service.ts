import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { S3Service } from '../s3/s3.service';
import { OrderItemAsset, StorageType } from '@prisma/client';

export type AssetDto = {
  id: string;
  kind: string;
  originalName?: string | null;
  contentType?: string | null;
  size?: number | null;
  viewUrl: string;
  downloadUrl: string;
  expiresIn: number;
};

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  private async assertItemBelongsToOrder(orderId: string, itemId: string) {
    const item = await this.prisma.orderItem.findFirst({
      where: { id: itemId, orderId },
      select: { id: true },
    });
    if (!item)
      throw new NotFoundException('Order item not found for this order');
  }

  async createFromS3(orderId: string, itemId: string, dto: CreateAssetDto) {
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
      },
    });
  }

  async list(orderId: string, itemId: string) {
    await this.assertItemBelongsToOrder(orderId, itemId);
    return this.prisma.orderItemAsset.findMany({
      where: { orderItemId: itemId },
      orderBy: { createdAt: 'desc' },
    });
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

  async toDtoWithUrls(a: OrderItemAsset): Promise<AssetDto> {
    if (a.storage !== StorageType.s3) {
      const base = process.env.UPLOADS_PUBLIC_BASE ?? '';
      const path = `${base}/${a.path}`;
      return {
        id: a.id,
        kind: a.kind,
        originalName: a.originalName,
        contentType: a.contentType,
        size: a.size ?? null,
        viewUrl: path,
        downloadUrl: path,
        expiresIn: 24 * 3600,
      };
    }

    const view = await this.s3.signGet(
      { bucket: a.bucket, key: a.key },
      { contentType: a.contentType },
    );
    const dl = await this.s3.signGet(
      { bucket: a.bucket, key: a.key },
      { downloadName: a.originalName ?? 'file', contentType: a.contentType },
    );

    return {
      id: a.id,
      kind: a.kind,
      originalName: a.originalName,
      contentType: a.contentType,
      size: a.size ?? null,
      viewUrl: view.url,
      downloadUrl: dl.url,
      expiresIn: view.expiresIn,
    };
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
