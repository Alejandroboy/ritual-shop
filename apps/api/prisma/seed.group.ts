import { PrismaClient, Material, Coverage, HolePattern } from '@prisma/client';
import { metalOvalHorTemplates } from './templates/cermet-oval-horizontal.ts';
import { metalOvalVertTemplates } from './templates/cermet-oval-vertical.ts';
import { metalRectVertTemplates } from './templates/cermet-rectangle-vertical.ts';
import { metalRectHorTemplates } from './templates/cermet-rectangle-horizontal.ts';
import { metalFullTemplates } from './templates/cermet-full-cover.ts';
import { starTemplates } from './templates/cermet-star.ts';
import { archMetalTemplates } from './templates/cermet-arch.ts';
import { heartTemplates } from './templates/cermet-heart.ts';
import { whiteRectTemplates } from './templates/white-ceramo-granite-rectangle.ts';
import { whiteOvalTemplates } from './templates/white-ceramo-granite-oval.ts';
import { whiteArchTemplates } from './templates/white-ceramo-granite-arch.ts';
import { growthRectsTemplates } from './templates/growth-photoceramic.ts';
import { growthArchTemplates } from './templates/growth-photoceramic.ts';
import { growthOvalTemplates } from './templates/growth-photoceramic.ts';
import { glassRectTemplates } from './templates/glass-rectangle.ts';
import { glassOvalTemplates } from './templates/glass-oval.ts';
import { glassArchTemplates } from './templates/glass-arch.ts';
import { blackSingleTemplates } from './templates/black-ceramo-granite-single.ts';
import { blackCoupleTemplates } from './templates/black-ceramo-granite-couples.ts';
import { blackTextTemplates } from './templates/black-ceramo-granite-rectangle.ts';
import { engravingTemplates } from './templates/engrave.ts';
import { type TemplateConfig } from './templates/shared.ts';

const prisma = new PrismaClient({});

// ================== HELPERS ==================

const ALL_HOLES: HolePattern[] = [
  HolePattern.NONE,
  HolePattern.TWO_HORIZONTAL,
  HolePattern.TWO_VERTICAL,
  HolePattern.FOUR_CORNERS,
];

async function createTemplate(cfg: TemplateConfig) {
  const template = await prisma.template.upsert({
    where: { code: cfg.code },
    update: {},
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
      perHolePrice: cfg.perHolePrice ?? null,
      inscribed: cfg.inscribed ?? null,
    },
  });

  const defaultHoles = cfg.holePatterns ?? [HolePattern.NONE];

  const defaultPrice = cfg.basePrice ?? 0;
  // размеры
  if (cfg.sizeLabels.length) {
    const sizes = await prisma.size.findMany({
      where: { label: { in: cfg.sizeLabels } },
    });
    await prisma.templateSize.createMany({
      data: sizes.map((s) => ({
        templateId: template.id,
        sizeId: s.id,
        availableHolePattern: cfg.sizeHolePatterns?.[s.label] ?? defaultHoles,
        price: cfg.sizePrice?.[s.label] ?? defaultPrice,
        skuCode: cfg.skuCodes?.[s.label] ?? null,
      })),
      skipDuplicates: true,
    });
  }

  // отверстия
  const holes = cfg.holePatterns ?? ALL_HOLES;
  if (holes.length && (cfg.supportsHoles ?? true)) {
    await prisma.templateHole.createMany({
      data: holes.map((pattern) => ({
        templateId: template.id,
        pattern,
      })),
      skipDuplicates: true,
    });
  }

  // рамки
  if (cfg.frameCodes?.length) {
    const frames = await prisma.frame.findMany({
      where: { code: { in: cfg.frameCodes } },
    });
    await prisma.templateFrame.createMany({
      data: frames.map((f) => ({
        templateId: template.id,
        frameId: f.id,
      })),
      skipDuplicates: true,
    });
  }

  // фоны
  if (cfg.requiresBackground || (cfg.backgroundCodes?.length ?? 0) > 0) {
    const where =
      cfg.backgroundCodes && cfg.backgroundCodes.length
        ? { code: { in: cfg.backgroundCodes } }
        : {};
    const backgrounds = await prisma.background.findMany({ where });
    await prisma.templateBackground.createMany({
      data: backgrounds.map((b) => ({
        templateId: template.id,
        backgroundId: b.id,
      })),
      skipDuplicates: true,
    });
  }

  // финиши (мат/глянец)
  if (cfg.finishes?.length) {
    await prisma.templateFinish.createMany({
      data: cfg.finishes.map((finish) => ({
        templateId: template.id,
        finish,
      })),
      skipDuplicates: true,
    });
  }
}

// ================== SIZES ==================

async function seedSizes() {
  // Массив всех уникальных размеров, встречающихся в каталоге
  const tuples: Array<[number, number]> = [
    // базовые таблички/металлокерамика
    [13, 19],
    [17, 22],
    [20, 30],
    [18, 24],
    [24, 30],
    [30, 40],
    [30, 60],
    [16, 18],
    [16, 45],

    // приложение (овалы, арки)
    [13, 18],
    [21, 27],
    [9, 12],
    [17, 24],

    // белый / черный керамогранит, стекло, гравировка
    [15, 20],
    [20, 25],
    [25, 30],
    [30, 60],
    [40, 60],

    // ростовая фотокерамика
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

  const data = Array.from(unique.values()).map(({ widthCm, heightCm }) => ({
    widthCm,
    heightCm,
    label: `${widthCm}×${heightCm}`,
    priceMinor: 0,
  }));

  await prisma.size.createMany({
    data,
    skipDuplicates: true,
  });
}

// ================== FRAMES ==================

async function seedFrames() {
  const frames: { code: number; name: string }[] = [];

  frames.push({ code: 0, name: 'Без рамки' });

  for (let i = 1; i < 7; i += 1) {
    frames.push({
      code: i,
      name: `Рамка ${i}`,
    });
  }

  await prisma.frame.createMany({
    data: frames,
    skipDuplicates: true,
  });
}

// ================== BACKGROUNDS ==================

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

  await prisma.background.createMany({
    data: bgs,
    skipDuplicates: true,
  });
}

// ================== MATERIAL HOLE PRICES ==================

async function seedMaterialHolePrices() {
  const materials = Object.values(Material) as Material[];

  await prisma.materialHolePrice.createMany({
    data: materials.map((material) => ({
      material,
      perHoleMinor: 0,
    })),
    skipDuplicates: true,
  });
}

// ================== TEMPLATES ==================

async function seedTemplates() {
  // ---------- Собираем всё ----------
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
    ...growthArchTemplates,
    ...growthOvalTemplates,
    ...growthRectsTemplates,
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

// ================== MAIN ==================

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
