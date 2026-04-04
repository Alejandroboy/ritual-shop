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

const SKU_CODES_BW: Record<string, string> = {
  '17×24': '20037',
};

const SKU_CODES_COLOR: Record<string, string> = {
  '17×24': '20038',
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
      singlePerson: base !== 'A3',
      sizePrice: PRICES,
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
      fullTitle: `Фигурная табличка "арка" ${bw.label}ц`,
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
