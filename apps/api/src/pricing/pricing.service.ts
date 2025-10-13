import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Finish, HolePattern } from '@prisma/client';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async calcItemPrice(opts: {
    templateId: string;
    sizeId?: number | null;
    frameId?: number | null;
    backgroundId?: number | null;
    finish?: Finish | null;
    holePattern?: HolePattern | null;
  }): Promise<number> {
    const t = await this.prisma.template.findUnique({
      where: { id: opts.templateId },
      select: { basePriceMinor: true },
    });
    let sum = t?.basePriceMinor ?? 0;

    if (opts.sizeId) {
      const r = await this.prisma.templateSize.findUnique({
        where: {
          templateId_sizeId: {
            templateId: opts.templateId,
            sizeId: Number(opts.sizeId),
          },
        },
        select: { extraPriceMinor: true },
      });
      sum += r?.extraPriceMinor ?? 0;
    }

    if (opts.frameId) {
      const r = await this.prisma.templateFrame.findUnique({
        where: {
          templateId_frameId: {
            templateId: opts.templateId,
            frameId: Number(opts.frameId),
          },
        },
        select: { extraPriceMinor: true },
      });
      sum += r?.extraPriceMinor ?? 0;
    }

    if (opts.backgroundId) {
      const r = await this.prisma.templateBackground.findUnique({
        where: {
          templateId_backgroundId: {
            templateId: opts.templateId,
            backgroundId: Number(opts.backgroundId),
          },
        },
        select: { extraPriceMinor: true },
      });
      sum += r?.extraPriceMinor ?? 0;
    }

    if (opts.finish) {
      const r = await this.prisma.templateFinish.findUnique({
        where: {
          templateId_finish: {
            templateId: opts.templateId,
            finish: opts.finish,
          },
        },
        select: { extraPriceMinor: true },
      });
      sum += r?.extraPriceMinor ?? 0;
    }

    if (opts.holePattern) {
      const r = await this.prisma.templateHole.findUnique({
        where: {
          templateId_pattern: {
            templateId: opts.templateId,
            pattern: opts.holePattern,
          },
        },
        select: { extraPriceMinor: true },
      });
      sum += r?.extraPriceMinor ?? 0;
    }

    return sum < 0 ? 0 : sum;
  }

  async recalcOrderTotals(orderId: string) {
    const items = await this.prisma.orderItem.findMany({ where: { orderId } });
    const total = items.reduce((s, i) => s + (i.unitPriceMinor ?? 0), 0);
    await this.prisma.order.update({
      where: { id: orderId },
      data: { totalMinor: total },
    });
    return total;
  }
}
