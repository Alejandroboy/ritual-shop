export type AssetView = {
  id: string;
  kind: string;
  stage: 'ORIGINAL' | 'RETOUCHED';
  primary: boolean;
  derivedFromId?: string | null;
  originalName?: string | null;
  contentType?: string | null;
  size?: number | null;
  viewUrl: string;
  thumbUrl?: string;
  downloadUrl: string;
  expiresIn: number;
  key?: string;
  thumbKey?: string;
};

export async function fetchAssets(
  orderId: string,
  itemId: string,
  opts?: { stage?: 'ORIGINAL' | 'RETOUCHED'; pairs?: boolean },
) {
  const qs = new URLSearchParams();
  if (opts?.stage) qs.set('stage', opts.stage);
  if (opts?.pairs) qs.set('pairs', '1');
  const res = await fetch(
    `/api/orders/${orderId}/items/${itemId}/assets?${qs}`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to load assets');
  return res.json();
}

export async function createOriginalFromS3(
  orderId: string,
  itemId: string,
  data: {
    bucket: string;
    key: string;
    contentType?: string;
    size?: number;
    etag?: string;
    originalName?: string;
  },
) {
  const res = await fetch(`/api/orders/${orderId}/items/${itemId}/assets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ storage: 's3', ...data }),
  });
  if (!res.ok) throw new Error('Failed to create asset');
  return res.json();
}

export async function createRetouchFromS3(
  orderId: string,
  itemId: string,
  data: {
    sourceAssetId: string;
    bucket: string;
    key: string;
    contentType?: string;
    size?: number;
    etag?: string;
    originalName?: string;
  },
) {
  const res = await fetch(
    `/api/orders/${orderId}/items/${itemId}/assets/retouch`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storage: 's3', ...data }),
    },
  );
  if (!res.ok) throw new Error('Failed to create retouch');
  return res.json();
}

export async function makePrimary(
  orderId: string,
  itemId: string,
  assetId: string,
) {
  const res = await fetch(
    `/api/orders/${orderId}/items/${itemId}/assets/${assetId}/primary`,
    { method: 'PATCH' },
  );
  if (!res.ok) throw new Error('Failed to set primary');
}

export async function removeAsset(
  orderId: string,
  itemId: string,
  assetId: string,
) {
  const res = await fetch(
    `/api/orders/${orderId}/items/${itemId}/assets/${assetId}`,
    { method: 'DELETE' },
  );
  if (!res.ok) throw new Error('Failed to remove asset');
}

export type AssetPair = { original: AssetView; retouch: AssetView };

export async function fetchAssetPairs(orderId: string, itemId: string) {
  const res = await fetch(
    `/api/orders/${orderId}/items/${itemId}/assets?pairs=1`,
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error('Failed to load asset pairs');
  const pairs = await res.json();
  return pairs as AssetPair[];
}
