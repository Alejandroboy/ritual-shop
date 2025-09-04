import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'error' | 'warn' | 'beforeExit'
  >
  implements OnModuleInit
{
  constructor() {
    super({
      log: [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'event' },
        { level: 'warn', emit: 'event' },
      ],
    });
  }
  async onModuleInit() {
    await this.$connect();
    this.$on('query', (e) => {
      console.log('[prisma:query]', e.query, e.params, `${e.duration}ms`);
    });
    this.$on('error', (e) => {
      console.error('[prisma:error]', e);
    });
    this.$on('warn', (e) => {
      console.warn('[prisma:warn]', e);
    });
  }
  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
