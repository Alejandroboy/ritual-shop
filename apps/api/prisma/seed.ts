/* eslint-disable no-console */
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

const prisma = new PrismaClient({ log: ['warn', 'error'] });

// ========= helpers (size parsing / upserts)

const toLabel = (w: number, h: number) => `${w}×${h} см`;
const parseSize = (s: string) => {
  const [w, h] = s.split('x').map(Number);
  return { widthCm: w, heightCm: h, label: toLabel(w, h) };
};

async function upsertSize(code: string) {
  const s = parseSize(code);
  await prisma.size.upsert({
    where: { widthCm_heightCm: { widthCm: s.widthCm, heightCm: s.heightCm } },
    update: { label: s.label },
    create: s,
  });
}

async function findSizeIds(sizeCodes: string[]) {
  const pairs = sizeCodes.map(parseSize);
  const sizes = await prisma.size.findMany({
    where: {
      OR: pairs.map((p) => ({ widthCm: p.widthCm, heightCm: p.heightCm })),
    },
    select: { id: true },
  });
  return sizes.map((s) => s.id);
}

// ========= dictionaries to seed

const SIZES = {
  RECT_SMALL: ['13x18', '15x20', '20x25', '20x30', '25x30', '30x40'],
  RECT_TALL: ['30x60', '40x60', '50x70', '50x80'],
  RECT_CERMET: ['13x19', '17x22'],
  OVAL_COMMON_V: ['9x12', '11x15', '13x18', '15x20', '18x24', '20x25'],
  OVAL_COMMON_H: ['12x9', '15x11', '18x13', '20x15', '24x18', '25x20'],
  ARCH_WHITE: ['20x25', '20x30', '25x30', '30x40'],
  GROWTH: ['40x60', '50x70', '50x80', '55x80', '50x100', '60x100', '60x120'],
};

const FRAMES = [1, 2, 3, 4, 5, 6];
const BACKGROUNDS = [
  // 1..36 + белый(100) и чёрный(200)
  ...Array.from({ length: 36 }, (_, i) => i + 1),
  100,
  200,
];

// ========= high-level catalog DSL

type FamilyBase = {
  codePrefix: string; // префикс кода (уникальный в рамках семейства)
  labelPrefix: string; // префикс отображаемого кода (для зрительного отличия)
  material: Material;
  shape: Shape;
  colorModes: ColorMode[]; // [BW], [COLOR], либо обе
  orientations?: Orientation[]; // для прямоугольников/овалов
  coverage?: Coverage; // NORMAL | FULL_WRAP
  supportsFrame?: boolean;
  requiresBackground?: boolean;
  requiresFinish?: boolean;
  variantFinishes?: Finish[]; // если finish обязателен — какие варианты допустимы у Variants
  templateFinishes?: Finish[]; // допустимые финиши на уровне Template (enum Finish)
  holesByOrientation?: Partial<Record<Orientation, HolePattern[]>>;
  holes?: HolePattern[]; // если у формы нет ориентации
  sizeCodesByOrientation?: Partial<Record<Orientation, string[]>>;
  sizeCodes?: string[]; // если у формы нет ориентации
  frameCodes?: number[]; // 1..6 (для металлокерамики)
  backgroundCodes?: number[]; // допустимые фоны
};

function familyRectCermet(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.CERMET,
    shape: Shape.RECTANGLE,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    supportsFrame: true,
    requiresBackground: false,
    requiresFinish: false,
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
      [Orientation.HORIZONTAL]: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.RECT_CERMET,
      [Orientation.HORIZONTAL]: SIZES.RECT_CERMET.map((s) =>
        s.split('x').reverse().join('x'),
      ), // автоповорот
    },
    frameCodes: FRAMES,
    backgroundCodes: [1, 2, 4, 5, 7, 10, 12, 13, 21, 23, 31, 32, 34, 36], // пример подкаталога
  };
}

