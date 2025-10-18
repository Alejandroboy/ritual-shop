import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function sanitizeFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, '_');
}

@Injectable()
export class S3Service {
  private s3 = new S3Client({
    region: process.env.S3_REGION || 'ru-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true, // для совместимых S3 надёжнее
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY!,
      secretAccessKey: process.env.S3_SECRET_KEY!,
    },
  });

  private bucket = process.env.S3_BUCKET!;
  private prefix = process.env.S3_PREFIX || 'dev';
  private expires = Number(process.env.PRESIGN_EXPIRES || 60 * 5);

  makeKey(orderId: string, filename: string, itemId?: string) {
    const uid =
      (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2, 10);
    const safe = filename.replace(/[^\w.\-]+/g, '_');
    const base = itemId
      ? `orders/${orderId}/items/${itemId}`
      : `orders/${orderId}/staged`;
    return `${base}/${uid}-${safe}`;
  }

  async signGet(
    { bucket, key }: { bucket?: string | null; key?: string | null },
    opts?: {
      expiresInSec?: number;
      downloadName?: string | null;
      contentType?: string | null;
    },
  ) {
    if (!key) throw new Error('Empty key');
    const Bucket = bucket ?? this.bucket;
    const Key = key;

    const cmd = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentType: opts?.contentType ?? undefined,
      ResponseContentDisposition: opts?.downloadName
        ? `attachment; filename="${encodeURIComponent(opts.downloadName)}"`
        : undefined,
    });

    const expiresIn = opts?.expiresInSec ?? this.expires;
    const url = await getSignedUrl(this.s3, cmd, { expiresIn });
    return { url, expiresIn, bucket: Bucket, key: Key };
  }

  async presignPut(key: string, contentType?: string) {
    const base = { Bucket: this.bucket, Key: key } as any;
    if (contentType) base.ContentType = contentType;
    const cmd = new PutObjectCommand(base);
    const url = await getSignedUrl(this.s3, cmd, { expiresIn: this.expires });
    return {
      url,
      bucket: this.bucket,
      key,
      requiredHeaders: contentType ? { 'Content-Type': contentType } : {},
    };
  }

  async presignGet(
    key: string,
    opts?: {
      filename?: string;
      download?: boolean;
      contentType?: string;
      expiresIn?: number;
    },
  ) {
    const filename =
      opts?.filename?.replace(/"/g, '') || key.split('/').pop() || 'file';
    const disposition = opts?.download
      ? `attachment; filename="${filename}"`
      : `inline; filename="${filename}"`;

    const cmd = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
      // Заголовки ответа, которые S3 подставит в выдачу
      ResponseContentDisposition: disposition,
      ...(opts?.contentType ? { ResponseContentType: opts.contentType } : {}),
    });

    const url = await getSignedUrl(this.s3, cmd, {
      expiresIn: opts?.expiresIn ?? this.expires,
    });
    return { url };
  }
}
