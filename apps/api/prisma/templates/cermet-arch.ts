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
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  },
);
