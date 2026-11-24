#!/usr/bin/env bash
# Ежедневный локальный старт: инфра + API + web.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/docker-compose.development.yml" --profile infrastructure)
ENV_FILE="$ROOT/.env"
API_ENV="$ROOT/apps/api/.env"

DO_MIGRATE=0
DO_APPS=1
FLUSH_REDIS=0
WAIT_SECONDS=60

usage() {
  cat <<'EOF'
Usage: scripts/dev-up.sh [options]

  (default)      Start Postgres/Redis/MailHog, then API + web (yarn dev:all)
  --infra-only   Only infrastructure (do not start API/web)
  --migrate      Run: cd apps/api && yarn prisma:deploy (before apps)
  --flush-redis  FLUSHDB on local Redis after it is up (clears BullMQ jobs)
  --wait N       Seconds to wait for ports (default: 60)
  -h, --help     Show this help

Examples:
  yarn dev:up
  yarn dev:up -- --migrate
  yarn dev:up -- --infra-only
  yarn dev:up -- --flush-redis --migrate

Stop infra: yarn dev:down
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --migrate) DO_MIGRATE=1 ;;
    --infra-only) DO_APPS=0 ;;
    --apps) DO_APPS=1 ;; # совместимость со старым флагом
    --flush-redis) FLUSH_REDIS=1 ;;
    --wait)
      WAIT_SECONDS="${2:?--wait requires a number}"
      shift
      ;;
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

log() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

# Читает KEY=value из .env без source (не выполняет shell-подстановки).
env_get() {
  local file="$1" key="$2" line value
  [[ -f "$file" ]] || return 1
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line#"${line%%[![:space:]]*}"}"
    [[ -z "$line" || "$line" == \#* ]] && continue
    [[ "$line" == export\ * ]] && line="${line#export }"
    [[ "$line" == "$key="* ]] || continue
    value="${line#*=}"
    value="${value%$'\r'}"
    if [[ "$value" == \"*\" ]]; then
      value="${value#\"}"
      value="${value%\"}"
    elif [[ "$value" == \'*\' ]]; then
      value="${value#\'}"
      value="${value%\'}"
    fi
    printf '%s' "$value"
    return 0
  done <"$file"
  return 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "command not found: $1"
}

port_open() {
  local host="$1" port="$2"
  if command -v nc >/dev/null 2>&1; then
    nc -z "$host" "$port" >/dev/null 2>&1
  else
    (echo >/dev/tcp/"$host"/"$port") >/dev/null 2>&1
  fi
}

wait_port() {
  local name="$1" host="$2" port="$3" i
  for ((i = 1; i <= WAIT_SECONDS; i++)); do
    if port_open "$host" "$port"; then
      log "  ok  $name  $host:$port"
      return 0
    fi
    sleep 1
  done
  die "$name not reachable at $host:$port after ${WAIT_SECONDS}s"
}

require_cmd docker
require_cmd yarn
docker info >/dev/null 2>&1 || die "Docker is not running — start Docker Desktop"

[[ -f "$ENV_FILE" ]] || die "missing $ENV_FILE (copy from .env.example)"
[[ -f "$API_ENV" ]] || die "missing $API_ENV (Nest reads this file, not only the root .env)"

POSTGRES_HOST_PORT="$(env_get "$ENV_FILE" POSTGRES_HOST_PORT || true)"
REDIS_HOST_PORT="$(env_get "$ENV_FILE" REDIS_HOST_PORT || true)"
MAILHOG_SMTP_PORT="$(env_get "$ENV_FILE" MAILHOG_SMTP_PORT || true)"
MAILHOG_UI_PORT="$(env_get "$ENV_FILE" MAILHOG_UI_PORT || true)"

[[ -n "${POSTGRES_HOST_PORT:-}" ]] || die "POSTGRES_HOST_PORT is not set in .env"
[[ -n "${REDIS_HOST_PORT:-}" ]] || die "REDIS_HOST_PORT is not set in .env"
[[ -n "${MAILHOG_SMTP_PORT:-}" ]] || die "MAILHOG_SMTP_PORT is not set in .env"
[[ -n "${MAILHOG_UI_PORT:-}" ]] || die "MAILHOG_UI_PORT is not set in .env"

log "==> starting infrastructure"
(cd "$ROOT" && "${COMPOSE[@]}" up -d)

log "==> waiting for ports"
wait_port "Postgres" 127.0.0.1 "$POSTGRES_HOST_PORT"
wait_port "Redis" 127.0.0.1 "$REDIS_HOST_PORT"
wait_port "MailHog SMTP" 127.0.0.1 "$MAILHOG_SMTP_PORT"
wait_port "MailHog UI" 127.0.0.1 "$MAILHOG_UI_PORT"

log "==> waiting for Postgres ready"
for ((i = 1; i <= WAIT_SECONDS; i++)); do
  if (cd "$ROOT" && "${COMPOSE[@]}" exec -T db \
    pg_isready -U "$(env_get "$ENV_FILE" POSTGRES_USER)" -d "$(env_get "$ENV_FILE" POSTGRES_DB)" \
    >/dev/null 2>&1); then
    log "  ok  pg_isready"
    break
  fi
  if [[ "$i" -eq "$WAIT_SECONDS" ]]; then
    die "Postgres did not become ready in time"
  fi
  sleep 1
done

if [[ "$FLUSH_REDIS" -eq 1 ]]; then
  log "==> flushing local Redis (BullMQ jobs)"
  (cd "$ROOT" && "${COMPOSE[@]}" exec -T redis redis-cli FLUSHDB) >/dev/null
fi

if [[ "$DO_MIGRATE" -eq 1 ]]; then
  log "==> prisma migrate deploy"
  (cd "$ROOT/apps/api" && yarn prisma:deploy)
fi

log ""
log "Infrastructure is up:"
log "  Postgres     127.0.0.1:${POSTGRES_HOST_PORT}"
log "  Redis        127.0.0.1:${REDIS_HOST_PORT}"
log "  MailHog SMTP 127.0.0.1:${MAILHOG_SMTP_PORT}"
log "  MailHog UI   http://127.0.0.1:${MAILHOG_UI_PORT}"
log ""

if [[ "$DO_APPS" -eq 0 ]]; then
  log "Infra only. Start apps with: yarn dev:all"
  log "Or full stack: yarn dev:up"
  log "Stop infra: yarn dev:down"
  exit 0
fi

[[ -d "$ROOT/apps/api/node_modules" ]] || die "apps/api/node_modules missing — run: cd apps/api && yarn install"
[[ -d "$ROOT/apps/web/node_modules" ]] || die "apps/web/node_modules missing — run: cd apps/web && yarn install"

log "==> starting API + web (yarn dev:all)"
log "  API  http://localhost:3001/api/health"
log "  Web  http://localhost:3000"
log "  Ctrl+C stops API/web; infra keeps running (yarn dev:down to stop it)"
log ""
cd "$ROOT"
exec yarn dev:all
