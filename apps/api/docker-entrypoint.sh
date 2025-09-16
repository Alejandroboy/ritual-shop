#!/bin/sh
set -e


export PORT=${PORT:-3001}
export NODE_ENV=${NODE_ENV:-production}


# За обратным прокси (Caddy) нужны доверенные заголовки для secure cookies
export TRUST_PROXY=${TRUST_PROXY:-1}


# Применяем миграции (без интерактива)
yarn workspace api prisma migrate deploy || npx --yes prisma migrate deploy || true


# Опционально — сид (первичный набор шаблонов, рамок и т.д.)
if [ "${SEED}" = "true" ]; then
yarn workspace api prisma db seed || npx --yes prisma db seed || true
fi


# Стартуем API
node apps/api/dist/main.js
