// Текстовые КЧ5–КЧ7 (прямоугольные)
import {
  ColorMode,
  Coverage,
  Finish,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import { sizesWhiteBlackRect, type TemplateConfig } from './shared.ts';

const blackTextBases = ['KCh5', 'KCh6', 'KCh7'];
const PRICES_RECT: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2700,
  '30х60': 2700,
};
export const blackTextTemplates: TemplateConfig[] = blackTextBases.map(
  (base) => ({
    code: base,
    label: base.replace('KCh', 'КЧ'),
    fullTitle: `Черный прямоугольный портрет ${base.replace('KCh', 'КЧ')} на керамограните`,
    material: Material.BLACK_CERAMIC_GRANITE,
    shape: Shape.RECTANGLE,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: false,
    requiresFinish: true,
    supportsHoles: true,
    sizeLabels: sizesWhiteBlackRect,
    sizePrice: PRICES_RECT,
    perHolePrice: 350,
    basePrice: 0,
    finishes: [Finish.MATTE, Finish.GLOSS],
    backgroundCodes: [300],
    singlePerson: base !== 'KCh6',
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
  }),
);
