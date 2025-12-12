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
      holePatterns: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "звезда" ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  },
);
