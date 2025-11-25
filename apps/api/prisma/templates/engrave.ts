// ---------- Гравировка на камне (стр. 54–55) ----------
import { sizesEngraving, type TemplateConfig } from './shared.ts';
import {
  ColorMode,
  Coverage,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';

const engravingBases = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];
const PRICES: Record<string, number> = {
  '15×20': 1500,
  '20×25': 2500,
  '20×30': 3500,
  '25×30': 4500,
  '30×40': 5500,
  '30×60': 6500,
  '40×60': 7500,
};

export const engravingTemplates: TemplateConfig[] = engravingBases.map(
  (base) => ({
    code: base,
    label: base.replace('G', 'Г'),
    fullTitle: `Гравировка на камне ${base.replace('G', 'Г')}`,
    material: Material.ENGRAVING,
    shape: Shape.RECTANGLE,
    orientation: Orientation.VERTICAL,
    colorMode: ColorMode.BW,
    coverage: Coverage.NORMAL,
    supportsFrame: false,
    requiresBackground: false,
    requiresFinish: false,
    supportsHoles: true,
    perHolePrice: 350,
    sizeLabels: sizesEngraving,
    sizePrice: PRICES,
    holePatterns: [
      HolePattern.TWO_HORIZONTAL,
      HolePattern.TWO_VERTICAL,
      HolePattern.FOUR_CORNERS,
      HolePattern.NONE,
    ],
  }),
);
