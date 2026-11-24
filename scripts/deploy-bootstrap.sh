#!/usr/bin/env bash
# Первичный деплой на новый VPS (Docker + compose build + migrate + up).
# Запускать НА сервере из корня репозитория (после git clone).
#
# Пример:
#   git clone <repo> /opt/ritual-shop && cd /opt/ritual-shop
#   cp .env.example .env && cp apps/web/.env.example apps/web/.env.local
#   $EDITOR .env apps/web/.env.local
#   ./scripts/deploy-bootstrap.sh --domain ritual.example.org --install-docker
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/_common.sh
source "$SCRIPT_DIR/deploy/_common.sh"

INSTALL_DOCKER=0
DOMAIN=""
DO_SEED=0
SKIP_BUILD=0

usage() {
  cat <<'EOF'
Usage: scripts/deploy-bootstrap.sh [options]

Fresh production deploy on a new VPS (run inside the cloned repo).

  --install-docker   Install Docker via get.docker.com if missing
  --domain HOST      Rewrite first site block in Caddyfile
  --seed             After migrate, run prisma/seed.group.ts (catalog)
  --skip-build       Assume images already built
  -h, --help         Show this help

Prerequisites (you fill secrets before running):
  .env                 from .env.example
  apps/web/.env.local  from apps/web/.env.example

After success, create the first admin (on the server):
  docker compose exec api sh -c \
    'ADMIN_EMAIL=... ADMIN_PASSWORD=... yarn tsx prisma/seed-admin.ts'

Remote one-liner from your laptop:
  ssh user@vps 'cd /opt/ritual-shop && ./scripts/deploy-bootstrap.sh --domain example.org'
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --install-docker) INSTALL_DOCKER=1 ;;
    --domain)
      DOMAIN="${2:?--domain requires a hostname}"
      shift
      ;;
    --seed) DO_SEED=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
  shift
done

export INSTALL_DOCKER

cd "$ROOT"
log "==> ritual-shop bootstrap (new VPS)"
log "  root: $ROOT"

ensure_docker
require_cmd curl

if [[ -n "$DOMAIN" ]]; then
  log "==> Caddy domain"
  set_caddy_domain "$DOMAIN"
fi

log "==> validating env"
validate_prod_env

log "==> starting database & redis first"
compose up -d db redis
wait_port "Postgres" 127.0.0.1 "$(env_get "$ENV_FILE" POSTGRES_HOST_PORT)" 120
(
  cd "$ROOT"
  for ((i = 1; i <= 60; i++)); do
    if "${COMPOSE[@]}" exec -T db \
      pg_isready -U "$(env_get "$ENV_FILE" POSTGRES_USER)" -d "$(env_get "$ENV_FILE" POSTGRES_DB)" \
      >/dev/null 2>&1; then
      log "  ok  pg_isready"
      break
    fi
    [[ "$i" -eq 60 ]] && die "Postgres not ready"
    sleep 1
  done
)

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  log "==> building images (api, web)"
  compose build api web
fi

log "==> applying migrations"
compose run --rm --no-deps api npx prisma migrate deploy

if [[ "$DO_SEED" -eq 1 ]]; then
  log "==> seeding catalog"
  compose run --rm --no-deps api yarn tsx prisma/seed.group.ts
fi

log "==> starting full stack"
compose up -d

health_check

log ""
log "Bootstrap complete."
log "  Site (via Caddy): https://$( [[ -n "$DOMAIN" ]] && printf '%s' "$DOMAIN" || printf '%s' '<Caddyfile host>' )"
log "  API health:       http://127.0.0.1:3001/api/health"
log "  Web:              http://127.0.0.1:3000"
log "  MailHog UI:       http://127.0.0.1:$(env_get "$ENV_FILE" MAILHOG_UI_PORT)  (compose includes MailHog — lock down host ports on a real VPS)"
log ""
log "Create ADMIN_GOD:"
log "  docker compose exec api sh -c \\"
log "    'ADMIN_EMAIL=... ADMIN_PASSWORD=... yarn tsx prisma/seed-admin.ts'"
log ""
log "Later updates: ./scripts/deploy-update.sh"
