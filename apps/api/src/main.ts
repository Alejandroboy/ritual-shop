import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
// import config from '@repo/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const cfg = config();
  await app.listen(3001);
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${3001}`);
}
bootstrap();
