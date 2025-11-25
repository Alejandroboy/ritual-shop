// prisma/seed.ts
import {
  PrismaClient,
  Material,
  Shape,
  Orientation,
  ColorMode,
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
import { whiteRectTemplates } from './templates/white-ceramo-granite-rectangle.ts';
import { whiteOvalTemplates } from './templates/white-ceramo-granite-oval.ts';
import { whiteArchTemplates } from './templates/white-ceramo-granite-arch.ts';
import { growthTemplates } from './templates/growth-photoceramic.ts';
import { glassRectTemplates } from './templates/glass-rectangle.ts';
import { glassOvalTemplates } from './templates/glass-oval.ts';
import { glassArchTemplates } from './templates/glass-arch.ts';
import { blackSingleTemplates } from './templates/black-ceramo-granite-single.ts';
import { blackCoupleTemplates } from './templates/black-ceramo-granite-couples.ts';
import { blackTextTemplates } from './templates/black-ceramo-granite-rectangle.ts';
import { engravingTemplates } from './templates/engrave.ts';
import { type TemplateConfig } from './templates/shared.ts';

const prisma = new PrismaClient();

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
      orientation: cfg.orientation ?? null,
      colorMode: cfg.colorMode,
      coverage: cfg.coverage ?? Coverage.NORMAL,
      supportsFrame: cfg.supportsFrame ?? false,
      requiresBackground: cfg.requiresBackground ?? false,
      requiresFinish: cfg.requiresFinish ?? false,
      supportsHoles: cfg.supportsHoles ?? true,
      fullTitle: cfg.fullTitle ?? null,
      perHolePrice: cfg.perHolePrice ?? null,
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
  const frames = Array.from({ length: 6 }).map((_, i) => ({
    code: i + 1,
    name: `Рамка ${i + 1}`,
  }));

  await prisma.frame.createMany({
    data: frames,
    skipDuplicates: true,
  });
}

// ================== BACKGROUNDS ==================

async function seedBackgrounds() {
  const bgs: Array<{ code: number; name: string }> = [
    // стр. 56
    { code: 1, name: 'Светлый градиент' },
    { code: 18, name: 'Светлый боке' },
    { code: 12, name: 'Тёмный градиент' },
    { code: 19, name: 'Светлый камень 1' },
    { code: 20, name: 'Светлый камень 2' },
    { code: 21, name: 'Тёмный камень' },
    { code: 22, name: 'Серые полосы' },
    { code: 13, name: 'Светлая крошка' },
    { code: 10, name: 'Тёмная крошка' },
    { code: 23, name: 'Светлое облако' },
    { code: 9, name: 'Серые драпировки' },
    { code: 11, name: 'Тёмный орнамент' },

    // стр. 57
    { code: 24, name: 'Бежевый светлый' },
    { code: 3, name: 'Бежевый тёплый' },
    { code: 25, name: 'Красный гранит' },
    { code: 16, name: 'Тёплое облако' },
    { code: 14, name: 'Тёплый дымчатый' },
    { code: 26, name: 'Коричневый гранит' },
    { code: 27, name: 'Золотой' },
    { code: 28, name: 'Красная драпировка' },
    { code: 29, name: 'Золотой боке' },
    { code: 30, name: 'Берёзовая аллея (осень)' },
    { code: 31, name: 'Осенний боке' },
    { code: 32, name: 'Закат' },

    // стр. 58
    { code: 2, name: 'Небо мягкое' },
    { code: 8, name: 'Небо с полосами' },
    { code: 17, name: 'Тёмно-синее поле' },
    { code: 6, name: 'Вертикальные полосы синие' },
    { code: 33, name: 'Сине-зелёный боке' },
    { code: 15, name: 'Ночное небо' },
    { code: 7, name: 'Дневные облака' },
    { code: 5, name: 'Листва сверху' },
    { code: 4, name: 'Берёзовая аллея (лето)' },
    { code: 34, name: 'Листва + лучи' },
    { code: 35, name: 'Зелёный боке' },
    { code: 36, name: 'Поле с дорогой' },

    // стр. 59
    { code: 100, name: 'Белый фон' },
    { code: 200, name: 'Чёрный фон' },
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
    ...growthTemplates,
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
