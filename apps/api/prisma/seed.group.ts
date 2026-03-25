import 'dotenv/config';
import {
  PrismaClient,
  Material,
  Coverage,
  HolePattern,
  Finish,
} from '@prisma/client';
import { metalOvalHorTemplates } from './templates/cermet-oval-horizontal.ts';
import { metalOvalVertTemplates } from './templates/cermet-oval-vertical.ts';
import { metalRectVertTemplates } from './templates/cermet-rectangle-vertical.ts';
import { metalRectHorTemplates } from './templates/cermet-rectangle-horizontal.ts';
import { metalFullTemplates } from './templates/cermet-full-cover.ts';
import { starTemplates } from './templates/cermet-star.ts';
import { archMetalTemplates } from './templates/cermet-arch.ts';
import { heartTemplates } from './templates/cermet-heart.ts';
import {
  whiteExtra,
  whiteRectTemplates,
} from './templates/white-ceramo-granite-rectangle.ts';
import { whiteOvalTemplates } from './templates/white-ceramo-granite-oval.ts';
import { whiteArchTemplates } from './templates/white-ceramo-granite-arch.ts';
import {
  growthHorizontal,
  growthVertical,
} from './templates/growth-photoceramic.ts';
import { glassRectTemplates } from './templates/glass-rectangle.ts';
import { glassOvalTemplates } from './templates/glass-oval.ts';
import { glassArchTemplates } from './templates/glass-arch.ts';
import { blackSingleTemplates } from './templates/black-ceramo-granite-single.ts';
import { blackCoupleTemplates } from './templates/black-ceramo-granite-couples.ts';
import { blackTextTemplates } from './templates/black-ceramo-granite-rectangle.ts';
import { engravingTemplates } from './templates/engrave.ts';
import { type TemplateConfig } from './templates/shared.ts';

import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

const ALL_HOLES: HolePattern[] = [
  HolePattern.NONE,
  HolePattern.TWO_HORIZONTAL,
  HolePattern.TWO_VERTICAL,
  HolePattern.FOUR_CORNERS,
];

async function syncTemplateSizes(templateId: number, cfg: TemplateConfig) {
  const defaultHoles = cfg.holePatterns ?? [HolePattern.NONE];
  const defaultPrice = cfg.basePrice ?? 0;

  if (!cfg.sizeLabels.length) {
    await prisma.templateSize.deleteMany({
      where: { templateId },
    });
    return;
  }

  const sizes = await prisma.size.findMany({
    where: { label: { in: cfg.sizeLabels } },
  });

  const desiredSizeIds = sizes.map((s) => s.id);

  await prisma.templateSize.deleteMany({
    where: {
      templateId,
      sizeId: { notIn: desiredSizeIds },
    },
  });

  for (const s of sizes) {
    const data = {
      availableHolePattern: cfg.sizeHolePatterns?.[s.label] ?? defaultHoles,
      price: cfg.sizePrice?.[s.label] ?? defaultPrice,
      skuCode: cfg.skuCodes?.[s.label] ?? null,
    };

    await prisma.templateSize.upsert({
      where: {
        templateId_sizeId: {
          templateId,
          sizeId: s.id,
        },
      },
      update: data,
      create: {
        templateId,
        sizeId: s.id,
        ...data,
      },
    });
  }
}

