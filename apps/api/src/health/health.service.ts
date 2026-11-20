import { Injectable, Logger } from '@nestjs/common';
import * as net from 'net';
import { ConfigurationService } from '../config/configuration.service';
import { CheckStatus, HealthResponse } from './type';

@Injectable()
export class HealthService {
  private readonly log = new Logger(HealthService.name);

  constructor(private readonly config: ConfigurationService) {}

  private tcpCheck(
    host: string,
    port: number,
    timeoutMs = 2000,
  ): Promise<CheckStatus> {
    return new Promise<CheckStatus>((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const finish = (status: CheckStatus) => {
        if (settled) return;
        settled = true;
        socket.destroy();
        resolve(status);
      };

      socket.setTimeout(timeoutMs);
      socket.once('connect', () => finish('up'));
      socket.once('error', () => finish('down'));
      socket.once('timeout', () => finish('down'));
      try {
        socket.connect(port, host);
      } catch {
        finish('down');
      }
    });
  }

  private checkPostgres(): Promise<CheckStatus> {
    const url = new URL(this.config.get('DATABASE_URL'));
    return this.tcpCheck(url.hostname, url.port ? Number(url.port) : 5432);
  }

  private checkRedis(): Promise<CheckStatus> {
    return this.tcpCheck(
      this.config.get('REDIS_HOST'),
      this.config.get('REDIS_PORT'),
    );
  }

  private checkSmtp(): Promise<CheckStatus> {
    return this.tcpCheck(
      this.config.get('SMTP_HOST'),
      this.config.get('SMTP_PORT') ?? 1025,
    );
  }

  // Наружу отдаём только up/down: без адресов, задержек и текстов ошибок
  async getHealth(): Promise<HealthResponse> {
    try {
      const [postgres, redis, smtp] = await Promise.all([
        this.checkPostgres(),
        this.checkRedis(),
        this.checkSmtp(),
      ]);
      const allUp = [postgres, redis, smtp].every((s) => s === 'up');
      return {
        status: allUp ? 'up' : 'down',
        checks: { postgres, redis, smtp },
      };
    } catch (e) {
      this.log.error(`Health check failed: ${(e as Error)?.name ?? 'Error'}`);
      return {
        status: 'down',
        checks: { postgres: 'down', redis: 'down', smtp: 'down' },
      };
    }
  }
}
