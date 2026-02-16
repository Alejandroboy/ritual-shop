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
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К').replace('_r', '')}ц овал`,
      fullTitle: `Портрет ${bw.label}ц овал ростовой на белом керамограните`,
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
    };
    return [bw, color];
  }),
];