async function syncTemplateSizeFinishPrices(
  templateId: number,
  cfg: TemplateConfig,
) {
  const finishes = cfg.finishes ?? [];

  if (!finishes.length || !cfg.sizeFinishPrice) {
    await prisma.templateSizeFinishPrice.deleteMany({
      where: { templateId },
    });
    return;
  }

  const sizes = await prisma.size.findMany({
    where: { label: { in: cfg.sizeLabels } },
  });

  const desiredKeys = new Set<string>();

  for (const s of sizes) {
    const pricePerFinish = cfg.sizeFinishPrice[s.label];
    const skuCodePerFinish = cfg.skuCodesFinish && cfg.skuCodesFinish[s.label];

    if (!pricePerFinish) continue;

    for (const finish of finishes) {
      const price = pricePerFinish[finish];
      if (price == null) continue;

      desiredKeys.add(`${s.id}:${finish}`);

      const data = {
        price,
        skuCode: skuCodePerFinish?.[finish] ?? '',
      };

      const existing = await prisma.templateSizeFinishPrice.findUnique({
        where: {
          templateId_sizeId_finish: {
            templateId,
            sizeId: s.id,
            finish,
          },
        },
      });

      if (existing) {
        await prisma.templateSizeFinishPrice.update({
          where: {
            templateId_sizeId_finish: {
              templateId,
              sizeId: s.id,
              finish,
            },
          },
          data,
        });
      } else {
        await prisma.templateSizeFinishPrice.create({
          data: {
            templateId,
            sizeId: s.id,
            finish,
            ...data,
          },
        });
      }
    }
  }

  const existingRows = await prisma.templateSizeFinishPrice.findMany({
    where: { templateId },
    select: { sizeId: true, finish: true },
  });

  const rowsToDelete = existingRows.filter(
    (row) => !desiredKeys.has(`${row.sizeId}:${row.finish}`),
  );

  for (const row of rowsToDelete) {
    await prisma.templateSizeFinishPrice.delete({
      where: {
        templateId_sizeId_finish: {
          templateId,
          sizeId: row.sizeId,
          finish: row.finish,
        },
      },
    });
  }
}

async function replaceTemplateHoles(
  templateId: number,
  patterns: HolePattern[],
) {
  await prisma.templateHole.deleteMany({
    where: { templateId },
  });

  if (!patterns.length) return;

  await prisma.templateHole.createMany({
    data: patterns.map((pattern) => ({
      templateId,
      pattern,
    })),
    skipDuplicates: true,
  });
}

async function replaceTemplateFrames(templateId: number, frameIds: number[]) {
  await prisma.templateFrame.deleteMany({
    where: { templateId },
  });

  if (!frameIds.length) return;

  await prisma.templateFrame.createMany({
    data: frameIds.map((frameId) => ({
      templateId,
      frameId,
    })),
    skipDuplicates: true,
  });
}

async function replaceTemplateGoldTypes(
  templateId: number,
  goldTypes: string[],
) {
  await prisma.templateGoldType.deleteMany({
    where: { templateId },
  });

  if (!goldTypes.length) return;

  await prisma.templateGoldType.createMany({
    data: goldTypes.map((goldType) => ({
      templateId,
      goldType,
    })),
    skipDuplicates: true,
  });
}

async function replaceTemplateBackgrounds(
  templateId: number,
  backgroundIds: number[],
) {
  await prisma.templateBackground.deleteMany({
    where: { templateId },
  });

  if (!backgroundIds.length) return;

  await prisma.templateBackground.createMany({
    data: backgroundIds.map((backgroundId) => ({
      templateId,
      backgroundId,
    })),
    skipDuplicates: true,
  });
}

async function replaceTemplateFinishes(templateId: number, finishes: Finish[]) {
  await prisma.templateFinish.deleteMany({
    where: { templateId },
  });

  if (!finishes.length) return;

  await prisma.templateFinish.createMany({
    data: finishes.map((finish) => ({
      templateId,
      finish,
    })),
    skipDuplicates: true,
  });
}

