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
    finishes: { id: number; code: string; label: string }[];
  }[];
  defaults: {
    sizeId: number | null;
    holePattern: HolePattern | null;
    frameId: number | null;
    backgroundId: number | null;
  };
};

const API_BASE = process.env.API_BASE || 'http://localhost:3001';

function makeUrl(path: string) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  // в браузере оставляем относительный путь — сработают rewrites Next
  if (typeof window !== 'undefined') return path;
  // на сервере — абсолютный URL (Node fetch требует полный)
  return `${API_BASE}${path}`;
}

export async function api<T>(input: string, init?: RequestInit): Promise<T> {
  const url = makeUrl(input);
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`API ${res.status} ${res.statusText}: ${text}`);
  }
  return res.json() as Promise<T>;
}
