import { z } from 'zod';

// Пустая строка в .env (`KEY=`) считается «не задано»
const blankToUndefined = (v: unknown) =>
  typeof v === 'string' && v.trim() === '' ? undefined : v;

const env = <T extends z.ZodType>(schema: T) =>
  z.preprocess(blankToUndefined, schema);

// Отдельное сообщение для отсутствующего значения и для неверного формата
const invalid = (message: string) => ({
  error: (issue: { input?: unknown }) =>
    issue.input === undefined ? 'is required' : message,
});

const required = () => z.string('is required');
const optional = () => z.string().optional();
const int = () => z.coerce.number().int().positive();
const port = () => z.coerce.number().int().min(1).max(65535);

export const envSchema = z.object({
  NODE_ENV: env(
    z.enum(['development', 'production', 'test']).default('development'),
  ),
  PORT: env(port().default(3001)),
  PUBLIC_WEB_URL: env(z.url(invalid('must be a valid URL'))),

  // База и очереди
  DATABASE_URL: env(
    z.url({
      protocol: /^postgres(ql)?$/,
      ...invalid('must be a postgresql:// URL'),
    }),
  ),
  REDIS_HOST: env(z.string().default('127.0.0.1')),
  REDIS_PORT: env(port().default(6379)),

  // Авторизация (TTL в секундах, кроме *_MIN / *_DAYS)
  JWT_SECRET: env(required().min(32, 'must be at least 32 characters')),
  JWT_EXPIRES: env(int().default(900)),
  JWT_ACCESS_EXPIRES: env(int().default(3600)),
  JWT_REFRESH_EXPIRES: env(int().default(2592000)),
  ADMIN_ACCESS_TTL_MIN: env(int().optional()),
  ADMIN_REFRESH_TTL_DAYS: env(int().optional()),
  ADMIN_EMAIL: env(z.email(invalid('must be a valid email'))),
  ADMIN_SLA_JSON: env(optional()),

  // Файлы
  S3_ENDPOINT: env(z.url(invalid('must be a valid URL'))),
  S3_BUCKET: env(required()),
  S3_ACCESS_KEY: env(required()),
  S3_SECRET_KEY: env(required()),
  S3_REGION: env(z.string().default('ru-1')),
  PRESIGN_EXPIRES: env(int().default(60 * 60 * 5)),
  UPLOADS_PUBLIC_BASE: env(z.string().default('')),

  // Интеграции
  MOYSKLAD_TOKEN: env(required()),
  DADATA_API_KEY: env(required()),
  TELEGRAM_BOT_TOKEN: env(required()),
  TELEGRAM_BOT_USERNAME: env(required()),
  // Telegram допускает 1–256 символов A-Z, a-z, 0-9, _ и -
  TELEGRAM_WEBHOOK_SECRET: env(
    required().regex(
      /^[A-Za-z0-9_-]{1,256}$/,
      'must be 1-256 characters of A-Z, a-z, 0-9, _ or -',
    ),
  ),

  // Почта
  SMTP_HOST: env(required()),
  SMTP_PORT: env(port().optional()),
  SMTP_SECURE: env(z.stringbool().default(false)),
  SMTP_REQUIRE_TLS: env(z.stringbool().default(false)),
  SMTP_USER: env(optional()),
  SMTP_PASS: env(optional()),
  SMTP_FROM: env(optional()),
  MAIL_FROM: env(optional()),
  MAIL_MODE: env(z.enum(['smtp', 'ethereal', 'json']).default('smtp')),
  MANAGER_EMAIL: env(z.email('must be a valid email').optional()),
});

export type Env = z.infer<typeof envSchema>;

// Сообщения zod не содержат значений, поэтому в лог секреты не попадут
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return result.data;
}
