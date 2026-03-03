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
  '25×30': 2700,
  '30×40': 2800,
  '30×60': 2900,
};

const sizeFinishRectanglePrice: Record<
  string,
  Partial<Record<Finish, number>>
> = {
  '13×18': { MATTE: 1500, GLOSS: 2000 },
  '15×20': { MATTE: 1800, GLOSS: 2300 },
  '20×25': { MATTE: 2200, GLOSS: 2800 },
  '20×30': { MATTE: 2600, GLOSS: 3100 },
  '25×30': { MATTE: 2700, GLOSS: 3200 },
  '30×40': { MATTE: 2800, GLOSS: 3300 },
  '30×60': { MATTE: 2900, GLOSS: 3200 },
};

const PRICES_ARCH: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25×30': 2700,
  '30×40': 2800,
};

const sizeFinishArchPrice: Record<string, Partial<Record<Finish, number>>> = {
  '13×18': { MATTE: 1500, GLOSS: 2000 },
  '15×20': { MATTE: 1800, GLOSS: 2300 },
  '20×25': { MATTE: 2200, GLOSS: 2700 },
  '20×30': { MATTE: 2600, GLOSS: 3100 },
  '25×30': { MATTE: 2700, GLOSS: 3200 },
  '30×40': { MATTE: 2800, GLOSS: 3300 },
};

const PRICES_OVAL: Record<string, number> = {
  '13×18': 1500,
  '15×20': 1800,
  '20×25': 2200,
  '20×30': 2600,
  '25×30': 2700,
  '30×40': 2700,
};

const sizeFinishOvalPrice: Record<string, Partial<Record<Finish, number>>> = {
  '13×18': { MATTE: 1500, GLOSS: 2000 },
  '15×20': { MATTE: 1800, GLOSS: 2300 },
  '20×25': { MATTE: 2200, GLOSS: 2700 },
  '20×30': { MATTE: 2600, GLOSS: 3100 },
  '25×30': { MATTE: 2700, GLOSS: 3200 },
  '30×40': { MATTE: 2800, GLOSS: 3300 },
};

const SKU_CODES: Record<string, Partial<Record<Finish, string>>> = {
  '13×18': { MATTE: '20126', GLOSS: '20127' },
  '15×20': { MATTE: '20128', GLOSS: '20129' },
  '20×25': { MATTE: '20130', GLOSS: '20131' },
  '20×30': { MATTE: '20120', GLOSS: '20121' },
  '25×30': { MATTE: '20132', GLOSS: '20133' },
  '30×40': { MATTE: '20122', GLOSS: '20123' },
  '30×60': { MATTE: '20124', GLOSS: '20125' },
};

const SKU_CODES_OVAL: Record<string, Partial<Record<Finish, string>>> = {
  '13×18': { MATTE: '20150', GLOSS: '20151' },
  '15×20': { MATTE: '20152', GLOSS: '20153' },
  '20×25': { MATTE: '20154', GLOSS: '20155' },
  '20×30': { MATTE: '20146', GLOSS: '20147' },
  '25×30': { MATTE: '20156', GLOSS: '20157' },
  '30×40': { MATTE: '20148', GLOSS: '20149' },
};

const SKU_CODES_ARCH: Record<string, Partial<Record<Finish, string>>> = {
  '13×18': { MATTE: '20138', GLOSS: '20139' },
  '15×20': { MATTE: '20140', GLOSS: '20141' },
  '20×25': { MATTE: '20142', GLOSS: '20143' },
  '20×30': { MATTE: '20134', GLOSS: '20135' },
  '25×30': { MATTE: '20144', GLOSS: '20145' },
  '30×40': { MATTE: '20136', GLOSS: '20137' },
};

export const blackSingleTemplates: TemplateConfig[] = [
  ...blackSingleBases.map<TemplateConfig>((base, index) => ({
    code: base,
    label: base.replace('KCh', 'КЧ'),
    fullTitle: `Портрет ${base.replace('KCh', 'КЧ')} прямоугольный на черном керамограните`,
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
    sizeFinishPrice: sizeFinishRectanglePrice,
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
    skuCodesFinish: SKU_CODES,
  })),
  ...blackSingleBases.map<TemplateConfig>((base, index) => ({
    code: `${base}_arch`,
    label: `${base.replace('KCh', 'КЧ')} арка`,
    fullTitle: `Портрет ${base.replace('KCh', 'КЧ')} арка на черном керамограните`,
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
    sizeFinishPrice: sizeFinishArchPrice,
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
    skuCodesFinish: SKU_CODES_ARCH,
  })),
  ...blackSingleBases.map<TemplateConfig>((base, index) => ({
    code: `${base}_oval`,
    label: `${base.replace('KCh', 'КЧ')} овал`,
    fullTitle: `Портрет ${base.replace('KCh', 'КЧ')} овал на черном керамограните`,
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
    sizeFinishPrice: sizeFinishOvalPrice,
    perHolePrice: 350,
    sizeLabels: sizesWhiteBlackArchOval,
    finishes: [Finish.MATTE, Finish.GLOSS],
    backgroundCodes: [300],
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
    inscribed: index !== 0,
    skuCodesFinish: SKU_CODES_OVAL,
  })),
];
