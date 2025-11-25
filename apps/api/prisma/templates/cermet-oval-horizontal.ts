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

export const metalOvalHorTemplates: TemplateConfig[] =
  metalOvalHorBases.flatMap((base) => {
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
      sizePrice: PRICES,
      sizeHolePatterns: SIZE_HOLES,
      sizeLabels: sizesOvalHor,
      frameCodes: [1, 2, 3, 4, 5, 6],
      holePatterns: [
        HolePattern.NONE,
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
      ],
      finishes: [],
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Горизонтальный овал ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  });