function familyOvalCermet(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.CERMET,
    shape: Shape.OVAL,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    supportsFrame: true, // в каталоге есть «рамки» для овалов
    holesByOrientation: {
      [Orientation.VERTICAL]: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      [Orientation.HORIZONTAL]: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.OVAL_COMMON_V,
      [Orientation.HORIZONTAL]: SIZES.OVAL_COMMON_H,
    },
    frameCodes: FRAMES,
    backgroundCodes: BACKGROUNDS, // овалы часто с фонами
  };
}

function familyRectWhite(
  codePrefix: string,
  labelPrefix: string,
  fullWrap = false,
): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.WHITE_CERAMIC_GRANITE,
    shape: Shape.RECTANGLE,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresBackground: true,
    requiresFinish: true,
    templateFinishes: [Finish.MATTE, Finish.GLOSS],
    variantFinishes: [Finish.MATTE, Finish.GLOSS],
    coverage: fullWrap ? Coverage.FULL_WRAP : Coverage.NORMAL,
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
      [Orientation.HORIZONTAL]: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL],
      [Orientation.HORIZONTAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL].map(
        (s) => s.split('x').reverse().join('x'),
      ),
    },
    backgroundCodes: BACKGROUNDS,
  };
}

function familyOvalWhite(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.WHITE_CERAMIC_GRANITE,
    shape: Shape.OVAL,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresBackground: true,
    requiresFinish: true,
    templateFinishes: [Finish.MATTE, Finish.GLOSS],
    variantFinishes: [Finish.MATTE, Finish.GLOSS],
    holesByOrientation: {
      [Orientation.VERTICAL]: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      [Orientation.HORIZONTAL]: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.OVAL_COMMON_V,
      [Orientation.HORIZONTAL]: SIZES.OVAL_COMMON_H,
    },
    backgroundCodes: BACKGROUNDS,
  };
}

function familyArchWhite(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.WHITE_CERAMIC_GRANITE,
    shape: Shape.ARCH,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL],
    requiresBackground: true,
    requiresFinish: true,
    templateFinishes: [Finish.MATTE, Finish.GLOSS],
    variantFinishes: [Finish.MATTE, Finish.GLOSS],
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.ARCH_WHITE,
    },
    backgroundCodes: BACKGROUNDS,
  };
}

function familyRectGlass(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.GLASS,
    shape: Shape.RECTANGLE,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresBackground: true,
    requiresFinish: false,
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
      [Orientation.HORIZONTAL]: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.RECT_SMALL,
      [Orientation.HORIZONTAL]: SIZES.RECT_SMALL.map((s) =>
        s.split('x').reverse().join('x'),
      ),
    },
    backgroundCodes: BACKGROUNDS,
  };
}
function familyOvalGlass(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.GLASS,
    shape: Shape.OVAL,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresBackground: true,
    holesByOrientation: {
      [Orientation.VERTICAL]: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      [Orientation.HORIZONTAL]: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.OVAL_COMMON_V,
      [Orientation.HORIZONTAL]: SIZES.OVAL_COMMON_H,
    },
    backgroundCodes: BACKGROUNDS,
  };
}
function familyArchGlass(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.GLASS,
    shape: Shape.ARCH,
    colorModes: [ColorMode.BW, ColorMode.COLOR],
    orientations: [Orientation.VERTICAL],
    requiresBackground: true,
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.ARCH_WHITE,
    },
    backgroundCodes: BACKGROUNDS,
  };
}

function familyRectBlack(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.BLACK_CERAMIC_GRANITE,
    shape: Shape.RECTANGLE,
    colorModes: [ColorMode.BW], // обычно ч/б
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresFinish: true,
    templateFinishes: [Finish.MATTE, Finish.GLOSS],
    variantFinishes: [Finish.MATTE, Finish.GLOSS],
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
      [Orientation.HORIZONTAL]: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL],
      [Orientation.HORIZONTAL]: [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL].map(
        (s) => s.split('x').reverse().join('x'),
      ),
    },
  };
}

