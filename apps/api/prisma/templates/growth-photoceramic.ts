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
  sizesWhiteBlackRect,
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

const growthSingleBases = ['K1_r', 'K2_r', 'K3_r'];
const growthCoupleBases = ['K4_r', 'K5_r', 'K6_r'];

export const growthRectsTemplates: TemplateConfig[] = [
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К'),
      fullTitle: `Белый ростовой прямоугольный портрет ${base.replace('K', 'К')} на керамограните`,
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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Белый ростовой прямоугольный портрет ${bw.label}ц на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...growthCoupleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К'),
      fullTitle: `Белый ростовой прямоугольный портрет ${base.replace('K', 'К')} на керамограните`,
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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Белый ростовой прямоугольный портрет ${bw.label}ц на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];

export const growthOvalTemplates: TemplateConfig[] = [
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('K', 'К')} овал`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')} овал на керамограните`,
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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К')}ц овал`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')}ц овал на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...growthCoupleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('K', 'К')} овал`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')} овал на керамограните`,
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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К')}ц овал`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')}ц овал на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];

export const growthArchTemplates: TemplateConfig[] = [
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К')} арка`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')} арка на керамограните`,
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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_arch_c`,
      label: `${base.replace('K', 'К')}ц арка`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')}ц арка на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...growthSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К')} арка`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')} арка на керамограните`,
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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_arch_c`,
      label: `${base.replace('K', 'К')}ц арка`,
      fullTitle: `Белый ростовой портрет ${base.replace('K', 'К')}ц арка на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
