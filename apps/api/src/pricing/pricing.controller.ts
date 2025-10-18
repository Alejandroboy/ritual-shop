import {
  Material,
  Shape,
  ColorMode,
  Finish as FinishEnum,
  HolePattern as HoleEnum,
  Prisma,
} from '@prisma/client';
import {
  BadRequestException,
  Body,
  Controller,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

@Controller('pricing')
export class PricingController {
  constructor(private prisma: PrismaService) {}
  @Patch('bulk')
  async bulkPricing(
    @Body()
    dto: {
      filter?: {
        ids?: string[];
        q?: string;
        material?: Material;
        shape?: Shape;
        colorMode?: ColorMode;
        supportsFrame?: boolean;
        requiresBackground?: boolean;
        requiresFinish?: boolean;
      };
      set?: { basePriceMinor?: number };
      sizeExtra?: {
        sizeId: number;
        extraPriceMinor: number;
        mode?: 'set' | 'inc';
      };
      frameExtra?: {
        frameId: number;
        extraPriceMinor: number;
        mode?: 'set' | 'inc';
      };
      backgroundExtra?: {
        backgroundId: number;
        extraPriceMinor: number;
        mode?: 'set' | 'inc';
      };
      finishExtra?: {
        finish: FinishEnum;
        extraPriceMinor: number;
        mode?: 'set' | 'inc';
      };
      holeExtra?: {
        pattern: HoleEnum;
        extraPriceMinor: number;
        mode?: 'set' | 'inc';
      };
    },
  ) {
    const where: Prisma.TemplateWhereInput = {};
    const f = dto.filter ?? {};
    if (f.ids?.length) where.id = { in: f.ids };
    if (f.q)
      where.OR = [{ code: { contains: f.q } }, { label: { contains: f.q } }];
    if (f.material) where.material = f.material;
    if (f.shape) where.shape = f.shape;
    if (f.colorMode) where.colorMode = f.colorMode;
    if (typeof f.supportsFrame === 'boolean')
      where.supportsFrame = f.supportsFrame;
    if (typeof f.requiresBackground === 'boolean')
      where.requiresBackground = f.requiresBackground;
    if (typeof f.requiresFinish === 'boolean')
      where.requiresFinish = f.requiresFinish;

    const templates = await this.prisma.template.findMany({
      where,
      select: { id: true },
    });
    if (!templates.length) return { ok: true, affected: 0 };
    const ids = templates.map((t) => t.id);
    const ops: Prisma.PrismaPromise<any>[] = [];

    if (dto.set?.basePriceMinor !== undefined) {
      const val = Math.max(0, Math.trunc(dto.set.basePriceMinor));
      ops.push(
        this.prisma.template.updateMany({
          where: { id: { in: ids } },
          data: { basePriceMinor: val },
        }),
      );
    }

    const applyExtra = (
      mode: 'set' | 'inc',
      current: number | undefined,
      incoming: number,
    ) =>
      mode === 'inc'
        ? Math.max(0, (current ?? 0) + incoming)
        : Math.max(0, incoming);

    if (dto.sizeExtra) {
      const { sizeId, extraPriceMinor, mode = 'set' } = dto.sizeExtra;
      for (const id of ids) {
        const curr = await this.prisma.templateSize.findUnique({
          where: {
            templateId_sizeId: { templateId: id, sizeId: Number(sizeId) },
          },
          select: { extraPriceMinor: true },
        });
        const val = applyExtra(
          mode,
          curr?.extraPriceMinor,
          Math.trunc(extraPriceMinor),
        );
        ops.push(
          this.prisma.templateSize.upsert({
            where: {
              templateId_sizeId: { templateId: id, sizeId: Number(sizeId) },
            },
            update: { extraPriceMinor: val },
            create: {
              templateId: id,
              sizeId: Number(sizeId),
              extraPriceMinor: val,
            },
          }),
        );
      }
    }

    if (dto.frameExtra) {
      const { frameId, extraPriceMinor, mode = 'set' } = dto.frameExtra;
      for (const id of ids) {
        const curr = await this.prisma.templateFrame.findUnique({
          where: {
            templateId_frameId: { templateId: id, frameId: Number(frameId) },
          },
          select: { extraPriceMinor: true },
        });
        const val = applyExtra(
          mode,
          curr?.extraPriceMinor,
          Math.trunc(extraPriceMinor),
        );
        ops.push(
          this.prisma.templateFrame.upsert({
            where: {
              templateId_frameId: { templateId: id, frameId: Number(frameId) },
            },
            update: { extraPriceMinor: val },
            create: {
              templateId: id,
              frameId: Number(frameId),
              extraPriceMinor: val,
            },
          }),
        );
      }
    }

    if (dto.backgroundExtra) {
      const {
        backgroundId,
        extraPriceMinor,
        mode = 'set',
      } = dto.backgroundExtra;
      for (const id of ids) {
        const curr = await this.prisma.templateBackground.findUnique({
          where: {
            templateId_backgroundId: {
              templateId: id,
              backgroundId: Number(backgroundId),
            },
          },
          select: { extraPriceMinor: true },
        });
        const val = applyExtra(
          mode,
          curr?.extraPriceMinor,
          Math.trunc(extraPriceMinor),
        );
        ops.push(
          this.prisma.templateBackground.upsert({
            where: {
              templateId_backgroundId: {
                templateId: id,
                backgroundId: Number(backgroundId),
              },
            },
            update: { extraPriceMinor: val },
            create: {
              templateId: id,
              backgroundId: Number(backgroundId),
              extraPriceMinor: val,
            },
          }),
        );
      }
    }

    if (dto.finishExtra) {
      const { finish, extraPriceMinor, mode = 'set' } = dto.finishExtra;
      for (const id of ids) {
        const curr = await this.prisma.templateFinish.findUnique({
          where: { templateId_finish: { templateId: id, finish } },
          select: { extraPriceMinor: true },
        });
        const val = applyExtra(
          mode,
          curr?.extraPriceMinor,
          Math.trunc(extraPriceMinor),
        );
        ops.push(
          this.prisma.templateFinish.upsert({
            where: { templateId_finish: { templateId: id, finish } },
            update: { extraPriceMinor: val },
            create: { templateId: id, finish, extraPriceMinor: val },
          }),
        );
      }
    }

    if (dto.holeExtra) {
      const { pattern, extraPriceMinor, mode = 'set' } = dto.holeExtra;
      for (const id of ids) {
        const curr = await this.prisma.templateHole.findUnique({
          where: { templateId_pattern: { templateId: id, pattern } },
          select: { extraPriceMinor: true },
        });
        const val = applyExtra(
          mode,
          curr?.extraPriceMinor,
          Math.trunc(extraPriceMinor),
        );
        ops.push(
          this.prisma.templateHole.upsert({
            where: { templateId_pattern: { templateId: id, pattern } },
            update: { extraPriceMinor: val },
            create: { templateId: id, pattern, extraPriceMinor: val },
          }),
        );
      }
    }

    await this.prisma.$transaction(ops);
    return { ok: true, affected: ids.length };
  }

  @Post('pricingimport')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async importPricing(@UploadedFile() file?: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file');
    const text = Buffer.from(file.buffer).toString('utf8');
    const rows = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    const [header, ...data] = rows;
    const cols = header.split(/[,;\t]/).map((c) => c.trim().toLowerCase());

    const ops: Prisma.PrismaPromise<any>[] = [];
    for (const line of data) {
      const parts = line.split(/[,;\t]/);
      const rec: Record<string, string> = {};
      cols.forEach((c, i) => (rec[c] = (parts[i] ?? '').trim()));
      const code = rec['code'];
      if (!code) continue;

      const tpl = await this.prisma.template.findUnique({
        where: { code },
        select: { id: true },
      });
      if (!tpl) continue;
      const id = tpl.id;

      if (rec['basepriceminor']) {
        const v = Math.max(0, Math.trunc(Number(rec['basepriceminor'])));
        ops.push(
          this.prisma.template.update({
            where: { id },
            data: { basePriceMinor: v },
          }),
        );
      }

      for (const [k, vRaw] of Object.entries(rec)) {
        const v = Math.max(0, Math.trunc(Number(vRaw)));
        if (!Number.isFinite(v) || v <= 0) continue;

        if (k.startsWith('size:')) {
          const sizeId = Number(k.split(':')[1]);
          ops.push(
            this.prisma.templateSize.upsert({
              where: { templateId_sizeId: { templateId: id, sizeId } },
              update: { extraPriceMinor: v },
              create: { templateId: id, sizeId, extraPriceMinor: v },
            }),
          );
        } else if (k.startsWith('frame:')) {
          const frameId = Number(k.split(':')[1]);
          ops.push(
            this.prisma.templateFrame.upsert({
              where: { templateId_frameId: { templateId: id, frameId } },
              update: { extraPriceMinor: v },
              create: { templateId: id, frameId, extraPriceMinor: v },
            }),
          );
        } else if (k.startsWith('background:')) {
          const backgroundId = Number(k.split(':')[1]);
          ops.push(
            this.prisma.templateBackground.upsert({
              where: {
                templateId_backgroundId: { templateId: id, backgroundId },
              },
              update: { extraPriceMinor: v },
              create: { templateId: id, backgroundId, extraPriceMinor: v },
            }),
          );
        } else if (k.startsWith('finish:')) {
          const finish = k.split(':')[1].toUpperCase() as FinishEnum;
          ops.push(
            this.prisma.templateFinish.upsert({
              where: { templateId_finish: { templateId: id, finish } },
              update: { extraPriceMinor: v },
              create: { templateId: id, finish, extraPriceMinor: v },
            }),
          );
        } else if (k.startsWith('hole:')) {
          const pattern = k.split(':')[1].toUpperCase() as HoleEnum;
          ops.push(
            this.prisma.templateHole.upsert({
              where: { templateId_pattern: { templateId: id, pattern } },
              update: { extraPriceMinor: v },
              create: { templateId: id, pattern, extraPriceMinor: v },
            }),
          );
        }
      }
    }

    await this.prisma.$transaction(ops);
    return { ok: true, updated: ops.length };
  }
}
