'use client';
import React from 'react';
import Image from 'next/image';
import { getAssetUrl } from '@utils';

type AssetThumbProps = {
  asset: {
    id: string;
    originalName?: string | null;
    contentType?: string | null;
    thumbKey?: string | null;
    s3Key?: string | null;
    thumbUrl?: string | null;
    viewUrl?: string | null;
  };
  size: number | string;
  primary?: boolean;
  hideDownload?: boolean;
};

export function AssetThumb({ asset, size }: AssetThumbProps) {
  const [url, setUrl] = React.useState<string | null>(
    asset.thumbUrl ?? asset.viewUrl ?? null,
  );
  const [downloadUrl, setDownloadUrl] = React.useState<string>();

  React.useEffect(() => {
    if (asset.thumbUrl ?? asset.viewUrl) return;

    let live = true;
    const keyToSign = asset.thumbKey ?? asset.s3Key ?? null;
    getAssetUrl(asset.id, false, keyToSign)
      .then(({ url }) => {
        if (live) setUrl(url);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [asset.id, asset.thumbKey, asset.s3Key, asset.thumbUrl, asset.viewUrl]);

  React.useEffect(() => {
    getAssetUrl(asset.id, true).then(({ url }) => setDownloadUrl(url));
  }, [asset.id]);

  if (!url) {
    return (
      <div
        className="bg-neutral-100 rounded"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <>
      <Image
        src={url}
        alt={asset.originalName || ''}
        width={0}
        height={0}
        className="object-cover rounded"
        style={{ width: size, height: 'auto' }}
        unoptimized
      />
      <a href={downloadUrl} target="_blank" className="underline text-sm">
        Скачать файл
      </a>
    </>
  );
}
