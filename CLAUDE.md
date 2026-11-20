# CLAUDE.md — памятка по проекту ritual-shop

## Назначение

B2B-система заказов на изделия для памятников (фотокерамика, керамогранит, стекло, гравировка):
каталог шаблонов, заказы, загрузка фото, согласование макетов, счета через МойСклад.

- `apps/api` — NestJS 11 + Prisma 7 + PostgreSQL 16 + BullMQ/Redis. Глобальный префикс `/api`, порт 3001.
- `apps/web` — Next.js 16 (App Router) + React 19 + Zustand + Tailwind 4, порт 3000.
- Интеграции: МойСклад, DaData, S3-совместимое хранилище, Telegram-бот, SMTP.
- Деплой: `docker-compose.yml` + Caddy (`/api/*` → api:3001, остальное → web:3000).

## Команды

У `apps/api` и `apps/web` свои `yarn.lock` — ставить зависимости в каталоге приложения (`cd apps/<app> && yarn install`).
В корне — turbo/husky/commitlint/lint-staged (`yarn dev:all | build:all | lint:all | typecheck:all | test:all`).

Локальная инфраструктура (переменные из корневого `.env`: `POSTGRES_*`, `*_HOST_PORT`, `MAILHOG_*`):

```bash
docker compose -f docker-compose.development.yml --profile infrastructure up -d   # Postgres, Redis, MailHog
```

**apps/api** (`cd apps/api`):
| Задача | Команда |
|---|---|
| dev / build / prod | `yarn dev` · `yarn build` · `yarn start:prod` |
| lint (с `--fix`!) | `yarn lint` |
| typecheck | скрипта нет: `yarn tsc --noEmit -p tsconfig.json` |
| тесты | `yarn test` (jest, `src/**/*.spec.ts`), `yarn test:e2e`, `yarn test:cov` |
| prisma generate | `yarn prisma:generate` |
| новая миграция | `yarn prisma:migrate --name <осмысленное_имя>` (= `prisma migrate dev`) |
| применить миграции | `yarn prisma:deploy` (только локально; на сервере — при выкатке) |
| сиды | `yarn prisma:seed` (`prisma db seed`), `yarn prisma:seed-admin`, `yarn prisma:seed-group`, `yarn prisma:seed-once`, `yarn prisma:backfill` |

Конфиг Prisma — `prisma.config.ts` (DATABASE_URL из `.env`).

**Локальная БД с нуля** (дампов в репозитории нет и не будет — `*.sql`/`*.dump`/`db/backups/` в `.gitignore`):

```bash
yarn prisma:deploy                                          # схема
yarn tsx prisma/seed.group.ts                               # справочники: размеры, рамки, фоны, цены отверстий, шаблоны (prisma/templates/*) с ценами
ADMIN_EMAIL=... ADMIN_PASSWORD=... yarn tsx prisma/seed-admin.ts   # первый ADMIN_GOD, пароль ≥ 12 символов
```

`prisma/seed.ts` (и `yarn prisma:seed`) устарел: создаёт `PrismaClient` без adapter и в Prisma 7 падает сразу. Актуальный каталог — `seed.group.ts`.

**apps/web** (`cd apps/web`): `yarn dev` · `yarn build` · `yarn start` · `yarn lint` · `yarn typecheck`. Тестов нет.

## Карта кода

**API (`apps/api/src`)**

- `auth/` — логин/регистрация/refresh; `strategies/` (`jwt`, `jwt-refresh`; токен из cookie `access_token`/`refresh_token` или Bearer; `req.user = { userId, role, email }`), `guards/` (`JwtAuthGuard`, `RolesGuard`), `decorators/` (`@CurrentUser()`, `@Roles(...Role[])`).
- `common/admin.guard.ts` — `AdminGuard` для `admin/*`; `common/mailer.service.ts`, `helpers.ts`.
- `admin/` — `admin-auth`, `admin-orders`, `admin-stats`, `admin-templates`, `admin-users`.
- `orders/` (+ `orders-items/`), `assets/` (фото к позициям), `catalog/`, `users/`, `s3/` (`uploads`), `email/`, `health/` (только up/down), `sync/`, `prisma/` (PrismaService).
- `config/` — окружение: `env.schema.ts` (zod-схема; без обязательных переменных API не стартует и перечисляет, чего не хватает),
  `ConfigurationService.get('KEY')` — типизированная обёртка над `ConfigService`. В `src` не читать `process.env` напрямую:
  новую переменную добавить в схему и во все `.env.example` (корень, `apps/api`, `apps/web`).
