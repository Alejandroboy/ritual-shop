import { api } from './api';

export async function postJsonAsset<T>(url: string, body: any): Promise<T> {
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

/**
 * Загружает файл в S3 по пресайн-URL и регистрирует метаданные ассета в БД.
 * Возвращает сохранённый ассет (как отдаёт твой API).
 */
export async function uploadOrderItemAsset(
  orderId: string,
  itemId: string,
  file: File,
) {
  // 1) запросить пресайн у API
  const presign = await postJsonAsset<{
    url: string;
    bucket: string;
    key: string;
  }>('/api/uploads/presign', {
    orderId,
    itemId,
    filename: file.name,
    contentType: file.type || undefined,
  });
  console.log('[presign]', presign);
  if (!presign?.url || typeof presign.url !== 'string') {
    throw new Error('No presigned URL returned');
  }
  // 2) PUT напрямую в S3
  const putRes = await fetch(presign.url, {
    method: 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file,
  });
  if (!putRes.ok) {
    const text = await putRes.text().catch(() => '');
    console.error('S3 PUT failed', putRes.status, text);
    throw new Error(`S3 PUT failed: ${putRes.status}`);
  }
  const etag = putRes.headers.get('ETag')?.replace(/"/g, '') ?? null;

  // 3) зарегистрировать ассет в БД
  const saved = await postJsonAsset(
    `/api/orders/${orderId}/items/${itemId}/assets`,
    {
      storage: 's3',
      bucket: presign.bucket,
      key: presign.key,
      contentType: file.type,
      size: file.size,
      etag,
      originalName: file.name,
    },
  );

  return saved;
}

export async function getAssetUrl(
  assetId: string,
  opts?: { download?: boolean },
) {
  const q = opts?.download ? '?download=1' : '';
  return api<{ url: string; expiresIn: number }>(`/assets/${assetId}/url${q}`);
}
