// ---------- Белый керамогранит: прямоугольная форма (стр. 30–31, 36–37) ----------
import {
  ColorMode,
  Coverage,
  Finish,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesWhiteBlackRect, type TemplateConfig } from './shared.ts';

const whiteRectSingleBases = ['K1', 'K2', 'K3'];
const whiteRectCoupleBases = ['K4', 'K5', 'K6'];
const whiteRectExtraBases = ['K7', 'K8']; // K9, K10, K11–K14 без цветных версий
const PRICES_RECT: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2800,
  '30х60': 2900,
};

export const whiteRectTemplates: TemplateConfig[] = [
  ...whiteRectSingleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К'),
      fullTitle: `Белый прямоугольный портрет ${base.replace('K', 'К')} на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.RECTANGLE,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesWhiteBlackRect,
      finishes: [Finish.MATTE, Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT,
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
      fullTitle: `Белый прямоугольный портрет ${bw.label}ц на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...whiteRectCoupleBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К'),
      fullTitle: `Белый прямоугольный портрет ${base.replace('K', 'К')} на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.RECTANGLE,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesWhiteBlackRect,
      finishes: [Finish.MATTE, Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT,
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
      fullTitle: `Белый прямоугольный портрет ${bw.label}ц на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...whiteRectExtraBases.flatMap((base) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('K', 'К'),
      fullTitle: `Белый прямоугольный портрет ${base.replace('K', 'К')} на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.RECTANGLE,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesWhiteBlackRect,
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_RECT,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      finishes: [Finish.MATTE, Finish.GLOSS],
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Белый прямоугольный портрет ${bw.label}ц на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  // текстовые K9, K10
  {
    code: 'K9',
    label: 'К9',
    fullTitle: `Белый прямоугольный портрет К9 на керамограните`,
    material: Material.WHITE_CERAMIC_GRANITE,
    shape: Shape.RECTANGLE,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: true,
    requiresFinish: true,
    supportsHoles: true,
    sizeLabels: sizesWhiteBlackRect,
    finishes: [Finish.MATTE, Finish.GLOSS],
    perHolePrice: 350,
    basePrice: 0,
    sizePrice: PRICES_RECT,
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
  },
  {
    code: 'K10',
    label: 'К10',
    fullTitle: `Белый прямоугольный портрет К10 на керамограните`,
    material: Material.WHITE_CERAMIC_GRANITE,
    shape: Shape.RECTANGLE,
    orientation: Orientation.HORIZONTAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: true,
    requiresFinish: true,
    supportsHoles: true,
    sizeLabels: sizesWhiteBlackRect,
    finishes: [Finish.MATTE, Finish.GLOSS],
    perHolePrice: 350,
    basePrice: 0,
    sizePrice: PRICES_RECT,
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
  },
  ...['K11', 'K12', 'K13', 'K14'].map<TemplateConfig>((base) => ({
    code: base,
    label: base.replace('K', 'К'),
    fullTitle: `Белый прямоугольный портрет ${base.replace('K', 'К')} на керамограните`,
    material: Material.WHITE_CERAMIC_GRANITE,
    shape: Shape.RECTANGLE,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.COLOR,
    coverage: Coverage.FULL_WRAP,
    supportsFrame: false,
    requiresBackground: true,
    requiresFinish: true,
    supportsHoles: true,
    sizeLabels: sizesWhiteBlackRect,
    finishes: [Finish.MATTE, Finish.GLOSS],
    perHolePrice: 350,
    basePrice: 0,
    sizePrice: PRICES_RECT,
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
  })),
];
