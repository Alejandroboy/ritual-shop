import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { Readable } from 'stream';

const datasourceUrl = process.env.DATABASE_URL;
if (!datasourceUrl) throw new Error('DATABASE_URL missing');

const pool = new pg.Pool({ connectionString: datasourceUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const s3 = new S3Client({
  region: process.env.S3_REGION || 'ru-1',
  endpoint: process.env.S3_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
});

const bucket = process.env.S3_BUCKET!;

function makeThumbKey(originalKey: string): string {
  const dot = originalKey.lastIndexOf('.');
  if (dot === -1) return originalKey + '_thumb';
  return originalKey.slice(0, dot) + '_thumb' + originalKey.slice(dot);
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) chunks.push(Buffer.from(chunk));
  return Buffer.concat(chunks);
}

async function main() {
  const assets = await prisma.orderItemAsset.findMany({
    where: {
      thumbKey: null,
      storage: 's3',
      contentType: { startsWith: 'image/' },
      key: { not: null },
    },
    select: { id: true, key: true, bucket: true },
  });

  console.log(`Found ${assets.length} assets without thumbnail`);

  for (const asset of assets) {
    const assetBucket = asset.bucket ?? bucket;
    console.log(`Processing ${asset.key}...`);

    try {
      const res = await s3.send(
        new GetObjectCommand({ Bucket: assetBucket, Key: asset.key! }),
      );
      const original = await streamToBuffer(res.Body as Readable);

      const thumb = await sharp(original)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();

      const tk = makeThumbKey(asset.key!);
      await s3.send(
        new PutObjectCommand({
          Bucket: assetBucket,
          Key: tk,
          Body: thumb,
          ContentType: 'image/jpeg',
        }),
      );

      await prisma.orderItemAsset.update({
        where: { id: asset.id },
        data: { thumbKey: tk },
      });

      console.log(`  ✓ ${tk}`);
    } catch (err) {
      console.error(`  ✗ ${asset.id}: ${(err as Error).message}`);
    }
  }

  console.log('Done');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
