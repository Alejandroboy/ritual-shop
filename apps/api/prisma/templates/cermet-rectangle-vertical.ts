// ---------- Металлокерамика: прямоугольные таблички, вертикальные (стр. 13–15) ----------
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesMetalRectVert, type TemplateConfig } from './shared.ts';

const metalRectVertBases = ['T1', 'T2', 'T3', 'T14'];

const PRICES: Record<string, number> = {
  '13×19': 1500,
  '17×22': 1800,
  '18×24': 2200,
  '20×30': 2600,
  '24×30': 2700,
};
const SIZE_HOLES: Record<string, HolePattern[]> = {
  '13×19': [HolePattern.TWO_VERTICAL],
  '17×22': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
  '18×24': [HolePattern.FOUR_CORNERS],
  '20×30': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
  '24×30': [HolePattern.FOUR_CORNERS],
};

const PRISES_GOLD: Record<string, number> = {
  '17×22': 2200,
};

const SIZE_HOLES_GOLD: Record<string, HolePattern[]> = {
  '17×22': [HolePattern.TWO_VERTICAL],
};

const SKU_CODES_GOLD: Record<string, string> = {
  '17×22': '20231',
};

const SKU_CODES_BW: Record<string, string> = {
  '13×19': '20009',
  '17×22': '20010',
  '18×24': '20012',
  '20×30': '20011',
  '24×30': '20013',
};

const SKU_CODES_COLOR: Record<string, string> = {
  '13×19': '20014',
  '17×22': '20015',
  '18×24': '20017',
  '20×30': '20016',
  '24×30': '20018',
};

export const metalRectVertTemplates: TemplateConfig[] = [
  ...metalRectVertBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('T', 'Т'),
      fullTitle: `Вертикальная табличка ${base.replace('T', 'Т')}`,
      material: Material.CERMET,
      shape: Shape.RECTANGLE,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: true,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesMetalRectVert,
      basePrice: 0,
      perHolePrice: 0,
      sizeHolePatterns: SIZE_HOLES,
      sizePrice: PRICES,
      frameCodes: [0, 1, 2, 3, 4, 5, 6],
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.NONE,
        HolePattern.FOUR_CORNERS,
        HolePattern.TWO_VERTICAL,
      ],
      inscribed: index !== 0,
      skuCodes: SKU_CODES_BW,
    };

    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Вертикальная табличка ${bw.label}ц`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES_COLOR,
    };

    return [bw, color];
  }),
  {
    code: 'FTVZ',
    label: 'ФТВЗ',
    material: Material.CERMET,
    shape: Shape.RECTANGLE,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    fullTitle: `Вертикальная табличка с золотой рамкой`,
    requiresBackground: true,
    requiresFinish: false,
    supportsHoles: true,
    sizeLabels: ['17×22'],
    frameCodes: [0, 1, 2, 3, 4, 5, 6],
    basePrice: 0,
    sizePrice: PRISES_GOLD,
    perHolePrice: 0,
    backgroundCodes: [
      300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
      16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
      36, 100, 200,
    ],
    holePatterns: [HolePattern.TWO_VERTICAL],
    goldTypes: ['Т1', 'Т1ц', 'Т2', 'Т2ц', 'Т3', 'Т3ц'],
    sizeHolePatterns: SIZE_HOLES_GOLD,
    inscribed: true,
    skuCodes: SKU_CODES_GOLD,
  },
];
