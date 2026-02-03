// ---------- Белый керамогранит: овал (стр. 32–33) ----------
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

const whiteOvalBasesVert = ['K1', 'K2', 'K3'];
const whiteOvalBasesHor = ['K4', 'K5', 'K6'];
const PRICES_OVAL: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2700,
};
export const whiteOvalTemplates: TemplateConfig[] = [
  ...whiteOvalBasesVert.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('K', 'К')} овал`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')} овал на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.OVAL,
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
      sizePrice: PRICES_OVAL,
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
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К')}ц овал`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')}ц овал на керамограните`,
      backgroundCodes: [
        300, 400, 500, 1, 18, 12, 19, 20, 21, 22, 13, 10, 23, 9, 11, 24, 3, 25,
        16, 14, 26, 27, 28, 29, 30, 31, 32, 2, 8, 17, 6, 33, 15, 7, 5, 4, 34,
        35, 36, 100, 200,
      ],
      colorMode: ColorMode.COLOR,
    };
    return [bw, color];
  }),
  ...whiteOvalBasesHor.flatMap((base, index) => {
    const bw: TemplateConfig = {
      code: `${base}_oval`,
      label: `${base.replace('K', 'К')} овал`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')} овал на керамограните`,
      material: Material.WHITE_CERAMIC_GRANITE,
      shape: Shape.OVAL,
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
      sizePrice: PRICES_OVAL,
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
      code: `${base}_oval_c`,
      label: `${base.replace('K', 'К')}ц овал`,
      fullTitle: `Белый портрет ${base.replace('K', 'К')}ц овал на керамограните`,
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
