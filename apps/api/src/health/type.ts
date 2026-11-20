export type CheckStatus = 'up' | 'down';

export interface HealthResponse {
  status: CheckStatus;
  checks: {
    postgres: CheckStatus;
    redis: CheckStatus;
    smtp: CheckStatus;
  };
}
