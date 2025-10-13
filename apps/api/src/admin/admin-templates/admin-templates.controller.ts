import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  Prisma,
  Finish as FinishEnum,
  HolePattern as HoleEnum,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminGuard } from '../../common/admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'node:path';
import * as fs from 'node:fs';

@UseGuards(AdminGuard)
@Controller('admin/templates')
export class AdminTemplatesController {
  constructor(private prisma: PrismaService) {}

  // ---------- REFS ----------
  @Get('refs')
  async refs() {
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

    const finishes = Object.values(FinishEnum); // ['MATTE','GLOSS']
    const holePatterns = Object.values(HoleEnum); // ['NONE','TWO_HORIZONTAL', ...]

    return { sizes, frames, backgrounds, finishes, holePatterns };
  }

  // ---------- LIST ----------
  @Get()
  async list(
    @Query('q') q?: string,
    @Query('sizeId') sizeId?: string,
    @Query('frameId') frameId?: string,
    @Query('backgroundId') backgroundId?: string,
    @Query('finish') finish?: string, // MATTE/GLOSS
    @Query('page') page = '1',
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

  // ---------- ONE ----------
  @Get(':id')
  async one(@Param('id') id: string) {
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

  // ---------- CREATE ----------
  @Post()
  async create(@Body() dto: any) {
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

  // ---------- UPDATE ----------
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: any) {
    return this.prisma.template.update({
      where: { id },
      data: {
        code: dto.code,
        label: dto.label,
        material: dto.material ?? undefined,
        shape: dto.shape ?? undefined,
        orientation: dto.orientation ?? undefined,
        colorMode: dto.colorMode ?? undefined,
        coverage: dto.coverage ?? undefined,
        supportsFrame: dto.supportsFrame ?? undefined,
        requiresBackground: dto.requiresBackground ?? undefined,
        requiresFinish: dto.requiresFinish ?? undefined,
        supportsHoles: dto.supportsHoles ?? undefined,
        personsMin:
          dto.personsMin !== undefined ? Number(dto.personsMin) : undefined,
        personsMax:
          dto.personsMax !== undefined ? Number(dto.personsMax) : undefined,
        notes: dto.notes ?? undefined,
      },
    });
  }

  // ---------- DELETE ----------
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.prisma.template.delete({ where: { id } });
  }

  // ---------- UPDATE ALLOWED (sizes/frames/backgrounds/finishes/holes + pricing) ----------
  // dto: {
  //   basePriceMinor?: number,
  //   sizeIds?: number[], frameIds?: number[], backgroundIds?: number[],
  //   finishes?: FinishEnum[], holePatterns?: HoleEnum[],
  //   sizeExtras?: Record<number, number>,
  //   frameExtras?: Record<number, number>,
  //   backgroundExtras?: Record<number, number>,
  //   finishExtras?: Partial<Record<FinishEnum, number>>,
  //   holeExtras?: Partial<Record<HoleEnum, number>>,
  // }
  @Patch(':id/allowed')
  async updateAllowed(
    @Param('id') id: string,
    @Body()
    dto: {
      basePriceMinor?: number;
      sizeIds?: number[];
      frameIds?: number[];
      backgroundIds?: number[];
      finishes?: FinishEnum[];
      holePatterns?: HoleEnum[];
      sizeExtras?: Record<number, number>;
      frameExtras?: Record<number, number>;
      backgroundExtras?: Record<number, number>;
      finishExtras?: Partial<Record<FinishEnum, number>>;
      holeExtras?: Partial<Record<HoleEnum, number>>;
    },
  ) {
    const ops: Prisma.PrismaPromise<any>[] = [];

    // 0) базовая цена шаблона
    if (dto.basePriceMinor !== undefined) {
      const val = Math.max(0, Math.trunc(dto.basePriceMinor));
      ops.push(
        this.prisma.template.update({
          where: { id },
          data: { basePriceMinor: val },
        }),
      );
    }

    // helper: нормализуем мапы надбавок
    const normNumMap = (m?: Record<number, number>) =>
      Object.entries(m ?? {}).map(([k, v]) => [
        Number(k),
        Math.max(0, Math.trunc(Number(v))),
      ]) as [number, number][];

    // 1) SIZES — синхронизация допуска + надбавки
    if (dto.sizeIds) {
      const ids = dto.sizeIds.map(Number);
      // удалить всё, чего нет в присланном списке
      ops.push(
        this.prisma.templateSize.deleteMany({
          where: { templateId: id, sizeId: { notIn: ids } },
        }),
      );
      // убедиться, что все переданные есть (createMany c skipDuplicates)
      if (ids.length) {
        ops.push(
          this.prisma.templateSize.createMany({
            data: ids.map((sizeId) => ({ templateId: id, sizeId })),
            skipDuplicates: true,
          }),
        );
      } else {
        // если список пуст — очищаем всё
        ops.push(
          this.prisma.templateSize.deleteMany({ where: { templateId: id } }),
        );
      }
    }
    if (dto.sizeExtras) {
      for (const [sizeId, extra] of normNumMap(dto.sizeExtras)) {
        ops.push(
          this.prisma.templateSize.upsert({
            where: { templateId_sizeId: { templateId: id, sizeId } },
            update: { extraPriceMinor: extra },
            create: { templateId: id, sizeId, extraPriceMinor: extra },
          }),
        );
      }
    }

    // 2) FRAMES
    if (dto.frameIds) {
      const ids = dto.frameIds.map(Number);
      ops.push(
        this.prisma.templateFrame.deleteMany({
          where: { templateId: id, frameId: { notIn: ids } },
        }),
      );
      if (ids.length) {
        ops.push(
          this.prisma.templateFrame.createMany({
            data: ids.map((frameId) => ({ templateId: id, frameId })),
            skipDuplicates: true,
          }),
        );
      } else {
        ops.push(
          this.prisma.templateFrame.deleteMany({ where: { templateId: id } }),
        );
      }
    }
    if (dto.frameExtras) {
      for (const [frameId, extra] of normNumMap(dto.frameExtras)) {
        ops.push(
          this.prisma.templateFrame.upsert({
            where: { templateId_frameId: { templateId: id, frameId } },
            update: { extraPriceMinor: extra },
            create: { templateId: id, frameId, extraPriceMinor: extra },
          }),
        );
      }
    }

    // 3) BACKGROUNDS
    if (dto.backgroundIds) {
      const ids = dto.backgroundIds.map(Number);
      ops.push(
        this.prisma.templateBackground.deleteMany({
          where: { templateId: id, backgroundId: { notIn: ids } },
        }),
      );
      if (ids.length) {
        ops.push(
          this.prisma.templateBackground.createMany({
            data: ids.map((backgroundId) => ({ templateId: id, backgroundId })),
            skipDuplicates: true,
          }),
        );
      } else {
        ops.push(
          this.prisma.templateBackground.deleteMany({
            where: { templateId: id },
          }),
        );
      }
    }
    if (dto.backgroundExtras) {
      for (const [backgroundId, extra] of normNumMap(dto.backgroundExtras)) {
        ops.push(
          this.prisma.templateBackground.upsert({
            where: {
              templateId_backgroundId: { templateId: id, backgroundId },
            },
            update: { extraPriceMinor: extra },
            create: { templateId: id, backgroundId, extraPriceMinor: extra },
          }),
        );
      }
    }

    // 4) FINISHES (enum)
    if (dto.finishes) {
      const list = dto.finishes;
      ops.push(
        this.prisma.templateFinish.deleteMany({
          where: { templateId: id, finish: { notIn: list } },
        }),
      );
      if (list.length) {
        ops.push(
          this.prisma.templateFinish.createMany({
            data: list.map((finish) => ({ templateId: id, finish })),
            skipDuplicates: true,
          }),
        );
      } else {
        ops.push(
          this.prisma.templateFinish.deleteMany({ where: { templateId: id } }),
        );
      }
    }
    if (dto.finishExtras) {
      for (const key of Object.keys(dto.finishExtras) as FinishEnum[]) {
        const extra = Math.max(0, Math.trunc(Number(dto.finishExtras[key])));
        ops.push(
          this.prisma.templateFinish.upsert({
            where: { templateId_finish: { templateId: id, finish: key } },
            update: { extraPriceMinor: extra },
            create: { templateId: id, finish: key, extraPriceMinor: extra },
          }),
        );
      }
    }

    // 5) HOLE PATTERNS (enum)
    if (dto.holePatterns) {
      const list = dto.holePatterns;
      ops.push(
        this.prisma.templateHole.deleteMany({
          where: { templateId: id, pattern: { notIn: list } },
        }),
      );
      if (list.length) {
        ops.push(
          this.prisma.templateHole.createMany({
            data: list.map((pattern) => ({ templateId: id, pattern })),
            skipDuplicates: true,
          }),
        );
      } else {
        ops.push(
          this.prisma.templateHole.deleteMany({ where: { templateId: id } }),
        );
      }
    }
    if (dto.holeExtras) {
      for (const key of Object.keys(dto.holeExtras) as HoleEnum[]) {
        const extra = Math.max(0, Math.trunc(Number(dto.holeExtras[key])));
        ops.push(
          this.prisma.templateHole.upsert({
            where: { templateId_pattern: { templateId: id, pattern: key } },
            update: { extraPriceMinor: extra },
            create: { templateId: id, pattern: key, extraPriceMinor: extra },
          }),
        );
      }
    }

    await this.prisma.$transaction(ops);
    return { ok: true };
  }

  // ---------- PREVIEW UPLOAD (в БД нет поля — просто сохраняем и возвращаем путь) ----------
  @Post(':id/preview')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, _file, cb) => {
          const dir = path.join(
            process.cwd(),
            'uploads',
            'templates',
            req.params.id,
          );
          fs.mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname) || '.jpg';
          cb(null, 'preview' + ext);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadPreview(
    @Param('id') id: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file');
    const rel = `/uploads/templates/${id}/${file.filename}`;
    return { ok: true, path: rel };
  }
}