function familyGrowth(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.GROWTH_PHOTOCERAMICS,
    shape: Shape.RECTANGLE,
    colorModes: [ColorMode.COLOR], // ростовая чаще цвет
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresFinish: true,
    templateFinishes: [Finish.GLOSS], // только глянец
    variantFinishes: [Finish.GLOSS],
    holesByOrientation: {
      [Orientation.VERTICAL]: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      [Orientation.HORIZONTAL]: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.GROWTH,
      [Orientation.HORIZONTAL]: SIZES.GROWTH.map((s) =>
        s.split('x').reverse().join('x'),
      ),
    },
  };
}

function familyEngraving(codePrefix: string, labelPrefix: string): FamilyBase {
  return {
    codePrefix,
    labelPrefix,
    material: Material.ENGRAVING,
    shape: Shape.RECTANGLE,
    colorModes: [ColorMode.BW],
    orientations: [Orientation.VERTICAL, Orientation.HORIZONTAL],
    requiresFinish: false,
    holesByOrientation: {
      [Orientation.VERTICAL]: [
        HolePattern.NONE,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
      ],
      [Orientation.HORIZONTAL]: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.FOUR_CORNERS,
      ],
    },
    sizeCodesByOrientation: {
      [Orientation.VERTICAL]: SIZES.RECT_SMALL,
      [Orientation.HORIZONTAL]: SIZES.RECT_SMALL.map((s) =>
        s.split('x').reverse().join('x'),
      ),
    },
  };
}

// ========= template generator

type BuiltTemplate = {
  code: string;
  label: string;
  material: Material;
  shape: Shape;
  orientation?: Orientation;
  colorMode: ColorMode;
  coverage?: Coverage;
  supportsFrame?: boolean;
  requiresBackground?: boolean;
  requiresFinish?: boolean;
  sizeCodes: string[];
  frameCodes?: number[];
  backgroundCodes?: number[];
  holePatterns: HolePattern[];
  templateFinishes?: Finish[];
  variantFinishes?: Finish[];
};

function buildTemplates(f: FamilyBase): BuiltTemplate[] {
  const items: BuiltTemplate[] = [];
  const orientations = f.orientations ?? [];
  const holesMap = f.holesByOrientation ?? {};
  const sizeMap = f.sizeCodesByOrientation ?? {};

  // формы с ориентацией
  if (orientations.length) {
    for (const orient of orientations) {
      for (const cm of f.colorModes) {
        const suffix =
          `${f.shape === Shape.OVAL ? 'OV' : f.shape === Shape.ARCH ? 'AR' : 'R'}-` +
          `${orient === Orientation.VERTICAL ? 'V' : 'H'}-` +
          `${cm === ColorMode.BW ? 'BW' : 'C'}`;

        const code = `${f.codePrefix}-${suffix}`;
        const label = `${f.labelPrefix} ${orient === Orientation.VERTICAL ? 'верт.' : 'гор.'} ${cm === ColorMode.BW ? 'ч/б' : 'цвет'}`;

        items.push({
          code,
          label,
          material: f.material,
          shape: f.shape,
          orientation: orient,
          colorMode: cm,
          coverage: f.coverage ?? Coverage.NORMAL,
          supportsFrame: !!f.supportsFrame,
          requiresBackground: !!f.requiresBackground,
          requiresFinish: !!f.requiresFinish,
          sizeCodes: sizeMap[orient] ?? [],
          frameCodes: f.frameCodes,
          backgroundCodes: f.backgroundCodes,
          holePatterns: holesMap[orient] ?? [],
          templateFinishes: f.templateFinishes,
          variantFinishes: f.variantFinishes,
        });
      }
    }
  } else {
    // формы без ориентации
    for (const cm of f.colorModes) {
      const suffix =
        `${f.shape === Shape.OVAL ? 'OV' : f.shape === Shape.ARCH ? 'AR' : 'R'}-` +
        `${cm === ColorMode.BW ? 'BW' : 'C'}`;
      const code = `${f.codePrefix}-${suffix}`;
      const label = `${f.labelPrefix} ${cm === ColorMode.BW ? 'ч/б' : 'цвет'}`;
      items.push({
        code,
        label,
        material: f.material,
        shape: f.shape,
        colorMode: cm,
        coverage: f.coverage ?? Coverage.NORMAL,
        supportsFrame: !!f.supportsFrame,
        requiresBackground: !!f.requiresBackground,
        requiresFinish: !!f.requiresFinish,
        sizeCodes: f.sizeCodes ?? [],
        frameCodes: f.frameCodes,
        backgroundCodes: f.backgroundCodes,
        holePatterns: f.holes ?? [],
        templateFinishes: f.templateFinishes,
        variantFinishes: f.variantFinishes,
      });
    }
  }
  return items;
}

