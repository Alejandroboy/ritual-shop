import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetKind, Prisma, $Enums } from '@prisma/client';
type IncomingFile = {
  filename: string;
  url?: string; // может быть S3-ссылка или локальный путь
  mime?: string;
  size?: number;
  bucket?: string;
  key?: string;
};

// парсер вытаскивает bucket/key из URL (Timeweb S3)
function parseS3Url(urlStr?: string): { bucket?: string; key?: string } {
  if (!urlStr) return {};
  try {
    const u = new URL(urlStr);
    // https://s3.twcstorage.ru/<bucket>/<key...>
    if (u.hostname === 's3.twcstorage.ru') {
      const [, bucket, ...rest] = u.pathname.split('/');
      if (bucket && rest.length) return { bucket, key: rest.join('/') };
    }
    // https://<bucket>.s3.twcstorage.ru/<key...>
    const m = u.hostname.match(/^(.+)\.s3\.twcstorage\.ru$/);
    if (m) {
      const bucket = m[1];
      const key = u.pathname.replace(/^\/+/, '');
      if (bucket && key) return { bucket, key };
    }
    return {};
  } catch {
    return {};
  }
}

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async attachAssetsToItem(
    itemId: string,
    orderId: string,
    files: Express.Multer.File[],
  ) {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    console.log('order attachAssetsToItem', order);
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Order item not found');
    if (!files?.length) return { ok: true, count: 0 };
    console.log('item', item);

    try {
      const data: Prisma.OrderItemAssetCreateManyInput[] = (
        files as IncomingFile[]
      ).map((f) => {
        // приоритет: явные bucket/key → парс из url → пусто
        const bk =
          f.bucket || f.key
            ? { bucket: f.bucket, key: f.key }
            : parseS3Url(f.url);

        return {
          orderItemId: itemId, // ← ОБЯЗАТЕЛЬНО: orderItemId, не itemId
          kind: $Enums.AssetKind.PHOTO, // enum из Prisma v6
          originalName: f.filename ?? null, // раньше было filename → теперь originalName
          contentType: f.mime ?? null, // mime → contentType
          size: typeof f.size === 'number' ? f.size : null,
          bucket: bk.bucket ?? undefined, // если не S3 — можно оставить undefined
          key: bk.key ?? undefined, // если остался локальный путь — не проставляем key
          // Если тебе нужно сохранить локальный путь для обратной совместимости:
          // path: f.url?.startsWith('/') ? f.url : undefined,
        };
      });
    } catch (e) {
      console.log('asset.createMany e', e);
    }

    return {
      ok: true,
      count: files.length,
      dir: `/uploads/orders/${orderId}/${itemId}/`,
    };
  }
}
