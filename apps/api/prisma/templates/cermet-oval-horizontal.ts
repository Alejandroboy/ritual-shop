import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesOvalHor, type TemplateConfig } from './shared.ts';

const metalOvalHorBases = ['F4', 'F5', 'F6', 'F12', 'F13'];

const PRICES: Record<string, number> = {
  '9×12': 1500,
  '13×18': 1800,
  '17×22': 2200,
  '21×27': 2600,
};

const SIZE_HOLES: Record<string, HolePattern[]> = {
  '9×12': [HolePattern.TWO_VERTICAL],
  '13×18': [
    HolePattern.TWO_HORIZONTAL,
    HolePattern.TWO_VERTICAL,
    HolePattern.NONE,
  ],
  '17×22': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
  '21×27': [HolePattern.TWO_VERTICAL, HolePattern.NONE],
};
const PRISES_GOLD: Record<string, number> = {
  '13×18': 1800,
  '17×22': 2200,
};

const SIZE_HOLES_GOLD: Record<string, HolePattern[]> = {
  '13×18': [HolePattern.TWO_VERTICAL],
  '17×22': [HolePattern.TWO_VERTICAL],
};

const SKU_CODES_GOLD: Record<string, string> = {
  '13×18': '20166',
  '17×22': '20165',
};

const SKU_CODES_BW: Record<string, string> = {
  '9×12': '20004',
  '13×18': '20002',
  '17×22': '20001',
  '21×27': '20003',
};
const SKU_CODES_COLOR: Record<string, string> = {
  '9×12': '20008',
  '13×18': '20006',
  '17×22': '20005',
  '21×27': '20007',
};

export const metalOvalHorTemplates: TemplateConfig[] = [
  ...metalOvalHorBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('F', 'Ф'),
      fullTitle: `Горизонтальный овал ${base.replace('F', 'Ф')}`,
      material: Material.CERMET,
      shape: Shape.OVAL,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: true,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      basePrice: 0,
      perHolePrice: 0,
      singlePerson: base !== 'F5' && base !== 'F6' && base !== 'F13',
      sizePrice: PRICES,
      sizeHolePatterns: SIZE_HOLES,
      sizeLabels: sizesOvalHor,
      frameCodes: [0, 1, 2, 3, 4, 5, 6],
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
      ],
      finishes: [],
      inscribed: index !== 0,
      skuCodes: SKU_CODES_BW,
      requiresAsset: index === 0 || index === 1 || index === 2,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Горизонтальный овал ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      skuCodes: SKU_CODES_COLOR,
    };
    return [bw, color];
  }),
  {
    code: 'FOGZ',
    label: 'ФОГЗ',
    material: Material.CERMET,
    shape: Shape.OVAL,
    orientation: Orientation.HORIZONTAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    fullTitle: `Горизонтальный овал с золотой рамкой`,
    requiresBackground: true,
    requiresFinish: false,
    supportsHoles: true,
    sizeLabels: ['13×18', '17×22'],
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
    goldTypes: ['Ф4', 'Ф4ц', 'Ф5', 'Ф5ц', 'Ф6', 'Ф6ц'],
    sizeHolePatterns: SIZE_HOLES_GOLD,
    inscribed: true,
    skuCodes: SKU_CODES_GOLD,
    singlePerson: false,
  },
];
