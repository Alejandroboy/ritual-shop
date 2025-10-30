import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance();
  app.setGlobalPrefix('api');
  app.enableCors({ origin: 'http://localhost:3000', credentials: true });
  expressApp.set('trust proxy', 1);
  app.use(cookieParser());
  app.use((req, res, next) => {
    (req as any).reqId = uuid();
    next();
  });
  app.use((req, res, next) => {
    res.on('finish', () => {
      const id = (req as any).reqId;
      console.log(
        `[${id}] ${req.method} ${req.originalUrl} ${res.statusCode} rt:${!!req.cookies?.refresh_token} at:${!!req.cookies?.access_token}`,
      );
    });
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = Number(process.env.PORT || 3001);
  await app.listen(port, '0.0.0.0');
  console.log(`API listening on http://localhost:3001`);
}
bootstrap();
