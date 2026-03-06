import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesOvalVert, type TemplateConfig } from './shared.ts';

const metalOvalVertBases = ['F1', 'F2', 'F3', 'F7', 'F8', 'F9'];
const PRICES: Record<string, number> = {
  '9×12': 1500,
  '13×18': 1800,
  '17×22': 2200,
  '21×27': 2600,
};

const PRISES_GOLD: Record<string, number> = {
  '13×18': 1800,
  '17×22': 2200,
};

const SIZE_HOLES: Record<string, HolePattern[]> = {
  '9×12': [HolePattern.TWO_HORIZONTAL],
  '13×18': [
    HolePattern.TWO_HORIZONTAL,
    HolePattern.TWO_VERTICAL,
    HolePattern.NONE,
  ],
  '17×22': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
  '21×27': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
};

const SIZE_HOLES_GOLD: Record<string, HolePattern[]> = {
  '13×18': [HolePattern.TWO_HORIZONTAL],
  '17×22': [HolePattern.TWO_HORIZONTAL],
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

const SKU_CODES_GOLD: Record<string, string> = {
  '13×18': '20166',
  '17×22': '20165',
};

export const metalOvalVertTemplates: TemplateConfig[] = [
  ...metalOvalVertBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('F', 'Ф'),
      material: Material.CERMET,
      shape: Shape.OVAL,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      fullTitle: `Вертикальный овал ${base.replace('F', 'Ф')}`,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesOvalVert,
      frameCodes: [0, 1, 2, 3, 4, 5, 6],
      basePrice: 0,
      sizePrice: PRICES,
      perHolePrice: 0,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
      ],
      sizeHolePatterns: SIZE_HOLES,
      inscribed: index !== 0,
      skuCodes: SKU_CODES_BW,
    };

    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Вертикальный овал ${bw.label}ц`,
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
    code: 'FOVZ',
    label: 'ФОВЗ',
    material: Material.CERMET,
    shape: Shape.OVAL,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    fullTitle: `Вертикальный овал с золотой рамкой`,
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
    holePatterns: [HolePattern.TWO_HORIZONTAL],
    goldTypes: ['Ф1', 'Ф1ц', 'Ф2', 'Ф2ц', 'Ф3', 'Ф3ц'],
    sizeHolePatterns: SIZE_HOLES_GOLD,
    inscribed: true,
    skuCodes: SKU_CODES_GOLD,
  },
];
