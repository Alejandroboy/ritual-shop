// ---------- Ростовая фотокерамика (стр. 40–41) ----------
import {
  ColorMode,
  Coverage,
  Finish,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import {
  sizesGrowthOval,
  sizesGrowthRectArch,
  sizesWhiteBlackArchOval,
  type TemplateConfig,
} from './shared.ts';

const PRICES_RECT_ARCH: Record<string, number> = {
  '40×60': 5500,
  '50×70': 6500,
  '50×80': 7500,
  '55×80': 8500,
  '50×100': 9500,
  '60×100': 10500,
  '60×120': 11500,
};

const PRICES_OVAL: Record<string, number> = {
  '40×60': 5500,
  '50×70': 6500,
};

const SKU_CODES: Record<string, string> = {
  '40×60': '20079',
  '50×70': '20080',
  '50×80': '20081',
  '55×80': '20082',
  '50×100': '20083',
  '60×100': '20084',
  '60×120': '20085',
};

const SKU_CODES_ARCH: Record<string, string> = {
  '40×60': '20086',
  '50×70': '20087',
  '50×80': '20088',
  '55×80': '20089',
  '50×100': '20090',
  '60×100': '20091',
  '60×120': '20092',
};

const SKU_CODES_FIG: Record<string, string> = {
  '40×60': '20095',
  '50×70': '20096',
  '50×80': '20097',
  '55×80': '20098',
  '50×100': '20099',
  '60×100': '20100',
  '60×120': '20101',
};

const SKU_CODES_OVAL: Record<string, string> = {
  '40×60': '20093',
  '50×70': '20094',
};

const growthSingleBases = ['K1_r', 'K2_r'];
const growthCoupleBases = ['K4_r', 'K5_r'];

export const growthHorizontal: TemplateConfig[] = [
  ...growthCoupleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К').replace('_r', ''),
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')} прямоугольный ростовой на белом керамограните`,
      material: Material.GROWTH_PHOTOCERAMICS,
      shape: Shape.RECTANGLE,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesGrowthRectArch,
      finishes: [Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT_ARCH,
      singlePerson: base !== 'K5_r' && base !== 'K6_r',
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Портрет ${bw.label}ц прямоугольный ростовой на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES,
    };
    return [bw, color];
  }),
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К').replace('_r', '')} арка`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')} арка ростовой на белом керамограните`,
      material: Material.GROWTH_PHOTOCERAMICS,
      shape: Shape.ARCH,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesGrowthRectArch,
      finishes: [Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT_ARCH,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES_ARCH,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_arch_c`,
      label: `${base.replace('K', 'К').replace('_r', '')}ц арка`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')}ц арка ростовой на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES_ARCH,
    };
    return [bw, color];
  }),
  ...growthCoupleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('K', 'К').replace('_r', '')} овал`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')} овал ростовой на белом керамограните`,
      material: Material.GROWTH_PHOTOCERAMICS,
      shape: Shape.OVAL,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesGrowthOval,
      finishes: [Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_OVAL,
      singlePerson: base !== 'K5_r' && base !== 'K6_r',
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES_OVAL,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К').replace('_r', '')}ц овал`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')}ц овал ростовой на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES_OVAL,
    };
    return [bw, color];
  }),
  {
    code: 'KF',
    label: 'КФ',
    fullTitle: `Портрет КФ фигурный ростовой на белом керамограните`,
    material: Material.GROWTH_PHOTOCERAMICS,
    shape: Shape.RECTANGLE,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.COLOR,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: true,
    requiresFinish: true,
    supportsHoles: true,
    sizeLabels: sizesGrowthRectArch,
    finishes: [Finish.GLOSS],
    perHolePrice: 350,
    basePrice: 0,
    sizePrice: PRICES_RECT_ARCH,
    backgroundCodes: [
      300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
      16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
      36, 100, 200,
    ],
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
    inscribed: true,
    skuCodes: SKU_CODES_FIG,
  },
];
export const growthVertical: TemplateConfig[] = [
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К').replace('_r', ''),
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')} прямоугольный ростовой на белом керамограните`,
      material: Material.GROWTH_PHOTOCERAMICS,
      shape: Shape.RECTANGLE,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesGrowthRectArch,
      finishes: [Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT_ARCH,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${base.replace('K', 'К').replace('_r', '')}ц`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')}ц прямоугольный ростовой на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES,
    };
    return [bw, color];
  }),
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К').replace('_r', '')} арка`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')} арка ростовой на белом керамограните`,
      material: Material.GROWTH_PHOTOCERAMICS,
      shape: Shape.ARCH,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesWhiteBlackArchOval,
      finishes: [Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT_ARCH,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES_ARCH,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_arch_c`,
      label: `${base.replace('K', 'К').replace('_r', '')}ц арка`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')}ц арка ростовой на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES_ARCH,
    };
    return [bw, color];
  }),
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('K', 'К').replace('_r', '')} овал`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')} овал ростовой на белом керамограните`,
      material: Material.GROWTH_PHOTOCERAMICS,
      shape: Shape.OVAL,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesGrowthOval,
      finishes: [Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_OVAL,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES_OVAL,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К').replace('_r', '')}ц овал`,
      fullTitle: `Портрет ${base.replace('K', 'К').replace('_r', '')}ц овал ростовой на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES_OVAL,
    };
    return [bw, color];
  }),
];
