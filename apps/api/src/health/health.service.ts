import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../config/configuration.service';
import { CheckResult, HealthResponse } from './type';
import * as net from 'net';
import { performance as perf } from 'node:perf_hooks';

const now = () => (typeof perf?.now === 'function' ? perf.now() : Date.now());

@Injectable()
export class HealthService {
  constructor(private readonly configurationService: ConfigurationService) {}

  private async tcpCheck(
    name: string,
    host: string,
    port: number,
    timeoutMs = 2000,
  ): Promise<CheckResult> {
    const start = now();
    return new Promise<CheckResult>((resolve) => {
      const socket = new net.Socket();
      let settled = false;

      const finish = (status: 'up' | 'down', err?: Error) => {
        if (settled) return;
        settled = true;
        const latencyMs = Math.round(now() - start);
        try {
          socket.destroy();
        } catch {}
        resolve({
          name,
          status,
          latencyMs,
          details: { host, port },
          ...(err ? { error: err.message } : {}),
        });
      };

      socket.setTimeout(timeoutMs);
      socket.once('connect', () => finish('up'));
      socket.once('error', (e) => finish('down', e));
      socket.once('timeout', () => finish('down', new Error('timeout')));
      try {
        socket.connect(port, host);
      } catch (e: any) {
        finish('down', e);
      }
    });
  }

  private parseHostPortFromUrl(urlStr: string, defPort: number) {
    try {
      const u = new URL(urlStr);
      const host = u.hostname || 'localhost';
      const port = u.port ? Number(u.port) : defPort;
      return { host, port };
    } catch {
      return null;
    }
  }

  async checkPostgres(): Promise<CheckResult> {
    const dbUrl = this.configurationService.get('DATABASE_URL');
    const parsed = dbUrl ? this.parseHostPortFromUrl(dbUrl, 5432) : null;
    if (!parsed) {
      return {
        name: 'postgres',
        status: 'down',
        latencyMs: null,
        error: 'DATABASE_URL not set or invalid',
      };
    }
    return this.tcpCheck('postgres', parsed.host, parsed.port);
  }

  async checkRedis(): Promise<CheckResult> {
    const host = this.configurationService.get('REDIS_HOST');
    const port = Number(
      this.configurationService.get('REDIS_HOST_PORT') ?? '6379',
    );
    return this.tcpCheck('redis', host, port);
  }

  async checkSmtp(): Promise<CheckResult> {
    const host = this.configurationService.get('SMTP_HOST') ?? 'localhost';
    const port = Number(this.configurationService.get('SMTP_PORT') ?? '1025');
    return this.tcpCheck('smtp', host, port);
  }

  async getHealth(): Promise<HealthResponse> {
    try {
      const [pg, rd, sm] = await Promise.all([
        this.checkPostgres(),
        this.checkRedis(),
        this.checkSmtp(),
      ]);
      const allUp = [pg, rd, sm].every((c) => c.status === 'up');
      return {
        status: allUp ? 'ok' : 'error',
        uptimeSec: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: { postgres: pg, redis: rd, smtp: sm },
      };
    } catch (e: any) {
      // на крайний случай — не даём 500, а возвращаем сводку с ошибкой
      return {
        status: 'error',
        uptimeSec: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
        checks: {
          postgres: {
            name: 'postgres',
            status: 'down',
            latencyMs: null,
            error: 'n/a',
          },
          redis: {
            name: 'redis',
            status: 'down',
            latencyMs: null,
            error: 'n/a',
          },
          smtp: { name: 'smtp', status: 'down', latencyMs: null, error: 'n/a' },
        },
        error: e?.message ?? String(e),
      };
    }
  }
}
