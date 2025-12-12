// ---------- Стекло: арка (стр. 46–47) ----------
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesStdGlass, type TemplateConfig } from './shared.ts';

const glassArchBasesSingle = ['St1', 'St2', 'St3'];
const glassArchBasesCouple = ['St4', 'St5', 'St6'];

const PRICES: Record<string, number> = {
  '15×20': 1500,
  '20×25': 2500,
  '20×30': 3500,
  '25×30': 4500,
  '30×40': 5500,
  '30×60': 6500,
};

export const glassArchTemplates: TemplateConfig[] = [
  ...glassArchBasesSingle.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('St', 'Ст')} арка`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')} арка`,
      material: Material.GLASS,
      shape: Shape.ARCH,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesStdGlass,
      sizePrice: PRICES,
      perHolePrice: 350,
      basePrice: 0,
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_arch_c`,
      label: `${base.replace('St', 'Ст')}ц арка`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')}ц арка`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...glassArchBasesCouple.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('St', 'Ст')} арка`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')} арка`,
      material: Material.GLASS,
      shape: Shape.ARCH,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: false,
      supportsHoles: true,
      sizeLabels: sizesStdGlass,
      sizePrice: PRICES,
      perHolePrice: 350,
      basePrice: 0,
      holePatterns: [
        HolePattern.TWO_HORIZONTAL,
        HolePattern.TWO_VERTICAL,
        HolePattern.FOUR_CORNERS,
        HolePattern.NONE,
      ],
      inscribed: index !== 0,
    };
    const color: TemplateConfig = {
      ...bw,
      code: `${base}_arch_c`,
      label: `${base.replace('St', 'Ст')}ц арка`,
      fullTitle: `Портрет на стекле ${base.replace('St', 'Ст')}ц арка`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
