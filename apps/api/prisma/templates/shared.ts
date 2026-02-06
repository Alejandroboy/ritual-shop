import {
  ColorMode,
  Coverage,
  Finish,
  HolePattern,
  Material,
  Orientation,
  Shape,
} from '@prisma/client';

export const sizesOvalHor = ['9×12', '13×18', '17×22', '21×27'];
export const sizesOvalVert = ['9×12', '13×18', '17×22', '21×27'];
export const sizesMetalRectVert = ['13×19', '17×22', '18×24', '20×30', '24×30'];
export const sizesMetalRectHor = ['17×22', '20×30', '24×30', '30×40', '16×45'];
export const sizesMetalFullWrap = ['13×19', '17×22'];
export const sizeStar = ['18×24'];
export const sizeArchMetal = ['17×24'];
export const sizeHeart = ['16×18'];

export const sizesWhiteBlackRect = [
  '13×18',
  '15×20',
  '20×25',
  '20×30',
  '25×30',
  '30×40',
  '30×60',
];
export const sizesWhiteBlackArchOval = [
  '13×18',
  '15×20',
  '20×25',
  '20×30',
  '25×30',
  '30×40',
];

export const sizesStdGlass = [
  '15×20',
  '20×25',
  '20×30',
  '25×30',
  '30×40',
  '30×60',
];

export const sizesEngraving = [
  '15×20',
  '20×25',
  '20×30',
  '25×30',
  '30×40',
  '30×60',
  '40×60',
];

export const sizesGrowthRectArch = [
  '40×60',
  '50×70',
  '50×80',
  '55×80',
  '50×100',
  '60×100',
  '60×120',
];
export const sizesGrowthOval = ['40×60', '50×70'];

export type TemplateConfig = {
  code: string; // slug, уникальный
  label: string; // как в каталоге
  material: Material;
  shape: Shape;
  orientation?: Orientation | null;
  colorMode: ColorMode;
  coverage?: Coverage;
  supportsFrame?: boolean;
  requiresBackground?: boolean;
  requiresFinish?: boolean;
  supportsHoles?: boolean;
  fullTitle?: string;
  inscribed?: boolean;
  singlePerson?: boolean;

  sizeLabels: string[]; // "13×18" и т.п.
  holePatterns?: HolePattern[]; // если нужен нестандартный набор
  sizeHolePatterns?: Record<string, HolePattern[]>;
  perHolePrice: number;
  basePrice?: number; // базовая цена по умолчанию для всех размеров шаблона
  sizePrice?: Record<string, number>; // цена для конкретного размера, по label
  frameCodes?: number[]; // коды рамок (1..6)
  backgroundCodes?: number[]; // если нужны конкретные фоны, иначе все
  finishes?: Finish[]; // допустимые финиши
  skuCodes?: Record<string, string>;
};
