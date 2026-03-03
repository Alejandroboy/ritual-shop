// ---------- Металлокерамика: фигурные таблички «сердце» (стр. 26–27) ----------
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizeHeart, type TemplateConfig } from './shared.ts';

const heartBasesNormal = ['C1', 'C2', 'C3'];

const PRICES: Record<string, number> = {
  '16×18': 1500,
};

const SKU_CODES_BW: Record<string, string> = {
  '16×18': '20039',
};

const SKU_CODES_COLOR: Record<string, string> = {
  '16×18': '20040',
};

export const heartTemplates: TemplateConfig[] = [
  ...heartBasesNormal.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('C', 'С'),
      fullTitle: `Фигурная табличка "сердце" ${base.replace('C', 'С')}`,
      material: Material.CERMET,
      shape: Shape.HEART,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizeHeart,
      perHolePrice: 0,
      sizePrice: PRICES,
      holePatterns: [HolePattern.NONE, HolePattern.TWO_VERTICAL],
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      inscribed: index !== 0 && index !== 2,
      skuCodes: SKU_CODES_BW,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "сердце" ${bw.label}ц`,
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
];