async function createTemplate(cfg: TemplateConfig) {
  const template = await prisma.template.upsert({
    where: { code: cfg.code },
    update: {
      label: cfg.label,
      material: cfg.material,
      shape: cfg.shape,
      singlePerson: cfg.singlePerson ?? true,
      orientation: cfg.orientation ?? null,
      colorMode: cfg.colorMode,
      coverage: cfg.coverage ?? Coverage.NORMAL,
      supportsFrame: cfg.supportsFrame ?? false,
      requiresBackground: cfg.requiresBackground ?? false,
      requiresFinish: cfg.requiresFinish ?? false,
      supportsHoles: cfg.supportsHoles ?? true,
      fullTitle: cfg.fullTitle ?? null,
      perHolePrice: cfg.perHolePrice ?? 0,
      inscribed: cfg.inscribed ?? null,
    },
    create: {
      code: cfg.code,
      label: cfg.label,
      material: cfg.material,
      shape: cfg.shape,
      singlePerson: cfg.singlePerson ?? true,
      orientation: cfg.orientation ?? null,
      colorMode: cfg.colorMode,
      coverage: cfg.coverage ?? Coverage.NORMAL,
      supportsFrame: cfg.supportsFrame ?? false,
      requiresBackground: cfg.requiresBackground ?? false,
      requiresFinish: cfg.requiresFinish ?? false,
      supportsHoles: cfg.supportsHoles ?? true,
      fullTitle: cfg.fullTitle ?? null,
      perHolePrice: cfg.perHolePrice ?? 0,
      inscribed: cfg.inscribed ?? null,
    },
  });

  await syncTemplateSizes(template.id, cfg);
  await syncTemplateSizeFinishPrices(template.id, cfg);

  const holes =
    cfg.supportsHoles === false ? [] : (cfg.holePatterns ?? ALL_HOLES);
  await replaceTemplateHoles(template.id, holes);

  if (cfg.frameCodes?.length) {
    const frames = await prisma.frame.findMany({
      where: { code: { in: cfg.frameCodes } },
      select: { id: true },
    });

    await replaceTemplateFrames(
      template.id,
      frames.map((f) => f.id),
    );
  } else {
    await replaceTemplateFrames(template.id, []);
  }

  if (cfg.goldTypes?.length) {
    await replaceTemplateGoldTypes(template.id, cfg.goldTypes);
  } else {
    await replaceTemplateGoldTypes(template.id, []);
  }

  if (cfg.requiresBackground || (cfg.backgroundCodes?.length ?? 0) > 0) {
    const where =
      cfg.backgroundCodes && cfg.backgroundCodes.length
        ? { code: { in: cfg.backgroundCodes } }
        : {};
    const backgrounds = await prisma.background.findMany({
      where,
      select: { id: true },
    });

    await replaceTemplateBackgrounds(
      template.id,
      backgrounds.map((b) => b.id),
    );
  } else {
    await replaceTemplateBackgrounds(template.id, []);
  }

  if (cfg.finishes?.length) {
    await replaceTemplateFinishes(template.id, cfg.finishes);
  } else {
    await replaceTemplateFinishes(template.id, []);
  }
}

async function seedSizes() {
  const tuples: Array<[number, number]> = [
    [13, 19],
    [17, 22],
    [20, 30],
    [18, 24],
    [24, 30],
    [30, 40],
    [30, 60],
    [16, 18],
    [16, 45],
    [13, 18],
    [21, 27],
    [9, 12],
    [17, 24],
    [15, 20],
    [20, 25],
    [25, 30],
    [30, 60],
    [40, 60],
    [50, 70],
    [50, 80],
    [55, 80],
    [50, 100],
    [60, 100],
    [60, 120],
  ];

  const unique = new Map<string, { widthCm: number; heightCm: number }>();

  for (const [w, h] of tuples) {
    const key = `${w}x${h}`;
    if (!unique.has(key)) {
      unique.set(key, { widthCm: w, heightCm: h });
    }
  }

  for (const { widthCm, heightCm } of unique.values()) {
    const existing = await prisma.size.findUnique({
      where: {
        widthCm_heightCm: {
          widthCm,
          heightCm,
        },
      },
      select: { id: true },
    });

    if (!existing) {
      await prisma.size.create({
        data: {
          widthCm,
          heightCm,
          label: `${widthCm}×${heightCm}`,
          priceMinor: 0,
        },
      });
    }
  }
}

async function seedFrames() {
  const frames: { code: number; name: string }[] = [];

  frames.push({ code: 0, name: 'Без рамки' });

  for (let i = 1; i < 7; i += 1) {
    frames.push({
      code: i,
      name: `Рамка ${i}`,
    });
  }

  for (const frame of frames) {
    await prisma.frame.upsert({
      where: { code: frame.code },
      update: {
        name: frame.name,
      },
      create: frame,
    });
  }
}

