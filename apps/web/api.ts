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
    finishes: Finish[];
  }[];
  defaults: {
    sizeId: number | null;
    holePattern: HolePattern | null;
    finishes: HolePattern | null;
    frameId: number | null;
    backgroundId: number | null;
  };
};

const isServer = typeof window === 'undefined';

function toApiPath(path: string) {
  // принимает '/auth/profile' или '/api/auth/profile' -> всегда '/api/...'
  return path.startsWith('/api')
    ? path
    : `/api${path.startsWith('/') ? path : `/${path}`}`;
}

function joinBase(base: string, apiPath: string) {
  const b = base.replace(/\/$/, '');
  let p = apiPath;
  if (b.endsWith('/api') && p.startsWith('/api')) p = p.slice(4) || '/';
  return `${b}${p}`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  // --- Server (RSC/Route Handlers) ---
  if (isServer) {
    // Импорт только на сервере, чтобы не тащить модуль в браузер
    const mod = await import('next/headers');
    const headersList = await mod.headers();
    const cookiesList = await mod.cookies();

    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') ?? 'http';
    if (!host) throw new Error('Cannot resolve host for server fetch');

    // Можно переопределить API_BASE (напр. http://api:3001/api) при необходимости
    const base = process.env.API_BASE ?? `${proto}://${host}`;
    const url = joinBase(base, toApiPath(path));

    // Сериализуем все входящие куки в один заголовок Cookie
    const cookieHeader = cookiesList
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join('; ');

    const res = await fetch(url, {
      cache: 'no-store',
      ...init,
      headers: {
        ...(init.headers as Record<string, string> | undefined),
        cookie: cookieHeader,
      },
    });

    if (!res.ok) {
      let data: any = null;
      try {
        data = await res.json();
      } catch {}
      const msg = Array.isArray(data?.message)
        ? data.message.join('; ')
        : data?.message || res.statusText;
      const err: any = new Error(msg);
      err.status = res.status;
      throw err;
    }
    return res.json() as Promise<T>;
  }

  // --- Client (браузер) ---
  const base = process.env.NEXT_PUBLIC_API_BASE || '/api';
  const url = joinBase(base, toApiPath(path));

  const res = await fetch(url, {
    credentials: 'include',
    ...init,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = Array.isArray(data?.message)
      ? data.message.join('; ')
      : data?.message || res.statusText;
    const err: any = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}
