import { api } from './api';

export async function postJsonAsset<T>(url: string, body: Body): Promise<T> {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getJsonAsset<T>(url: string): Promise<T> {
  const r = await fetch(url, { credentials: 'include' });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export async function getAssetUrl(
  assetId: string,
  opts?: { download?: boolean },
) {
  const q = opts?.download ? '?download=1' : '';
  return api<{ url: string; expiresIn: number }>(`/assets/${assetId}/url${q}`);
}
