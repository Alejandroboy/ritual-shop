// ---------- Стекло: овалы (стр. 44–45) ----------
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesStdGlass, type TemplateConfig } from './shared.ts';

const glassOvalBasesSingle = ['St1', 'St2', 'St3'];
const glassOvalBasesCouple = ['St4', 'St5', 'St6'];

const PRICES: Record<string, number> = {
  '15×20': 1500,
  '20×25': 2500,
  '20×30': 3500,
  '25×30': 4500,
  '30×40': 5500,
  '30×60': 6500,
};

const SKU_CODES: Record<string, string> = {
  '15×20': '20111',
  '20×25': '20112',
  '20×30': '20108',
  '25×30': '20113',
  '30×40': '20109',
  '30×60': '20110',
};

export const glassOvalTemplates: TemplateConfig[] = [
  ...glassOvalBasesSingle.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('St', 'Ст')} овал`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')} овал`,
      material: Material.GLASS,
      shape: Shape.OVAL,
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
      sizePrice: PRICES,
      backgroundCodes: [
        400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0 && index !== 2,
      skuCodes: SKU_CODES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('St', 'Ст')}ц овал`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')}ц овал`,
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
  ...glassOvalBasesCouple.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('St', 'Ст')} овал`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')} овал`,
      material: Material.GLASS,
      shape: Shape.OVAL,
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
      sizePrice: PRICES,
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
      inscribed: index !== 0 && index !== 2,
      skuCodes: SKU_CODES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_oval_c`,
      label: `${base.replace('St', 'Ст')}ц овал`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')}ц овал`,
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
