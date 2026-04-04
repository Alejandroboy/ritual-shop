// ---------- Металлокерамика: фигурные таблички «звезда» (стр. 23) ----------
import { sizeStar, type TemplateConfig } from './shared.ts';
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Shape,
} from '@prisma/client';

const starBases = ['D1', 'D2', 'D3'];

const PRICES: Record<string, number> = {
  '18×24': 1500,
};

const SKU_CODES_BW: Record<string, string> = {
  '18×24': '20035',
};

const SKU_CODES_COLOR: Record<string, string> = {
  '18×24': '20036',
};

export const starTemplates: TemplateConfig[] = starBases.flatMap(
  (base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('D', 'Д'),
      fullTitle: `Фигурная табличка "звезда" ${base.replace('D', 'Д')}`,
      material: Material.CERMET,
      shape: Shape.STAR,
      orientation: null,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizeStar,
      perHolePrice: 0,
      basePrice: 0,
      sizePrice: PRICES,
      singlePerson: base !== 'D2' && base !== 'D3',
      holePatterns: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      inscribed: index !== 0,
      requiresAsset: true,
      skuCodes: SKU_CODES_BW,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "звезда" ${bw.label}ц`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES_COLOR,
    };
    return [bw, color];
  },
);