// ========= seeders

async function seedSizes() {
  const all = new Set<string>([
    ...SIZES.RECT_SMALL,
    ...SIZES.RECT_TALL,
    ...SIZES.RECT_CERMET,
    ...SIZES.OVAL_COMMON_V,
    ...SIZES.OVAL_COMMON_H,
    ...SIZES.ARCH_WHITE,
    ...SIZES.GROWTH,
  ]);
  // автодобавим повернутые для H
  [...SIZES.RECT_SMALL, ...SIZES.RECT_TALL].forEach((s) =>
    all.add(s.split('x').reverse().join('x')),
  );
  SIZES.OVAL_COMMON_V.forEach((s) => all.add(s)); // V уже есть
  SIZES.OVAL_COMMON_H.forEach((s) => all.add(s)); // H уже есть
  await Promise.all([...all].map(upsertSize));
  console.log(`✓ Sizes: ${all.size}`);
}

async function seedFrames() {
  for (const code of FRAMES) {
    await prisma.frame.upsert({
      where: { code },
      update: { name: `Рамка ${code}` },
      create: { code, name: `Рамка ${code}` },
    });
  }
  console.log(`✓ Frames: ${FRAMES.length}`);
}

async function seedBackgrounds() {
  for (const code of BACKGROUNDS) {
    await prisma.background.upsert({
      where: { code },
      update: { name: `Фон ${code}` },
      create: { code, name: `Фон ${code}` },
    });
  }
  console.log(`✓ Backgrounds: ${BACKGROUNDS.length}`);
}

async function seedFinishVariants() {
  for (const f of [
    { code: 'MATTE', label: 'Матовый' },
    { code: 'GLOSS', label: 'Глянец' },
  ]) {
    await prisma.finishVariant.upsert({
      where: { code: f.code },
      update: { label: f.label },
      create: f,
    });
  }
  console.log('✓ Finish variants: 2');
}

