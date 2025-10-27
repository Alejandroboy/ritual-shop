export type Refs = {
  sizes: { id: number; name: string; label: string }[];
  frames: { id: number; code: number; name: string }[];
  backgrounds: { id: number; code: string; name: string }[];
  finishes: string[];
  holePatterns: string[];
};

export type Template = {
  label: string;
  basePriceMinor: number;
  frameId: string;
  sizeId: string;
  backgroundId: string;
  finishId: string;
  holeId: string;
  code: string;
  title: string;
  id: string;
  holePattern: string[];
  finishes: string[];
  isActive: boolean;
  allowedHoles: { pattern: string; extraPriceMinor: number }[];
  allowedFinishes: { finish: string; extraPriceMinor: number }[];
  previewPath: string;
  allowedSizes: {
    sizeId: number;
    extraPriceMinor: number;
  }[];
  allowedFrames: {
    frameId: number;
    extraPriceMinor: number;
  }[];
  allowedBackgrounds: {
    backgroundId: number;
    extraPriceMinor: number;
  }[];
};

export type Material =
  | 'CERMET'
  | 'WHITE_CERAMIC_GRANITE'
  | 'BLACK_CERAMIC_GRANITE'
  | 'GLASS'
  | 'GROWTH_PHOTOCERAMICS'
  | 'ENGRAVING';
export type Shape = 'RECTANGLE' | 'OVAL' | 'ARCH' | 'STAR' | 'HEART';
export type Orientation = 'VERTICAL' | 'HORIZONTAL';
export type ColorMode = 'BW' | 'COLOR';
export type Coverage = 'NORMAL' | 'FULL_WRAP';
export type HolePattern =
  | 'NONE'
  | 'TWO_HORIZONTAL'
  | 'TWO_VERTICAL'
  | 'FOUR_CORNERS';
export type Finish = 'MATTE' | 'GLOSS';
export type FinishOption = {
  id: string;
  code: Finish;
  label: string;
};

export type TemplateListItem = {
  id: string;
  code: string;
  label: string;
  material: Material;
  shape: Shape;
  orientation?: Orientation;
  colorMode: ColorMode;
  coverage: Coverage;
  supportsFrame: boolean;
  requiresBackground: boolean;
  requiresFinish: boolean;
  supportsHoles: boolean;
  personsMin: number;
  personsMax: number;
};

export type TemplateDetails = TemplateListItem & {
  sizes: { id: number; label: string; widthCm: number; heightCm: number }[];
  holes: HolePattern[];
  frames: { id: number; code: number; name: string }[];
  backgrounds: { id: number; code: number; name: string }[];
  variants: {
    holePattern: HolePattern;
    finishRequired: boolean;
    finishes: FinishOption[];
  }[];
  basePriceMinor: string;
  defaults: {
    sizeId: number | null;
    holePattern: HolePattern | null;
    finishes: HolePattern | null;
    frameId: number | null;
    backgroundId: number | null;
  };
};
