import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { HealthResponse } from './type';
import { ConfigurationService } from '../config/configuration.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
    private readonly configurationService: ConfigurationService,
  ) {}

  @Get()
  async root(): Promise<HealthResponse> {
    try {
      return await this.healthService.getHealth();
    } catch (e: any) {
      console.log('error', e);
      return {
        status: 'error',
        uptimeSec: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
          postgres: {
            name: 'postgres',
            status: 'down',
            latencyMs: null,
            error: 'controller',
          },
          redis: {
            name: 'redis',
            status: 'down',
            latencyMs: null,
            error: 'controller',
          },
          smtp: {
            name: 'smtp',
            status: 'down',
            latencyMs: null,
            error: 'controller',
          },
        },
        error: e?.message ?? String(e),
      };
    }
  }

  @Get('env')
  env() {
    return {
      databaseUrl: this.configurationService.get('DATABASE_URL'),
      redisUrl: this.configurationService.get('REDIS_URL'),
      host: this.configurationService.get('SMTP_HOST'),
      port: this.configurationService.get('SMTP_PORT'),
      secure: this.configurationService.get('SMTP_SECURE'),
    };
  }
}
