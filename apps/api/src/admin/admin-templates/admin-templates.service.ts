import { BadRequestException, Body, Injectable, Query } from '@nestjs/common';
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
    const take = 100;
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
        },
      }),
      this.prisma.template.count({ where }),
    ]);

    return { items, total, page: +page, pageSize: take };
  }

  async getById(id: string) {
    return this.prisma.template.findUnique({
      where: { id },
      include: {
        allowedSizes: { include: { size: true } },
        allowedHoles: { select: { pattern: true } },
        allowedFrames: { include: { frame: true } },
        allowedBackgrounds: { include: { background: true } },
        allowedFinishes: true,

        variants: true,
      },
    });
  }

  async createTemplate(dto: any) {
    // минимально необходимые поля по схеме
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

  async updateTemplate(id: string, dto: UpdateTemplateDto) {
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.template.update({
        where: { id },
        data: {
          code: dto.code ?? undefined,
          label: dto.label ?? undefined,
          material: dto.material ?? undefined,
          shape: dto.shape ?? undefined,
          orientation: dto.orientation ?? undefined,
          colorMode: dto.colorMode ?? undefined,
          coverage: dto.coverage ?? undefined,

          supportsFrame: dto.supportsFrame ?? undefined,
          requiresBackground: dto.requiresBackground ?? undefined,
          requiresFinish: dto.requiresFinish ?? undefined,
          supportsHoles: dto.supportsHoles ?? undefined,

          personsMin: dto.personsMin ?? undefined,
          personsMax: dto.personsMax ?? undefined,
          notes: dto.notes ?? undefined,

          // НОВОЕ поле шаблона:
          perHolePrice: dto.perHolePrice ?? undefined,
        },
        select: { id: true }, // вернём позже свежие данные одной выборкой
      });

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

  async deleteTemplate(id: string) {
    return this.prisma.template.delete({ where: { id } });
  }
}
