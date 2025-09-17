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
node dist/main.js
