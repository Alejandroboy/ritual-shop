// ---------- Чёрный керамогранит (стр. 50–53) ----------

// Одинарные: КЧ1 / КЧ2 (прямой), арка, овал
import {
  ColorMode,
  Coverage,
  Finish,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';
import {
  sizesWhiteBlackRect,
  sizesWhiteBlackArchOval,
  type TemplateConfig,
} from './shared.ts';

const blackSingleBases = ['KCh1', 'KCh2'];

const PRICES_RECT: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2700,
  '30х60': 2700,
};
const PRICES_ARCH: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2700,
};
const PRICES_OVAL: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25х30': 2700,
  '30×40': 2700,
};
export const blackSingleTemplates: TemplateConfig[] = [
  // прямоугольники
  ...blackSingleBases.map<TemplateConfig>((base, index) => ({
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
    sizePrice: PRICES_RECT,
    perHolePrice: 350,
    sizeLabels: sizesWhiteBlackRect,
    finishes: [Finish.MATTE, Finish.GLOSS],
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
    inscribed: index !== 0,
  })),
  // арка
  ...blackSingleBases.map<TemplateConfig>((base, index) => ({
    code: `${base}_arch`,
    label: `${base.replace('KCh', 'КЧ')} арка`,
    fullTitle: `Черный портрет ${base.replace('KCh', 'КЧ')} арка на керамограните`,
    material: Material.BLACK_CERAMIC_GRANITE,
    shape: Shape.ARCH,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: false,
    requiresFinish: true,
    supportsHoles: true,
    sizePrice: PRICES_ARCH,
    perHolePrice: 350,
    sizeLabels: sizesWhiteBlackArchOval,
    finishes: [Finish.MATTE, Finish.GLOSS],
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
    inscribed: index !== 0,
  })),
  // овал
  ...blackSingleBases.map<TemplateConfig>((base, index) => ({
    code: `${base}_oval`,
    label: `${base.replace('KCh', 'КЧ')} овал`,
    fullTitle: `Черный портрет ${base.replace('KCh', 'КЧ')} овал на керамограните`,
    material: Material.BLACK_CERAMIC_GRANITE,
    shape: Shape.OVAL,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: false,
    requiresFinish: true,
    supportsHoles: true,
    sizePrice: PRICES_OVAL,
    perHolePrice: 350,
    sizeLabels: sizesWhiteBlackArchOval,
    finishes: [Finish.MATTE, Finish.GLOSS],
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
    inscribed: index !== 0,
  })),
];
