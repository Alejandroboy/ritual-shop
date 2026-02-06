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

export const metalRectVertTemplates: TemplateConfig[] =
  metalRectVertBases.flatMap((base, index) => {
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
    };

    return [bw, color];
  });
