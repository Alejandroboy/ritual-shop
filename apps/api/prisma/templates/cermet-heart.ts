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
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "сердце" ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
