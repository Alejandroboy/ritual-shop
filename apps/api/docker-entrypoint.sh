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


# Авто-детект main.js в типичных местах (работаем из /app/apps/api)
APP_MAIN=""
if [ -f dist/main.js ]; then
  APP_MAIN="dist/main.js"
elif [ -f ../dist/apps/api/main.js ]; then
  APP_MAIN="../dist/apps/api/main.js"
elif [ -f /app/dist/apps/api/main.js ]; then
  APP_MAIN="/app/dist/apps/api/main.js"
fi

if [ -z "$APP_MAIN" ]; then
  echo "[entrypoint] main.js not found. Listing candidates:"
  (ls -la .; ls -la dist 2>/dev/null || true; ls -la ../dist/apps/api 2>/dev/null || true; find /app -maxdepth 4 -name main.js || true)
  exit 1
fi

echo "[entrypoint] starting: node $APP_MAIN"
node "$APP_MAIN"
