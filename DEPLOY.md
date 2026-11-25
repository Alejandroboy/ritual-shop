# Развёртывание ritual-shop

Инструкции: локальная разработка, первый запуск на новом VPS и обновление уже работающего стенда.

Стек: `apps/api` (NestJS, порт 3001, префикс `/api`) · `apps/web` (Next.js, порт 3000) · PostgreSQL 16 · Redis 7 · Caddy (TLS, reverse proxy).

Содержание:

1. [Локально](#1-локально)
2. [Новый сервер](#2-новый-сервер-первый-деплой) — в т.ч. [Caddy](#23-caddy-reverse-proxy-и-tls) (`Caddyfile`, домен, TLS, reload)
3. [Обновление стенда](#3-обновление-существующего-стенда)
4. [Команды на сервере](#4-полезные-команды-на-сервере)
5. [Архитектура](#5-архитектура-на-проде)

| Окружение  | Compose                                                       | Что запускается                                                            |
| ---------- | ------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Локально   | `docker-compose.development.yml` (`--profile infrastructure`) | Только Postgres, Redis, MailHog. API и web — на хосте через yarn           |
| Прод / VPS | `docker-compose.yml`                                          | Caddy, db, redis, api, web (+ MailHog в compose — см. замечания по портам) |

Вспомогательные скрипты:

| Задача                    | Команда                                                       |
| ------------------------- | ------------------------------------------------------------- |
| Локальный старт           | `yarn dev:up` → `scripts/dev-up.sh`                           |
| Локальная остановка инфры | `yarn dev:down` → `scripts/dev-down.sh`                       |
| Первый деплой на VPS      | `./scripts/deploy-bootstrap.sh` (или `yarn deploy:bootstrap`) |
| Обновление VPS            | `./scripts/deploy-update.sh` (или `yarn deploy:update`)       |

Ниже те же шаги есть и вручную через `docker compose`.

---

## 1. Локально

### Требования

- Node.js 22+, Yarn 1.22
- Docker Desktop (или Docker Engine + Compose v2)
- Скопированные env-файлы (секреты не коммитить)

### Первый раз

```bash
git clone git@github.com:Alejandroboy/ritual-shop.git
cd ritual-shop

cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Заполни обязательные поля. Для локали типично:

**Корень `.env` (порты compose):**

```env
POSTGRES_DB=ritual
POSTGRES_USER=ritual
POSTGRES_PASSWORD=<длинный_пароль>
POSTGRES_HOST_PORT=5433
REDIS_HOST_PORT=6380
MAILHOG_SMTP_PORT=1025
MAILHOG_UI_PORT=8025
```

**`apps/api/.env` (Nest читает именно этот файл):**

```env
NODE_ENV=development
PORT=3001
PUBLIC_WEB_URL=http://localhost:3000
DATABASE_URL=postgresql://ritual:<пароль>@127.0.0.1:5433/ritual?schema=public
REDIS_HOST=127.0.0.1
REDIS_PORT=6380
JWT_SECRET=<не короче 32 символов, openssl rand -base64 48>
ADMIN_EMAIL=you@example.com
# остальные [required] из apps/api/.env.example: S3_*, MOYSKLAD_TOKEN, DADATA_API_KEY,
# TELEGRAM_*, SMTP_HOST (локально — 127.0.0.1 + MailHog)
SMTP_HOST=127.0.0.1
SMTP_PORT=1025
MAIL_MODE=smtp
```

**`apps/web/.env.local`:**

```env
API_BASE=http://localhost:3001/api
NEXT_PUBLIC_API_BASE=/api
```

Установка зависимостей (у каждого приложения свой `yarn.lock`):

```bash
cd apps/api && yarn install && cd ../..
cd apps/web && yarn install && cd ../..
# опционально корень для turbo/husky:
yarn install
```

Инфраструктура + миграции + сиды:

```bash
docker compose -f docker-compose.development.yml --profile infrastructure up -d

cd apps/api
yarn prisma:generate
yarn prisma:deploy
yarn tsx prisma/seed.group.ts
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='не_короче_12_символов' yarn tsx prisma/seed-admin.ts
cd ../..
```

`yarn prisma:seed` / `prisma/seed.ts` устарели (Prisma 7) — каталог поднимай через `seed.group.ts`.

### Ежедневный старт

Со скриптами:

```bash
yarn dev:up                 # инфра + yarn dev:all
yarn dev:up -- --migrate    # + prisma migrate deploy
yarn dev:up -- --infra-only # только Postgres/Redis/MailHog
yarn dev:down               # остановить инфру (данные в volume сохраняются)
```

Вручную:

```bash
docker compose -f docker-compose.development.yml --profile infrastructure up -d
yarn dev:all
```

- Web: http://localhost:3000
- API health: http://localhost:3001/api/health
- MailHog UI: http://localhost:8025 (или порт из `MAILHOG_UI_PORT`)

Ctrl+C останавливает API/web; контейнеры инфры продолжают работать, пока не сделаешь `yarn dev:down`.

### Локальные правила

- Миграции схемы — только локально: `cd apps/api && yarn prisma:migrate --name <имя>`.
- Не подключайся к рабочей/тестовой БД на сервере и не гоняй туда `migrate` с ноутбука.
- Дампов БД в репозитории нет (`*.sql` / `*.dump` / `db/backups/` в `.gitignore`).

---

## 2. Новый сервер (первый деплой)

Ориентир по железу: тариф вроде **Старт-4** (4 vCPU, 4 ГБ RAM, 20 ГБ диск) — хватает для стека, но диск узкий под Docker-слои, а сборка Next.js на 4 ГБ может упереться в RAM. Ниже — практичные ограничения.

### 2.1. Подготовка VPS

1. Чистый Linux (Ubuntu 22.04/24.04 LTS удобнее всего).
2. DNS: A-запись домена (например `ritual.example.org`) → публичный IP сервера. Подожди, пока запись резолвится (`dig +short ritual.example.org`).
3. Firewall: снаружи нужны только HTTP/HTTPS для Caddy (сертификат Let’s Encrypt и сайт) и SSH. Остальное закрыть.
4. На 20 ГБ диска после успешных деплоев чисти старые образы (`./scripts/deploy-update.sh --prune` или `docker image prune -f`).

#### Firewall (Ubuntu, `ufw`)

Compose пробрасывает на хост и служебные порты (`POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`, MailHog, `3000`, `3001`). Их нельзя оставлять доступными из интернета.

```bash
# поставить ufw, если нет
sudo apt-get update && sudo apt-get install -y ufw

# порядок важен: сначала SSH, иначе можно отрезать себе доступ
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow OpenSSH
# или явно: sudo ufw allow 22/tcp
# лучше ограничить SSH своим IP:
# sudo ufw allow from <ТВОЙ_ПУБЛИЧНЫЙ_IP> to any port 22 proto tcp

# сайт и TLS (Caddy слушает эти порты на хосте)
sudo ufw allow 80/tcp comment 'Caddy HTTP (ACME + redirect)'
sudo ufw allow 443/tcp comment 'Caddy HTTPS'

sudo ufw enable
sudo ufw status verbose
```

Проверка с другой машины (не с самого VPS): `curl -I http://<IP>` должен достучаться до Caddy после `up`; `nc -vz <IP> 5433` (или твой `POSTGRES_HOST_PORT`) — **не** должен.

Если у хостера отдельный «Firewall / Security groups» в панели — там тоже разреши входящие **TCP 80, 443, 22** и ничего больше для этого сервера.

#### Swap (4 ГБ RAM, перед первой сборкой)

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

#### Docker (если ещё нет)

Официальный удобный скрипт: https://get.docker.com  
Команда из многих гайдов `curl -fsSL https://get.docker.com | sh` **работает**, но флаг `-s` (silent) глушит вывод: минуту–две может казаться, что «ничего не происходит», пока качается скрипт и пакеты. Нужен root (`sudo` или сессия под `root`).

Прозрачный вариант (видно прогресс и ошибки):

```bash
# 1) есть ли уже Docker
command -v docker && docker --version

# 2) сеть до установщика (если тут висит — проблема у VPS/DNS/firewall, не у Docker)
curl -fL --connect-timeout 15 --max-time 60 -o /tmp/get-docker.sh https://get.docker.com
wc -c /tmp/get-docker.sh   # должен быть непустой скрипт, обычно десятки KB
head -n 5 /tmp/get-docker.sh

# 3) установка (займёт несколько минут, пойдёт apt/yum и скачивание пакетов)
sudo sh /tmp/get-docker.sh

# 4) сервис и доступ без постоянного root
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"   # затем полностью выйди из SSH и зайди снова
docker info
```

##### Если `curl: (28) SSL connection timeout` к get.docker.com

Скрипт с get.docker.com на части VPS (в т.ч. RU-облака) недоступен: режется исходящий HTTPS до этого хоста. Это не «сломанный curl», а сеть/фильтрация у провайдера.

Сначала диагностика:

```bash
# общий HTTPS
curl -4 -I --connect-timeout 10 --max-time 20 https://1.1.1.1
curl -4 -I --connect-timeout 10 --max-time 20 https://deb.debian.org
curl -4 -I --connect-timeout 10 --max-time 20 https://get.docker.com
curl -4 -I --connect-timeout 10 --max-time 20 https://download.docker.com
```

**Предпочтительный обход на Ubuntu** — пакеты из зеркал дистрибутива (обычно те же, что `apt update`, без get.docker.com):

```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
docker --version
docker compose version
sudo usermod -aG docker "$USER"   # если работаешь не под root — потом перелогинься
docker info
```

`docker.io` + `docker-compose-v2` достаточно для этого проекта (`docker compose -f docker-compose.yml …`). Версия чуть старше официального Docker CE — для нашего стека нормально.

Если нужен именно Docker CE, а `download.docker.com` тоже таймаутится — CE с официального репо не поставить, пока хостер не откроет доступ или не даст HTTP-прокси; тогда оставайся на `docker.io`.

Официальный CE-репозиторий (только если `curl` до `download.docker.com` проходит):

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
```

Также поправь bootstrap: флаг `--install-docker` внутри вызывает get.docker.com — на таком VPS **не используй** его, поставь Docker через `apt` как выше, затем:

```bash
./scripts/deploy-bootstrap.sh --domain <твой-домен> --seed
```

### 2.2. Репозиторий и env

```bash
sudo mkdir -p /opt/ritual-shop
sudo chown "$USER":"$USER" /opt/ritual-shop
git clone git@github.com:Alejandroboy/ritual-shop.git /opt/ritual-shop
cd /opt/ritual-shop

cp .env.example .env
cp apps/web/.env.example apps/web/.env.local
# отредактируй оба файла
```

**Корневой `.env`** уходит в контейнер `api` (`env_file`) и в compose. `DATABASE_URL` для api в проде **перекрывается** compose’ом на `postgresql://…@db:5432/…` — в `.env` всё равно задай валидный URL (схема Zod на старте), например тот же хост `db`.

Обязательно заполни (см. `.env.example`):

- `POSTGRES_*`, `POSTGRES_HOST_PORT`, `REDIS_HOST_PORT`, `MAILHOG_*_PORT`
- `NODE_ENV=production`
- `PUBLIC_WEB_URL=https://<твой-домен>`
- `JWT_SECRET` (≥ 32 символов)
- `ADMIN_EMAIL`
- `S3_*`, `MOYSKLAD_TOKEN`, `DADATA_API_KEY`
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_WEBHOOK_SECRET`
- `SMTP_HOST` (+ при необходимости user/pass/from)

**`apps/web/.env.local`** (нужен при `docker compose build web`; `NEXT_PUBLIC_*` вшивается на этапе сборки):

```env
API_BASE=http://api:3001/api
NEXT_PUBLIC_API_BASE=/api
DOCKER=1
```

Дальше обязательно настрой Caddy (домен + TLS) — см. раздел [2.3. Caddy](#23-caddy-reverse-proxy-и-tls). Без совпадения домена в `Caddyfile`, DNS и `PUBLIC_WEB_URL` сайт снаружи не поднимется.

### 2.3. Caddy (reverse proxy и TLS)

Caddy — единственная точка входа с интернета: слушает **TCP 80 и 443** на хосте, сам получает сертификат Let’s Encrypt, терминирует HTTPS и проксирует запросы в контейнеры `api` и `web` по внутренней Docker-сети (имена сервисов `api` / `web` из `docker-compose.yml`).

Локально Caddy **не используется**: в `docker-compose.development.yml` его нет, браузер ходит на `localhost:3000`, API — на `localhost:3001`.

#### Где лежит конфиг

| Что                          | Путь                                                                                              |
| ---------------------------- | ------------------------------------------------------------------------------------------------- |
| Файл в репозитории           | [`Caddyfile`](Caddyfile) в **корне** проекта (`/opt/ritual-shop/Caddyfile` на сервере)            |
| Монтирование в контейнер     | `./Caddyfile` → `/etc/caddy/Caddyfile` (только чтение), см. сервис `caddy` в `docker-compose.yml` |
| Сертификаты / состояние ACME | Docker volume `caddy_data` → `/data` внутри контейнера (не в git)                                 |
| Рабочий конфиг Caddy         | volume `caddy_config` → `/config`                                                                 |

Фрагмент compose:

```yaml
caddy:
  image: caddy:2.8
  ports:
    - '80:80'
    - '443:443'
  volumes:
    - ./Caddyfile:/etc/caddy/Caddyfile:ro
    - caddy_data:/data
    - caddy_config:/config
  depends_on:
    web:
      condition: service_started
```

Порты **80/443** должны быть свободны на хосте (не ставь параллельно nginx/apache на те же порты).

#### Что делает текущий Caddyfile

Актуальный файл в репо (домен в первой строке — замени на свой):

```caddyfile
ritual.alejandrogroup.org {
  encode zstd gzip

  # API: Nest слушает с глобальным префиксом /api
  @api path /api/*
  handle @api {
    reverse_proxy api:3001
  }

  # Админка Next.js (явно; тот же бэкенд, что и catch-all ниже)
  @admin path /admin*
  handle @admin {
    reverse_proxy web:3000
  }

  # Каталог, ЛК, остальной фронт
  handle {
    reverse_proxy web:3000
  }

  header {
    Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    X-Content-Type-Options "nosniff"
    X-Frame-Options "DENY"
    Referrer-Policy "no-referrer-when-downgrade"
  }

  log {
    output stdout
    format console
  }
}
```

Маршрутизация:

| Запрос снаружи             | Куда уходит                                                               |
| -------------------------- | ------------------------------------------------------------------------- |
| `https://<домен>/api/...`  | контейнер `api:3001` (полный путь сохраняется, т.е. `/api/health` → Nest) |
| `https://<домен>/admin...` | контейнер `web:3000`                                                      |
| всё остальное              | контейнер `web:3000`                                                      |

Имена `api` и `web` — DNS Docker Compose внутри сети стека. С хоста так обращаться не нужно: снаружи только Caddy.

#### Как задать домен

Домен должен быть **один и тот же** в трёх местах:

1. DNS A-запись → IP VPS
2. Первая строка `Caddyfile`: `<домен> {`
3. `PUBLIC_WEB_URL=https://<домен>` в корневом `.env` (ссылки в письмах и Telegram)

**Вариант A — вручную** (перед первым `up` или при смене домена):

```bash
cd /opt/ritual-shop
nano Caddyfile
# замени первую строку, например:
# ritual.example.org {
```

**Вариант B — скрипт bootstrap** переписывает только первую строку файла:

```bash
./scripts/deploy-bootstrap.sh --domain ritual.example.org --seed
```

`scripts/deploy/_common.sh` → `set_caddy_domain`: подставляет `HOST {` вместо строки №1. Остальные директивы не трогает. Скрипт `deploy-update` домен **не меняет** — при смене хоста правь `Caddyfile` руками и перезапусти caddy.

Несколько имён на один сайт (apex + www), если нужно:

```caddyfile
ritual.example.org, www.ritual.example.org {
  # ... тот же body
}
```

Для www добавь отдельную A/AAAA (или CNAME на apex) в DNS.

#### TLS (Let’s Encrypt)

При site-address без схемы (`example.org {`, не `:80`) Caddy автоматически:

1. Слушает 80 и 443
2. Редиректит HTTP → HTTPS
3. Выпускает и продлевает сертификат Let’s Encrypt (HTTP-01), кладёт его в volume `caddy_data`

Чтобы выпуск сработал:

- A-запись домена уже указывает на этот сервер (`dig +short <домен>` → IP VPS)
- С интернета открыты входящие **TCP 80 и 443** (см. ufw выше + панель хостера)
- На 80/443 никто другой не слушает
- В `Caddyfile` именно публичное имя, а не IP и не `localhost`

Пока DNS/firewall не готовы, Caddy будет рестартиться или логировать ошибки ACME — смотри `docker compose logs -f caddy`.

Временный HTTP без сертификата (только отладка, не для прода):

```caddyfile
http://ritual.example.org {
  reverse_proxy web:3000
}
```

Так лучше не оставлять в проде.

#### Применить изменения Caddyfile

Файл смонтирован с хоста. После правки:

```bash
cd /opt/ritual-shop

# проверить синтаксис внутри образа
docker compose -f docker-compose.yml exec caddy caddy validate --config /etc/caddy/Caddyfile

# подхватить конфиг без пересоздания всего стека
docker compose -f docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

# если reload не помог или контейнера ещё не было
docker compose -f docker-compose.yml up -d --force-recreate caddy
```

Логи:

```bash
docker compose -f docker-compose.yml logs -f caddy
```

#### Типичные сбои

| Симптом                                | Что проверить                                                                                                             |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Браузер: certificate error / нет HTTPS | DNS на этот IP? `ufw status` — есть 80 и 443? `logs caddy` — ACME                                                         |
| 502 Bad Gateway                        | `docker compose ps` — живы ли `api`/`web`? Имена в Caddyfile — `api`/`web`, не `localhost`                                |
| `/api/...` 404 на фронте, API «молчит» | блок `@api path /api/*` на месте; Nest с префиксом `/api`; с сервера: `curl -fsS http://127.0.0.1:3001/api/health`        |
| Старый домен после смены               | обновил первую строку Caddyfile + `PUBLIC_WEB_URL` + DNS? сделал `caddy reload`?                                          |
| После `git pull` домен снова чужой     | в репо закоммичен чужой хост — на сервере поправь `Caddyfile` снова (или не коммить серверный домен, правь только на VPS) |

### 2.4. Запуск со скриптом

```bash
cd /opt/ritual-shop
chmod +x scripts/deploy-bootstrap.sh scripts/deploy-update.sh scripts/deploy/_common.sh

./scripts/deploy-bootstrap.sh \
  --install-docker \
  --domain ritual.example.org \
  --seed
```

Скрипт: при `--domain` перепишет первую строку `Caddyfile` → проверит Docker и env → поднимет db/redis → `docker compose build api web` → `prisma migrate deploy` → опционально `seed.group.ts` → `up -d` (включая **caddy**) → health-check.

### 2.5. Запуск вручную (без скрипта)

```bash
cd /opt/ritual-shop

# 0) домен в Caddyfile и PUBLIC_WEB_URL=https://<домен> в .env — уже заданы
# 1) инфра
docker compose -f docker-compose.yml up -d db redis

# 2) сборка (по очереди — меньше пик RAM/сети)
docker compose -f docker-compose.yml build api
docker compose -f docker-compose.yml build web

# 3) миграции (one-shot контейнер api)
docker compose -f docker-compose.yml run --rm --no-deps api npx prisma migrate deploy

# 4) каталог (только на пустой БД)
docker compose -f docker-compose.yml run --rm --no-deps api yarn tsx prisma/seed.group.ts

# 5) весь стек, включая caddy (80/443)
docker compose -f docker-compose.yml up -d
```

Если `yarn install` в Docker таймаутится до registry — в Dockerfile’ах api/web уже есть `registry.npmjs.org` и увеличенный `network-timeout`; собирай по одному сервису и с `--progress=plain`.

### 2.6. Первый администратор

После того как api жив:

```bash
docker compose -f docker-compose.yml exec api sh -c \
  'ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD="не_короче_12" yarn tsx prisma/seed-admin.ts'
```

Создаётся `ADMIN_GOD`. `ADMIN_PASSWORD` в `.env` для рантайма не нужен — только для этого сида.

### 2.7. Проверка

```bash
docker compose -f docker-compose.yml ps
curl -fsS http://127.0.0.1:3001/api/health
curl -fsSI https://<твой-домен>/
curl -fsS https://<твой-домен>/api/health
docker compose -f docker-compose.yml logs --tail=80 caddy
```

Telegram: webhook на `https://<домен>/api/...` (как в коде бота), `secret_token` = `TELEGRAM_WEBHOOK_SECRET`.

---

## 3. Обновление существующего стенда

Делай **на сервере** (или одной SSH-командой с ноутбука). Не гоняй `prisma migrate` с локальной машины против прод-БД.

### Со скриптом

```bash
cd /opt/ritual-shop
./scripts/deploy-update.sh              # fetch + ff-only pull + build + migrate + up
./scripts/deploy-update.sh --ref main   # явная ветка/тег
./scripts/deploy-update.sh --prune      # + docker image prune -f (полезно на 20 ГБ)
./scripts/deploy-update.sh --skip-pull  # задеплоить текущее дерево без git pull
```

С ноутбука:

```bash
ssh user@vps 'cd /opt/ritual-shop && ./scripts/deploy-update.sh --prune'
```

### Вручную

```bash
cd /opt/ritual-shop
git fetch --all --tags --prune
git checkout main          # или нужный ref
git pull --ff-only

# новые переменные из релиза — дописать в .env / apps/web/.env.local до build/up
nano .env

docker compose -f docker-compose.yml up -d db redis
docker compose -f docker-compose.yml build api
docker compose -f docker-compose.yml build web
docker compose -f docker-compose.yml run --rm --no-deps api npx prisma migrate deploy
docker compose -f docker-compose.yml up -d --remove-orphans
docker compose -f docker-compose.yml up -d --force-recreate api web caddy

# если в релизе менялся Caddyfile — validate + reload (см. §2.3)
docker compose -f docker-compose.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose -f docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

curl -fsS http://127.0.0.1:3001/api/health
curl -fsSI https://<твой-домен>/
docker image prune -f
```

### Чеклист перед выкаткой

1. В PR/релизе: есть ли новые ключи в `.env.example`? Дописать на сервер **до** рестарта api.
2. Есть ли миграции Prisma? Их применит `migrate deploy` на сервере (не `migrate dev`).
3. Менялся ли контракт API? Фронт должен уехать в том же релизе.
4. Менялся ли `Caddyfile`? На сервере сверить домен, сделать `caddy validate` + `reload` (или `--force-recreate caddy`).
5. После выкатки: health через Caddy (`https://<домен>/api/health`), логин, админка; `docker compose logs -f api web caddy`.

Откат кода: `git checkout <предыдущий_sha>` и снова build + up. Откат миграций БД отдельно и только осознанно (дамп до опасной миграции — твоя ответственность; дампы не хранить в git).

---

## 4. Полезные команды на сервере

```bash
docker compose -f docker-compose.yml ps
docker compose -f docker-compose.yml logs -f api
docker compose -f docker-compose.yml logs -f web
docker compose -f docker-compose.yml logs -f caddy

docker compose -f docker-compose.yml exec caddy caddy validate --config /etc/caddy/Caddyfile
docker compose -f docker-compose.yml exec caddy caddy reload --config /etc/caddy/Caddyfile

# место на диске (образы + volume сертификатов caddy_data)
df -h
docker system df
```

Перезапуск приложений без пересборки: `docker compose -f docker-compose.yml up -d --force-recreate api web`.  
Перезапуск прокси: `docker compose -f docker-compose.yml up -d --force-recreate caddy`.

---

## 5. Архитектура на проде

```
Клиент (браузер / Telegram webhook)
        │
        ▼
   :80 / :443  ←── контейнер caddy (Caddyfile из корня репо)
        │
        ├── path /api/*  ──►  api:3001   (Nest, глобальный префикс /api)
        └── остальное    ──►  web:3000   (Next.js, в т.ч. /admin)
                │
                api ──► db:5432, redis:6379, S3, SMTP, МойСклад, DaData, Telegram
```

Согласованность имён:

- DNS A → IP VPS
- `Caddyfile` site address
- `PUBLIC_WEB_URL=https://…` в `.env`
- клиентский API в браузере: `NEXT_PUBLIC_API_BASE=/api` (тот же хост, путь уходит в Caddy → api)
