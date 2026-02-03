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

const SKU_CODES_BW: Record<string, string> = {
  '9×12': '00243',
  '13×18': '00226',
  '17×22': '00241',
  '21×27': '00244',
};
const SKU_CODES_COLOR: Record<string, string> = {
  '9×12': '00230',
  '13×18': '00231',
  '17×22': '00241',
  '21×27': '00250',
};

export const metalOvalVertTemplates: TemplateConfig[] =
  metalOvalVertBases.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('F', 'Ф'), // F1 -> Ф1
      material: Material.CERMET,
      shape: Shape.OVAL,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: true,
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
  });
