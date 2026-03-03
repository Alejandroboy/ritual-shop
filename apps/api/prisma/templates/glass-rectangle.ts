// ---------- Портреты на стекле: прямоугольная форма (стр. 42–43) ----------
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesStdGlass, type TemplateConfig } from './shared.ts';

const glassRectBasesSingle = ['St1', 'St2', 'St3'];
const glassRectBasesCouple = ['St4', 'St5', 'St6'];

const PRICES: Record<string, number> = {
  '15×20': 1500,
  '20×25': 2500,
  '20×30': 3500,
  '25×30': 4500,
  '30×40': 5500,
  '30×60': 6500,
};

const SKU_CODES: Record<string, string> = {
  '15×20': '20105',
  '20×25': '20106',
  '20×30': '20102',
  '25×30': '20107',
  '30×40': '20103',
  '30×60': '20104',
};

export const glassRectTemplates: TemplateConfig[] = [
  ...glassRectBasesSingle.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('St', 'Ст'),
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')}`,
      material: Material.GLASS,
      shape: Shape.RECTANGLE,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesStdGlass,
      perHolePrice: 350,
      basePrice: 0,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      sizePrice: PRICES,
      inscribed: index !== 0 && index !== 2,
      skuCodes: SKU_CODES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36, 100, 200,
      ],
      fullTitle: `Портрет на стекле ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES,
    };
    return [bw, color];
  }),
  ...glassRectBasesCouple.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: base,
      label: base.replace('St', 'Ст'),
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')}`,
      material: Material.GLASS,
      shape: Shape.RECTANGLE,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesStdGlass,
      perHolePrice: 350,
      basePrice: 0,
      singlePerson: base !== 'St5',
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      sizePrice: PRICES,
      inscribed: index !== 0 && index !== 2,
      skuCodes: SKU_CODES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Портрет на стекле ${bw.label}ц`,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25, 16,
        14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34, 35,
        36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
      skuCodes: SKU_CODES,
    };
    return [bw, color];
  }),
];
