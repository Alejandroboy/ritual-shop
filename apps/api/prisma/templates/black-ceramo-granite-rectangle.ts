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
  '25×30': 2700,
  '30×40': 2700,
  '30×60': 2700,
};

const sizeFinishRectanglePrice: Record<
  string,
  Partial<Record<Finish, number>>
> = {
  '13×18': { MATTE: 1500, GLOSS: 2000 },
  '15×20': { MATTE: 1800, GLOSS: 2300 },
  '20×25': { MATTE: 2200, GLOSS: 2700 },
  '20×30': { MATTE: 2600, GLOSS: 3100 },
  '25×30': { MATTE: 2800, GLOSS: 3300 },
  '30×40': { MATTE: 2900, GLOSS: 3400 },
  '30×60': { MATTE: 3000, GLOSS: 3500 },
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

export const blackTextTemplates: TemplateConfig[] = blackTextBases.map(
  (base) => ({
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
    sizeLabels: sizesWhiteBlackRect,
    sizePrice: PRICES_RECT,
    sizeFinishPrice: sizeFinishRectanglePrice,
    perHolePrice: 350,
    basePrice: 0,
    finishes: [Finish.MATTE, Finish.GLOSS],
    backgroundCodes: [300],
    inscribed: true,
    singlePerson: base !== 'KCh6',
    requiresAsset: base === 'KCh7',
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
    skuCodesFinish: SKU_CODES,
  }),
);
