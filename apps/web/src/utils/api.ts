import { HttpError } from './http-error';

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
  basePriceMinor: string;
  defaults: {
    sizeId: number | null;
    holePattern: HolePattern | null;
    finishes: HolePattern | null;
    frameId: number | null;
    backgroundId: number | null;
  };
};

type RetryInit = RequestInit & { __retry?: boolean };

const isServer = typeof window === 'undefined';

function toApiPath(path: string) {
  return path.startsWith('/api')
    ? path
    : `/api${path.startsWith('/') ? path : `/${path}`}`;
}

function extractMessage(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data) {
    const m = (data as { message?: unknown }).message;
    if (Array.isArray(m)) return m.join('; ');
    if (typeof m === 'string') return m;
  }
  return fallback;
}

function joinBase(base: string, apiPath: string) {
  const b = base.replace(/\/$/, '');
  let p = apiPath;
  if (b.endsWith('/api') && p.startsWith('/api')) p = p.slice(4) || '/';
  return `${b}${p}`;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (isServer) {
    const mod = await import('next/headers');
    const headersList = await mod.headers();
    const cookiesList = await mod.cookies();

    const host = headersList.get('x-forwarded-host') ?? headersList.get('host');
    const proto = headersList.get('x-forwarded-proto') ?? 'http';
    if (!host) throw new Error('Cannot resolve host for server fetch');

    const base = process.env.API_BASE ?? `${proto}://${host}`;
    const url = joinBase(base, toApiPath(path));

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
      const data = await res.json().catch(() => ({}));
      const msg = extractMessage(data, res.statusText || 'Request failed');
      throw new HttpError(msg, res.status, data);
    }
    return res.json() as Promise<T>;
  }

  // --- Client (браузер) ---
  const base = process.env.NEXT_PUBLIC_API_BASE || '/api';
  const url = joinBase(base, toApiPath(path));

  let __refreshing: Promise<void> | null = null;
  async function ensureRefreshed() {
    if (!__refreshing) {
      __refreshing = (async () => {
        const refreshUrl = joinBase(base, toApiPath('/auth/refresh'));
        const r = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
        });
        if (!r.ok) {
          const body = await r.json().catch(() => ({}));
          const msg = body?.message || `refresh failed: ${r.status}`;
          throw new Error(msg);
        }
      })().finally(() => {
        __refreshing = null;
      });
    }
    return __refreshing;
  }

  async function doFetch(u: string, init: RetryInit = {}) {
    const { __retry, ...rest } = init;
    const res = await fetch(u, { credentials: 'include', ...rest });

    if (res.status === 401 && !__retry) {
      try {
        await ensureRefreshed();
        return doFetch(u, { ...rest, __retry: true });
      } catch {
        return res;
      }
    }
    return res;
  }

  const res = await doFetch(url, init);

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = extractMessage(data, res.statusText || 'Request failed');
    throw new HttpError(msg, res.status, data);
  }
  return res.json() as Promise<T>;
}

export async function getJSON<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function postJSON<T>(url: string, body: Body): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}
