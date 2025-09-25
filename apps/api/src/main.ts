import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupAdmin } from './admin/admin';
import { mkdirSync } from 'fs';
import { join, resolve } from 'path';

function ensureUploadsDirs() {
  // Лучше абсолютный путь: либо из ENV, либо из cwd
  const root = process.env.UPLOADS_DIR
    ? resolve(process.env.UPLOADS_DIR)
    : join(process.cwd(), 'uploads');

  // создаём uploads и uploads/orders
  mkdirSync(root, { recursive: true });
  mkdirSync(join(root, 'orders'), { recursive: true });

  process.env.UPLOADS_DIR = root; // чтобы везде был один и тот же путь
  // короткий лог для контроля
  console.log('[UPLOADS] root:', root);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });

  await setupAdmin(app);
  ensureUploadsDirs();

  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://localhost:3001`);
}
bootstrap();
