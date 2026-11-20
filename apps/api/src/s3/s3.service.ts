import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import sharp from 'sharp';
import { ConfigurationService } from '../config/configuration.service';

function pad2(n: number) {
  return String(n).padStart(2, '0');
}
function monthKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`; // YYYY-MM
}

@Injectable()
export class S3Service {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly expires: number;

  constructor(config: ConfigurationService) {
    this.s3 = new S3Client({
      region: config.get('S3_REGION'),
      endpoint: config.get('S3_ENDPOINT'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.get('S3_ACCESS_KEY'),
        secretAccessKey: config.get('S3_SECRET_KEY'),
      },
    });
    this.bucket = config.get('S3_BUCKET');
    this.expires = config.get('PRESIGN_EXPIRES');
  }

  makeKey(params: {
    orderNumber: string;
    createdAt: Date;
    filename: string;
    itemId?: string;
  }) {
    const ym = monthKey(params.createdAt);

    const base = params.itemId
      ? `orders/${ym}/${params.orderNumber}/items/${params.itemId}`
      : `orders/${ym}/${params.orderNumber}`;

    const uid = Math.random().toString(36).slice(2, 10);
    const ext = params.filename.includes('.')
      ? params.filename.slice(params.filename.lastIndexOf('.'))
      : '';
    return `${base}/${uid}${ext}`;
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
      ResponseContentDisposition: disposition,
      ...(opts?.contentType ? { ResponseContentType: opts.contentType } : {}),
    });

    const url = await getSignedUrl(this.s3, cmd, {
      expiresIn: opts?.expiresIn ?? this.expires,
    });
    return { url };
  }

  async getObject(key: string): Promise<Buffer> {
    const cmd = new GetObjectCommand({ Bucket: this.bucket, Key: key });
    const res = await this.s3.send(cmd);
    const stream = res.Body as Readable;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }

  async putObject(key: string, body: Buffer, contentType: string) {
    const cmd = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    });
    await this.s3.send(cmd);
    return key;
  }

  thumbKey(originalKey: string): string {
    const dot = originalKey.lastIndexOf('.');
    if (dot === -1) return originalKey + '_thumb';
    return originalKey.slice(0, dot) + '_thumb' + originalKey.slice(dot);
  }

  async generateThumb(
    originalKey: string,
    opts: { width?: number; height?: number; quality?: number } = {},
  ): Promise<string> {
    const { width = 300, height = 300, quality = 50 } = opts;

    const original = await this.getObject(originalKey);

    const thumb = await sharp(original)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    const thumbKey = this.thumbKey(originalKey);
    await this.putObject(thumbKey, thumb, 'image/jpeg');

    return thumbKey;
  }

  async deleteObject(
    bucket: string | null | undefined,
    key: string | null | undefined,
  ) {
    if (!key) return;
    const Bucket = bucket ?? this.bucket;
    await this.s3.send(new DeleteObjectCommand({ Bucket, Key: key }));
  }
}
