'use client';
import React from 'react';
import Image from 'next/image';
import { getAssetUrl } from '@utils';

type Props = {
  asset: {
    id: string;
    originalName?: string | null;
    contentType?: string | null;
  };
  size?: number; // px
};

export function AssetThumb({ asset, size = 160 }: Props) {
  const [url, setUrl] = React.useState<string | null>(null);
  const isImage = (asset.contentType || '').startsWith('image/');

  React.useEffect(() => {
    let live = true;
    getAssetUrl(asset.id)
      .then(({ url }) => {
        if (live) setUrl(url);
      })
      .catch(() => {});
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

  return isImage ? (
    <Image
      src={url}
      alt={asset.originalName || ''}
      width={size}
      height={size}
      className="object-cover rounded"
      unoptimized
    />
  ) : (
    <a href={url} target="_blank" className="underline text-sm">
      Открыть файл
    </a>
  );
}

export default AssetThumb;
