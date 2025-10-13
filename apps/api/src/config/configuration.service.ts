import * as dotenv from 'dotenv';
import * as dotenvExpand from 'dotenv-expand';
import { Injectable } from '@nestjs/common';

export type TEnvironmentVariable =
  | 'POSTGRES_DB'
  | 'POSTGRES_USER'
  | 'POSTGRES_PASSWORD'
  | 'POSTGRES_HOST_PORT'
  | 'MAILHOG_SMTP_PORT'
  | 'MAILHOG_UI_PORT'
  | 'DATABASE_URL'
  | 'REDIS_HOST'
  | 'REDIS_HOST_PORT'
  | 'SMTP_HOST'
  | 'SMTP_PORT'
  | 'SMTP_SECURE'
  | 'SMTP_USER'
  | 'SMTP_PASS'
  | 'JWT_EXPIRES'
  | 'JWT_SECRET';

@Injectable()
export class ConfigurationService {
  private readonly envConfig;

  constructor() {
    this.envConfig = dotenvExpand.expand(dotenv.config()).parsed;
  }

  isRedisActive() {
    return this.get('REDIS_HOST_PORT') && this.get('REDIS_HOST_PORT');
  }

  get(key: TEnvironmentVariable): string {
    return process.env[key] || this.envConfig[key];
  }

  private getKeyValueArray(key: TEnvironmentVariable) {
    const envString = this.get(key);

    if (!envString) return [];

    return envString
      .split(',')
      .filter(Boolean)
      .map((providerString) => {
        const [key, value] = providerString.split('=');

        return { key, value };
      });
  }
}