// низкоуровневый апсертер шаблона + все связи
async function upsertTemplate(t: BuiltTemplate) {
  const tpl = await prisma.template.upsert({
    where: { code: t.code },
    update: {
      label: t.label,
      material: t.material,
      shape: t.shape,
      orientation: t.orientation,
      colorMode: t.colorMode,
      coverage: t.coverage ?? Coverage.NORMAL,
      supportsFrame: t.supportsFrame ?? false,
      requiresBackground: t.requiresBackground ?? false,
      requiresFinish: t.requiresFinish ?? false,
    },
    create: {
      code: t.code,
      label: t.label,
      material: t.material,
      shape: t.shape,
      orientation: t.orientation,
      colorMode: t.colorMode,
      coverage: t.coverage ?? Coverage.NORMAL,
      supportsFrame: t.supportsFrame ?? false,
      requiresBackground: t.requiresBackground ?? false,
      requiresFinish: t.requiresFinish ?? false,
      personsMin: 1,
      personsMax: 1,
    },
    select: { id: true },
  });

  // очистим старые связи (чтобы сид был переигрываемым)
  await prisma.$transaction([
    prisma.templateSize.deleteMany({ where: { templateId: tpl.id } }),
    prisma.templateHole.deleteMany({ where: { templateId: tpl.id } }),
    prisma.templateFrame.deleteMany({ where: { templateId: tpl.id } }),
    prisma.templateBackground.deleteMany({ where: { templateId: tpl.id } }),
    prisma.templateFinish.deleteMany({ where: { templateId: tpl.id } }),
    prisma.templateVariantFinish.deleteMany({ where: { templateId: tpl.id } }),
    prisma.templateVariant.deleteMany({ where: { templateId: tpl.id } }),
  ]);

  // sizes
  const sizeIds = await findSizeIds(t.sizeCodes);
  await prisma.templateSize.createMany({
    data: sizeIds.map((sizeId) => ({ templateId: tpl.id, sizeId })),
    skipDuplicates: true,
  });

  // holes
  await prisma.templateHole.createMany({
    data: t.holePatterns.map((pattern) => ({ templateId: tpl.id, pattern })),
    skipDuplicates: true,
  });

  // frames
  if (t.frameCodes?.length) {
    const frames = await prisma.frame.findMany({
      where: { code: { in: t.frameCodes } },
      select: { id: true },
    });
    await prisma.templateFrame.createMany({
      data: frames.map((f) => ({ templateId: tpl.id, frameId: f.id })),
      skipDuplicates: true,
    });
  }

  // backgrounds
  if (t.backgroundCodes?.length) {
    const bgs = await prisma.background.findMany({
      where: { code: { in: t.backgroundCodes } },
      select: { id: true },
    });
    await prisma.templateBackground.createMany({
      data: bgs.map((b) => ({ templateId: tpl.id, backgroundId: b.id })),
      skipDuplicates: true,
    });
  }

  // template-level finishes (enum)
  if (t.templateFinishes?.length) {
    await prisma.templateFinish.createMany({
      data: t.templateFinishes.map((f) => ({ templateId: tpl.id, finish: f })),
      skipDuplicates: true,
    });
  }

  // variants per hole pattern
  for (const p of t.holePatterns) {
    await prisma.templateVariant.upsert({
      where: { templateId_holePattern: { templateId: tpl.id, holePattern: p } },
      update: { finishRequired: !!t.requiresFinish },
      create: {
        templateId: tpl.id,
        holePattern: p,
        finishRequired: !!t.requiresFinish,
      },
    });

    if (t.variantFinishes?.length) {
      const fv = await prisma.finishVariant.findMany({
        where: { code: { in: t.variantFinishes.map((x) => x) } },
        select: { id: true },
      });
      await prisma.templateVariantFinish.createMany({
        data: fv.map((x) => ({
          templateId: tpl.id,
          holePattern: p,
          finishId: x.id,
        })),
        skipDuplicates: true,
      });
    }
  }
}

async function seedCatalog() {
  // === ОПИСАНИЕ СЕМЕЙСТВ (можно расширять)
  const families: FamilyBase[] = [
    // Металлокерамика: таблички + овалы
    familyRectCermet('CERM-T', 'Табличка Т'),
    familyOvalCermet('CERM-O', 'Овал'),

    // Белый керамогранит: прям/овал/арка, обычные и «полная затяжка»
    familyRectWhite('WCG-T', 'Керамогранит бел. табличка', false),
    familyRectWhite('WCG-TF', 'Керамогранит бел. табличка полная', true),
    familyOvalWhite('WCG-O', 'Керамогранит бел. овал'),
    familyArchWhite('WCG-A', 'Керамогранит бел. арка'),

    // Стекло
    familyRectGlass('GLS-T', 'Стекло табличка'),
    familyOvalGlass('GLS-O', 'Стекло овал'),
    familyArchGlass('GLS-A', 'Стекло арка'),

    // Чёрный керамогранит
    familyRectBlack('BCG-T', 'Керамогранит чёрный'),

    // Ростовая фотокерамика
    familyGrowth('GROWTH', 'Ростовая фотокерамика'),

    // Гравировка
    familyEngraving('ENGR', 'Гравировка'),
  ];

  // Собираем и апсертим все сгенерированные шаблоны
  const built = families.flatMap(buildTemplates);
  console.log(`→ Building ${built.length} templates...`);

  for (const t of built) {
    await upsertTemplate(t);
  }
  console.log('✓ Templates seeded');
}

// ========= main

async function main() {
  await seedSizes();
  await seedFrames();
  await seedBackgrounds();
  await seedFinishVariants();
  await seedCatalog();
}

main()
  .then(async () => {
    console.log('✅ Seed completed');
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed failed', e);
    await prisma.$disconnect();
    process.exit(1);
  });
