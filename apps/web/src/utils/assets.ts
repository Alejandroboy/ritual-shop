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
  download?: boolean,
  s3Key?: string | null,
) {
  if (s3Key && !download) {
    return api<{ url: string; expiresIn: number }>(
      `/uploads/signed-get?key=${encodeURIComponent(s3Key)}`,
    );
  }

  const q = download ? '?download=1' : '';
  return api<{ url: string; expiresIn: number }>(`/assets/${assetId}/url${q}`);
}
