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

const sizeFinishArchPrice: Record<string, Partial<Record<Finish, number>>> = {
  '13×18': { GLOSS: 1500, MATTE: 1100 },
  '15×20': { GLOSS: 1800, MATTE: 1400 },
  '20×25': { GLOSS: 2200, MATTE: 1800 },
  '20×30': { GLOSS: 2600, MATTE: 2200 },
  '25х30': { GLOSS: 2700, MATTE: 2300 },
  '30×40': { GLOSS: 2900, MATTE: 2500 },
};
export const whiteArchTemplates: TemplateConfig[] = [
  ...whiteArchBasesVert.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К')} арка`,
      fullTitle: `Портрет ${base.replace('K', 'К')} арка на белом керамограните`,
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
      sizeFinishPrice: sizeFinishArchPrice,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
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
      fullTitle: `Портрет ${base.replace('K', 'К')}ц арка на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...whiteArchBasesHor.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_arch`,
      label: `${base.replace('K', 'К')} арка`,
      fullTitle: `Портрет ${base.replace('K', 'К')} арка на белом керамограните`,
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
      singlePerson: base !== 'K5' && base !== 'K6',
      sizeFinishPrice: sizeFinishArchPrice,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 100, 200,
      ],
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
      fullTitle: `Портрет ${base.replace('K', 'К')}ц арка на белом керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
];
