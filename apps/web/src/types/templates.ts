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
