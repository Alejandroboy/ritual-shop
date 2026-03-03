import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Finish as FinishEnum,
  HolePattern as HoleEnum,
  Prisma,
} from '@prisma/client';
import { UpdateTemplateDto } from './update-template.dto';

@Injectable()
export class AdminTemplatesService {
  constructor(private prisma: PrismaService) {}

  async getRefs() {
    const [sizes, frames, backgrounds] = await Promise.all([
      this.prisma.size
        .findMany({ orderBy: [{ label: 'asc' as const }] })
        .catch(() => []),
      this.prisma.frame
        .findMany({ orderBy: [{ code: 'asc' as const }] })
        .catch(() => []),
      this.prisma.background
        .findMany({ orderBy: [{ code: 'asc' as const }] })
        .catch(() => []),
    ]);

    const finishes = Object.values(FinishEnum);
    const holePatterns = Object.values(HoleEnum);

    return { sizes, frames, backgrounds, finishes, holePatterns };
  }

  async getList(
    page,
    q?: string,
    sizeId?: string,
    frameId?: string,
    backgroundId?: string,
    finish?: string,
  ) {
    const take = 300;
    const skip = (parseInt(page) - 1) * take;

    const where: Prisma.TemplateWhereInput = {};
    if (q) where.OR = [{ code: { contains: q } }, { label: { contains: q } }];

    if (sizeId) where.allowedSizes = { some: { sizeId: Number(sizeId) } };
    if (frameId) where.allowedFrames = { some: { frameId: Number(frameId) } };
    if (backgroundId)
      where.allowedBackgrounds = {
        some: { backgroundId: Number(backgroundId) },
      };
    if (finish) {
      const fin = String(finish).toUpperCase() as FinishEnum;
      if (Object.values(FinishEnum).includes(fin)) {
        where.allowedFinishes = { some: { finish: fin } };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.template.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        include: {
          allowedSizes: { include: { size: true } },
          allowedFrames: { include: { frame: true } },
          allowedBackgrounds: { include: { background: true } },
          allowedFinishes: true,
          variants: true,
          finishPrices: {
            select: {
              price: true,
              finish: true,
              sizeId: true,
            },
          },
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return { items, total, page: +page, pageSize: take };
  }

  async getById(id: number) {
    return this.prisma.template.findUnique({
      where: { id },
      include: {
        allowedSizes: { include: { size: true } },
        allowedHoles: { select: { pattern: true } },
        allowedFrames: { include: { frame: true } },
        allowedBackgrounds: { include: { background: true } },
        allowedFinishes: true,
        finishPrices: {
          select: {
            price: true,
            finish: true,
            sizeId: true,
          },
        },
        variants: true,
      },
    });
  }

  async createTemplate(dto: any) {
    const required = ['code', 'label', 'material', 'shape', 'colorMode'];
    for (const k of required)
      if (dto[k] === undefined) {
        throw new BadRequestException(`Required field: ${k}`);
      }

    return this.prisma.template.create({
      data: {
        code: dto.code,
        label: dto.label,
        material: dto.material, // ожидаются enum-строки, см. schema
        shape: dto.shape,
        colorMode: dto.colorMode,
        orientation: dto.orientation ?? null,
        coverage: dto.coverage ?? undefined,
        supportsFrame: dto.supportsFrame ?? false,
        requiresBackground: dto.requiresBackground ?? false,
        requiresFinish: dto.requiresFinish ?? false,
        supportsHoles: dto.supportsHoles ?? true,
        personsMin: dto.personsMin ?? 1,
        personsMax: dto.personsMax ?? 1,
        notes: dto.notes ?? null,
      },
    });
  }

  async updateTemplate(id: number, dto: UpdateTemplateDto) {
    return this.prisma.$transaction(async (tx) => {
      if (dto.sizePrices && typeof dto.sizePrices === 'object') {
        for (const [sizeIdStr, sizePrice] of Object.entries(dto.sizePrices)) {
          const sizeId = Number(sizeIdStr);
          const price = Number(sizePrice);
          if (!Number.isFinite(sizeId) || !Number.isFinite(price) || price < 0)
            continue;

          await tx.templateSize.upsert({
            where: { templateId_sizeId: { templateId: id, sizeId } },
            update: { price },
            create: { templateId: id, sizeId, price },
          });
        }
      }

      if (
        dto.finishPricesBySizeId &&
        typeof dto.finishPricesBySizeId === 'object'
      ) {
        for (const [sizeIdStr, perFinish] of Object.entries(
          dto.finishPricesBySizeId,
        )) {
          const sizeId = Number(sizeIdStr);
          if (!Number.isFinite(sizeId)) continue;
          if (!perFinish || typeof perFinish !== 'object') continue;

          for (const [finishStr, priceVal] of Object.entries(perFinish)) {
            const price = Number(priceVal);
            if (!Number.isFinite(price) || price < 0) continue;

            if (finishStr !== 'MATTE' && finishStr !== 'GLOSS') continue;

            await tx.templateSizeFinishPrice.upsert({
              where: {
                templateId_sizeId_finish: {
                  templateId: id,
                  sizeId,
                  finish: finishStr as any,
                },
              },
              update: { price },
              create: {
                templateId: id,
                sizeId,
                finish: finishStr as any,
                price,
              },
            });
          }
        }
      }

      return tx.template.findUnique({
        where: { id },
        include: {
          allowedSizes: true,
          allowedHoles: true,
          allowedFrames: true,
          allowedBackgrounds: true,
          allowedFinishes: true,
          variants: { include: { allowedFinishes: true } },
        },
      });
    });
  }

  async deleteTemplate(id: number) {
    return this.prisma.template.delete({ where: { id } });
  }
}
