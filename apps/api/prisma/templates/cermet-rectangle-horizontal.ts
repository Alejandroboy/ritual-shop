import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesMetalRectHor, type TemplateConfig } from './shared.ts';

const metalRectHorBases = ['T4', 'T5', 'T6', 'T7', 'T8', 'T9'];

const PRICES: Record<string, number> = {
  '13×19': 1500,
  '17×22': 1800,
  '18×24': 2200,
  '20×30': 2600,
  '24×30': 2700,
};
const SIZE_HOLES: Record<string, HolePattern[]> = {
  '13×19': [HolePattern.TWO_HORIZONTAL],
  '17×22': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
  '18×24': [HolePattern.FOUR_CORNERS],
  '20×30': [HolePattern.TWO_HORIZONTAL, HolePattern.NONE],
  '24×30': [HolePattern.FOUR_CORNERS],
};

export const metalRectHorTemplates: TemplateConfig[] =
  metalRectHorBases.flatMap((base) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('T', 'Т'),
      fullTitle: `Горизонтальная табличка ${base.replace('T', 'Т')}`,
      material: Material.CERMET,
      shape: Shape.RECTANGLE,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: true,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesMetalRectHor,
      frameCodes: [1, 2, 3, 4, 5, 6],
      perHolePrice: 0,
      basePrice: 0,
      sizePrice: PRICES,
      sizeHolePatterns: SIZE_HOLES,
      holePatterns: [
        HolePattern.NONE,
        HolePattern.FOUR_CORNERS,
        HolePattern.TWO_HORIZONTAL,
      ],
      finishes: [],
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Горизонтальная табличка ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  });
