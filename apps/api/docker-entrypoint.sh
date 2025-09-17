#!/bin/sh
set -e


export PORT=${PORT:-3001}
export NODE_ENV=${NODE_ENV:-production}


# За обратным прокси (Caddy) нужны доверенные заголовки для secure cookies
export TRUST_PROXY=${TRUST_PROXY:-1}
export PRISMA_SCHEMA_PATH="${PRISMA_SCHEMA_PATH:-/app/apps/api/prisma/schema.prisma}"


# Применяем миграции (без интерактива)
yarn workspace api prisma migrate deploy --schema="$PRISMA_SCHEMA_PATH" || npx --yes prisma migrate deploy --schema="$PRISMA_SCHEMA_PATH" || true


# Опционально — сид (первичный набор шаблонов, рамок и т.д.)
if [ "$SEED" = "true" ]; then
  yarn workspace api prisma db seed --schema="$PRISMA_SCHEMA_PATH" || npx --yes prisma db seed --schema="$PRISMA_SCHEMA_PATH" || true
fi


# Стартуем API
# Авто-детект main.js
if [ -f dist/main.js ]; then
  APP_MAIN=dist/main.js
elif [ -f ../dist/apps/api/main.js ]; then
  APP_MAIN=../dist/apps/api/main.js
elif [ -f /app/dist/apps/api/main.js ]; then
  APP_MAIN=/app/dist/apps/api/main.js
else
  echo "[entrypoint] main.js not found, printing tree:"
  (ls -la .; ls -la ../dist || true; ls -la /app/dist/apps/api || true)
  exit 1
fi
node "$APP_MAIN"
