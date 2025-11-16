'use client';
import React from 'react';
import Image from 'next/image';
import { getAssetUrl } from '@utils';

type AssetThumbProps = {
  asset: {
    id: string;
    originalName?: string | null;
    contentType?: string | null;
  };
  size: number;
  primary?: boolean;
};

export function AssetThumb({ asset, size = 160 }: AssetThumbProps) {
  const [url, setUrl] = React.useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string>();

  React.useEffect(() => {
    let live = true;
    getAssetUrl(asset.id)
      .then(({ url }) => {
        if (live) setUrl(url);
      })
      .catch(() => {});
    getAssetUrl(asset.id, true).then(({ url }) => setDownloadUrl(url));
    return () => {
      live = false;
    };
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
