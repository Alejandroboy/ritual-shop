// ---------- Металлокерамика: фигурные таблички «арка» (стр. 24–25) ----------
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizeArchMetal, type TemplateConfig } from './shared.ts';

const archMetalBases = ['A1', 'A2', 'A3'];
const PRICES: Record<string, number> = {
  '17×24': 1500,
};
export const archMetalTemplates: TemplateConfig[] = archMetalBases.flatMap(
  (base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('A', 'А'),
      fullTitle: `Фигурная табличка "арка" ${base.replace('A', 'А')}`,
      material: Material.CERMET,
      shape: Shape.ARCH,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizeArchMetal,
      perHolePrice: 0,
      sizePrice: PRICES,
      holePatterns: [HolePattern.NONE, HolePattern.TWO_HORIZONTAL],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Фигурная табличка "арка" ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  },
);
