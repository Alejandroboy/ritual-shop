import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssetKind } from '@prisma/client';

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async attachAssetsToItem(
    itemId: string,
    orderId: string,
    files: Express.Multer.File[],
  ) {
    const item = await this.prisma.orderItem.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Order item not found');
    if (!files?.length) return { ok: true, count: 0 };

    try {
      await this.prisma.asset.createMany({
        data: files.map((f) => ({
          itemId: itemId, // ВАЖНО: поле связи из твоей модели Asset
          kind: AssetKind.PHOTO,
          filename: f.filename,
          url: `/uploads/orders/${orderId}/${itemId}/${f.filename}`,
          mime: f.mimetype,
          size: f.size,
        })),
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
