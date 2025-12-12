// ---------- Белый керамогранит: арка (стр. 34–35) ----------
import {
  ColorMode,
  Coverage,
  Finish,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesWhiteBlackArchOval, type TemplateConfig } from './shared.ts';

const whiteArchBasesVert = ['K1', 'K2', 'K3'];
const whiteArchBasesHor = ['K4', 'K5', 'K6'];
const PRICES_ARCH: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2700,
};
export const whiteArchTemplates: TemplateConfig[] = [
  ...whiteArchBasesVert.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К')} арка`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')} арка на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.ARCH,
      orientation: Orientation.VERTICAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesWhiteBlackArchOval,
      finishes: [Finish.MATTE, Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_ARCH,
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
      label: `${base.replace('K', 'К')}ц арка`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')}ц арка на керамограните`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...whiteArchBasesHor.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К')} арка`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')} арка на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.ARCH,
      orientation: Orientation.HORIZONTAL,
      colorMode: ColorMode.BW,
      coverage: Coverage.NORMAL,
      supportsFrame: false,
      requiresBackground: true,
      requiresFinish: true,
      supportsHoles: true,
      sizeLabels: sizesWhiteBlackArchOval,
      finishes: [Finish.MATTE, Finish.GLOSS],
      perHolePrice: 350,
      basePrice: 0,
      sizePrice: PRICES_ARCH,
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
      label: `${base.replace('K', 'К')}ц арка`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')}ц арка на керамограните`,
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
