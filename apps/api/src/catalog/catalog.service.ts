import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ListTemplatesQuery } from './dto/list-templates.dto';

const templateSelect = {
  id: true,
  code: true,
  label: true,
  material: true,
  shape: true,
  orientation: true,
  colorMode: true,
  coverage: true,
};
@Injectable()
export class CatalogService {
  constructor(private prisma: PrismaService) {}

  async listTemplates(q: ListTemplatesQuery) {
    try {
      const page = Math.max(1, Number(q.page ?? 1));
      const pageSize = Math.max(1, Number(q.pageSize ?? 12));

      const where = {
        material: q.material,
        shape: q.shape,
        orientation: q.orientation,
        colorMode: q.colorMode,
        coverage: q.coverage,
      };

      const skip = (page - 1) * pageSize;
      const take = pageSize;

      const [total, items] = await this.prisma.$transaction([
        this.prisma.template.count({ where }),
        this.prisma.template.findMany({
          where,
          select: templateSelect,
          orderBy: { [q.orderBy]: q.order },
          skip,
          take,
        }),
      ]);

      return {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        items,
      };
    } catch (e) {
      console.error('listTemplates failed:', e);
      throw e;
    }
  }

  async getDictionaries() {
    const [sizes, frames, backgrounds, finishVariants] =
      await this.prisma.$transaction([
        this.prisma.size.findMany({
          orderBy: [{ heightCm: 'asc' }, { widthCm: 'asc' }],
        }),
        this.prisma.frame.findMany({ orderBy: { code: 'asc' } }),
        this.prisma.background.findMany({ orderBy: { code: 'asc' } }),
        this.prisma.finishVariant.findMany({ orderBy: { code: 'asc' } }),
      ]);
    return { sizes, frames, backgrounds, finishVariants };
  }

  getEnums() {
    const Material = [
      'CERMET',
      'WHITE_CERAMIC_GRANITE',
      'BLACK_CERAMIC_GRANITE',
      'GLASS',
      'GROWTH_PHOTOCERAMICS',
      'ENGRAVING',
    ] as const;
    const Shape = ['RECTANGLE', 'OVAL', 'ARCH', 'STAR', 'HEART'] as const;
    const Orientation = ['VERTICAL', 'HORIZONTAL'] as const;
    const ColorMode = ['BW', 'COLOR'] as const;
    const Coverage = ['NORMAL', 'FULL_WRAP'] as const;
    const HolePattern = [
      'NONE',
      'TWO_HORIZONTAL',
      'TWO_VERTICAL',
      'FOUR_CORNERS',
    ] as const;
    const Finish = ['MATTE', 'GLOSS'] as const;

    return {
      Material,
      Shape,
      Orientation,
      ColorMode,
      Coverage,
      HolePattern,
      Finish,
    };
  }

  async getTemplate(code: string) {
    const tpl = await this.prisma.template.findUnique({
      where: { code },
      select: {
        id: true,
        code: true,
        label: true,
        material: true,
        shape: true,
        orientation: true,
        colorMode: true,
        coverage: true,
        supportsFrame: true,
        requiresBackground: true,
        requiresFinish: true,
        supportsHoles: true,
        personsMin: true,
        personsMax: true,
        notes: true,
        allowedSizes: {
          select: {
            size: {
              select: { id: true, label: true, widthCm: true, heightCm: true },
            },
          },
        },
        allowedHoles: { select: { pattern: true } },
        allowedFrames: {
          select: { frame: { select: { id: true, code: true, name: true } } },
        },
        allowedBackgrounds: {
          select: {
            background: { select: { id: true, code: true, name: true } },
          },
        },
        variants: {
          select: {
            holePattern: true,
            finishRequired: true,
            allowedFinishes: {
              select: {
                finish: { select: { id: true, code: true, label: true } },
              },
            },
          },
        },
      },
    });

    if (!tpl) throw new NotFoundException('Template not found');
    console.log('tpl', tpl);

    // лёгкий маппинг для фронта
    return {
      ...tpl,
      sizes: tpl.allowedSizes.map((x) => x.size),
      holes: tpl.allowedHoles.map((x) => x.pattern),
      frames: tpl.allowedFrames.map((x) => x.frame),
      backgrounds: tpl.allowedBackgrounds.map((x) => x.background),
      variants: tpl.variants.map((v) => ({
        holePattern: v.holePattern,
        finishRequired: v.finishRequired,
        finishes: v.allowedFinishes.map((f) => f.finish),
      })),
      // можно подсказать дефолты
      defaults: {
        sizeId: tpl.allowedSizes[0]?.size.id ?? null,
        holePattern: tpl.allowedHoles[0]?.pattern ?? null,
        frameId: tpl.allowedFrames[0]?.frame.id ?? null,
        backgroundId: tpl.allowedBackgrounds[0]?.background.id ?? null,
      },
    };
  }
}