- `integrations/moy-sklad` (счета; `invoice-sync.job.ts` — cron каждые 5 мин), `integrations/da-data`, `notifications/telegram`.
- Очереди: `reminders/` — BullMQ-очередь `approval-reminder` (напоминания о согласовании).
- DTO — в `dto/` рядом с модулем, class-validator; глобальный `ValidationPipe({ whitelist, transform })`.
- Схема и миграции: `apps/api/prisma/schema.prisma`, `prisma/migrations/`.

**Web (`apps/web/src`)**

- API-слой: `utils/api.ts` (`api<T>()`, на сервере пробрасывает cookies, `API_BASE`), `assets-api.ts`, `admin-fetch.ts`, `http-error.ts`.
- Стор: `state/app-store.ts` + `state/slices/` (catalog, order, orders, upload, user).
- Админка: `app/admin/*` (orders, orders/bulk-status, templates, templates/pricing, users, users/[id]/invoice).
- Личный кабинет: `app/account/*`; также `catalog/*`, `checkout`, `order/[id]`, `(auth)/login`, `signup`.
- Расчёт цен: `utils/order-pricing.ts`. Типы — `types/`, подписи enum'ов — `utils/labels.ts`.

## Правила работы

- Каждая задача — отдельная ветка от `main`, небольшие коммиты в формате Conventional Commits (проверяет commitlint).
  `git push`, force-push, rebase опубликованных веток и переписывание истории — только по явной команде.
- Никогда не подключаться к рабочей или тестовой БД на сервере и не запускать миграции против них. Только локальная БД.
- Изменения схемы — только через `prisma migrate dev` с осмысленным именем. Уже применённые миграции не редактировать.
  Миграции должны быть безопасны для существующих данных — если нет, предупредить.
- В сыром SQL имена таблиц и колонок — в кавычках (`"Order"`, `"createdAt"`); `@updatedAt` в сыром SQL не срабатывает — ставить `"updatedAt" = NOW()` вручную.
- Секреты — только из переменных окружения, без значений по умолчанию. Новую переменную сразу добавлять в `.env.example` с комментарием.
- Любой эндпоинт API требует авторизации, если не помечен как публичный. Кто вызывает (id, роль, имя) — только из токена
  (`@CurrentUser()`), никогда из тела запроса. Доступ к заказу — владелец или сотрудник.
- Роли сравнивать только через enum `Role` из `@prisma/client`, не строками.
- Все пользовательские данные в HTML-письмах экранировать.
- Не писать в логи персональные данные, токены, куки и SQL-параметры. Логировать через `Logger` Nest, не `console.log`.
- Меняешь контракт API — в той же ветке поправь вызовы во фронтенде.
- Перед «готово»: typecheck и lint обоих приложений и тесты API проходят. В отчёте: что проверено, что нет,
  что нужно сделать на сервере при выкатке (новые переменные, миграции).
- Задача неоднозначна или требует бизнес-решения — спросить, а не угадывать.

## Известные особенности

- `Order` ↔ `OrderItem` — один-к-одному: `Order.items` — один объект (`OrderItem?`), не массив.
- Деньги — целые копейки, поля `*Minor` (`priceMinor`, `perHoleMinor`, `totalMinor`, `paidMinor`).
- Роли: `ADMIN_GOD` > `ADMIN` > `MANAGER` > `CUSTOMER`.
- `OrderStatus`: DRAFT, ACCEPTED, IN_PROGRESS, APPROVAL, COMPLETED, READY, CANCELLED.
- Согласование макета: `ApprovalStage` NOT_STARTED → IN_PROGRESS → APPROVED (+ флаг `approved`); счета: `InvoiceStatus` UNPAID/PARTIAL/PAID.
- Прод-compose передаёт контейнеру `api` корневой `.env` (`env_file`), `DATABASE_URL` для него собирается из `POSTGRES_*`.
- Текущее состояние кода расходится с правилами (чинить отдельными задачами, не попутно): нет глобального guard и
  декоратора `@Public`, часть контроллеров (orders, assets, catalog, `telegram/subscribe-link` с `userId` из query и др.)
  без guards; `AdminGuard` сравнивает роли строками; есть `console.log`, Prisma логирует SQL с параметрами.
