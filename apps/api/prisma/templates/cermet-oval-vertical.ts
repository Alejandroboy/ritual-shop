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

export const metalOvalVertTemplates: TemplateConfig[] =
  metalOvalVertBases.flatMap((base) => {
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
      frameCodes: [1, 2, 3, 4, 5, 6],
      basePrice: 0,
      sizePrice: PRICES,
      perHolePrice: 0,
      holePatterns: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
      ],
      sizeHolePatterns: SIZE_HOLES,
      finishes: [],
    };

    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Вертикальный овал ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };

    return [bw, color];
  });
