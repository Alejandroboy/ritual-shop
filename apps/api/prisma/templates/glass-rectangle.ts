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

export const glassRectTemplates: TemplateConfig[] = [
  ...glassRectBasesSingle.flatMap((base) => {
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
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      sizePrice: PRICES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Портрет на стекле ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...glassRectBasesCouple.flatMap((base) => {
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
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      sizePrice: PRICES,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}c`,
      label: `${bw.label}ц`,
      fullTitle: `Портрет на стекле ${bw.label}ц`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