async function seedBackgrounds() {
  const bgs: Array<{ code: number; name: string }> = [
    { code: 300, name: 'Без фона' },
    { code: 400, name: 'Фон как на фото' },
    { code: 500, name: 'Свой вариант фона' },
    { code: 1, name: 'Фон 1' },
    { code: 18, name: 'Фон 18' },
    { code: 12, name: 'Фон 12' },
    { code: 19, name: 'Фон 19' },
    { code: 20, name: 'Фон 20' },
    { code: 21, name: 'Фон 21' },
    { code: 22, name: 'Фон 22' },
    { code: 13, name: 'Фон 13' },
    { code: 10, name: 'Фон 10' },
    { code: 23, name: 'Фон 23' },
    { code: 9, name: 'Фон 9' },
    { code: 11, name: 'Фон 11' },
    { code: 24, name: 'Фон 24' },
    { code: 3, name: 'Фон 3' },
    { code: 25, name: 'Фон 25' },
    { code: 16, name: 'Фон 16' },
    { code: 14, name: 'Фон 14' },
    { code: 26, name: 'Фон 26' },
    { code: 27, name: 'Фон 27' },
    { code: 28, name: 'Фон 28' },
    { code: 29, name: 'Фон 29' },
    { code: 30, name: 'Фон 30' },
    { code: 31, name: 'Фон 31' },
    { code: 32, name: 'Фон 32' },
    { code: 2, name: 'Фон 2' },
    { code: 8, name: 'Фон 8' },
    { code: 17, name: 'Фон 17' },
    { code: 6, name: 'Фон 6' },
    { code: 33, name: 'Фон 33' },
    { code: 15, name: 'Фон 15' },
    { code: 7, name: 'Фон 7' },
    { code: 5, name: 'Фон 5' },
    { code: 4, name: 'Фон 4' },
    { code: 34, name: 'Фон 34' },
    { code: 35, name: 'Фон 35' },
    { code: 36, name: 'Фон 36' },
    { code: 100, name: 'Фон 100 (белый)' },
    { code: 200, name: 'Фон 200 (чёрный)' },
  ];

  for (const bg of bgs) {
    await prisma.background.upsert({
      where: { code: bg.code },
      update: {
        name: bg.name,
      },
      create: bg,
    });
  }
}

async function seedMaterialHolePrices() {
  const materials = Object.values(Material) as Material[];

  for (const material of materials) {
    await prisma.materialHolePrice.upsert({
      where: { material },
      update: {},
      create: {
        material,
        perHoleMinor: 0,
      },
    });
  }
}

async function seedTemplates() {
  const allTemplates: TemplateConfig[] = [
    ...metalOvalVertTemplates,
    ...metalOvalHorTemplates,
    ...metalRectVertTemplates,
    ...metalRectHorTemplates,
    ...metalFullTemplates,
    ...starTemplates,
    ...archMetalTemplates,
    ...heartTemplates,
    ...whiteRectTemplates,
    ...whiteOvalTemplates,
    ...whiteArchTemplates,
    ...whiteExtra,
    ...growthVertical,
    ...growthHorizontal,
    ...glassRectTemplates,
    ...glassOvalTemplates,
    ...glassArchTemplates,
    ...blackSingleTemplates,
    ...blackCoupleTemplates,
    ...blackTextTemplates,
    ...engravingTemplates,
  ];

  for (const t of allTemplates) {
    await createTemplate(t);
  }
}

async function main() {
  console.log('Seeding sizes...');
  await seedSizes();

  console.log('Seeding frames...');
  await seedFrames();

  console.log('Seeding backgrounds...');
  await seedBackgrounds();

  console.log('Seeding material hole prices...');
  await seedMaterialHolePrices();

  console.log('Seeding templates...');
  await seedTemplates();

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
