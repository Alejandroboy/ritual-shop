export type CheckStatus = 'up' | 'down';

export interface CheckResult {
  name: string;
  status: CheckStatus;
  latencyMs: number | null;
  details?: Record<string, unknown>;
  error?: string;
}

export interface HealthResponse {
  status: 'ok' | 'error';
  uptimeSec: number;
  timestamp: string;
  checks: {
    postgres: CheckResult;
    redis: CheckResult;
    smtp: CheckResult;
  };
  error?: string;
}
