#!/usr/bin/env bash
# Общие хелперы для deploy-bootstrap / deploy-update.
# shellcheck disable=SC2034

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/docker-compose.yml")
ENV_FILE="$ROOT/.env"
WEB_ENV="$ROOT/apps/web/.env.local"
CADDYFILE="$ROOT/Caddyfile"

log() { printf '%s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "command not found: $1"
}

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

env_has_nonempty() {
  local v
  v="$(env_get "$1" "$2" || true)"
  [[ -n "${v:-}" ]]
}

require_env_keys() {
  local file="$1"
  shift
  local missing=()
  local key
  for key in "$@"; do
    if ! env_has_nonempty "$file" "$key"; then
      missing+=("$key")
    fi
  done
  if [[ "${#missing[@]}" -gt 0 ]]; then
    die "missing or blank in $file: ${missing[*]}"
  fi
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
  local name="$1" host="$2" port="$3" seconds="${4:-90}" i
  for ((i = 1; i <= seconds; i++)); do
    if port_open "$host" "$port"; then
      log "  ok  $name  $host:$port"
      return 0
    fi
    sleep 1
  done
  die "$name not reachable at $host:$port after ${seconds}s"
}

wait_http() {
  local url="$1" seconds="${2:-90}" i code
  require_cmd curl
  for ((i = 1; i <= seconds; i++)); do
    code="$(curl -sS -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
    if [[ "$code" =~ ^[23][0-9][0-9]$ ]]; then
      log "  ok  $url  HTTP $code"
      return 0
    fi
    sleep 1
  done
  die "HTTP check failed for $url after ${seconds}s (last code=${code:-none})"
}

ensure_docker() {
  if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    log "  ok  docker"
    return 0
  fi

  if [[ "${INSTALL_DOCKER:-0}" != "1" ]]; then
    die "Docker is not available. Install it or re-run with --install-docker"
  fi

  require_cmd curl
  log "==> installing Docker (get.docker.com)"
  curl -fsSL https://get.docker.com | sh
  if command -v systemctl >/dev/null 2>&1; then
    systemctl enable --now docker || true
  fi
  if ! docker info >/dev/null 2>&1; then
    die "Docker installed but not usable — log out/in or: sudo usermod -aG docker \$USER"
  fi
  log "  ok  docker installed"
}

validate_prod_env() {
  [[ -f "$ENV_FILE" ]] || die "missing $ENV_FILE — copy from .env.example and fill production values"
  [[ -f "$WEB_ENV" ]] || die "missing $WEB_ENV — copy from apps/web/.env.example"

  require_env_keys "$ENV_FILE" \
    POSTGRES_DB POSTGRES_USER POSTGRES_PASSWORD \
    POSTGRES_HOST_PORT REDIS_HOST_PORT \
    MAILHOG_SMTP_PORT MAILHOG_UI_PORT \
    PUBLIC_WEB_URL JWT_SECRET ADMIN_EMAIL \
    S3_ENDPOINT S3_BUCKET S3_ACCESS_KEY S3_SECRET_KEY \
    MOYSKLAD_TOKEN DADATA_API_KEY \
    TELEGRAM_BOT_TOKEN TELEGRAM_BOT_USERNAME TELEGRAM_WEBHOOK_SECRET \
    SMTP_HOST

  local jwt
  jwt="$(env_get "$ENV_FILE" JWT_SECRET)"
  if [[ "${#jwt}" -lt 32 ]]; then
    die "JWT_SECRET must be at least 32 characters"
  fi

  local node_env
  node_env="$(env_get "$ENV_FILE" NODE_ENV || true)"
  if [[ -n "$node_env" && "$node_env" != "production" ]]; then
    log "warn: NODE_ENV=$node_env (expected production for VPS)"
  fi
}

set_caddy_domain() {
  local domain="$1"
  [[ -n "$domain" ]] || return 0
  [[ -f "$CADDYFILE" ]] || die "missing $CADDYFILE"
  if [[ ! "$domain" =~ ^[A-Za-z0-9.-]+$ ]]; then
    die "invalid domain: $domain"
  fi
  # Первая строка вида `example.com {`
  local tmp
  tmp="$(mktemp)"
  awk -v d="$domain" 'NR==1 { print d " {"; next } { print }' "$CADDYFILE" >"$tmp"
  mv "$tmp" "$CADDYFILE"
  log "  ok  Caddyfile domain → $domain"
}

compose() {
  (cd "$ROOT" && "${COMPOSE[@]}" "$@")
}

migrate_db() {
  log "==> prisma migrate deploy (api container)"
  # one-shot на образе api, без зависимости от уже запущенного процесса
  compose run --rm --no-deps \
    -e DATABASE_URL="postgresql://$(env_get "$ENV_FILE" POSTGRES_USER):$(env_get "$ENV_FILE" POSTGRES_PASSWORD)@db:5432/$(env_get "$ENV_FILE" POSTGRES_DB)?schema=public" \
    api npx prisma migrate deploy
}

seed_catalog() {
  log "==> seed catalog (seed.group.ts)"
  compose run --rm --no-deps \
    -e DATABASE_URL="postgresql://$(env_get "$ENV_FILE" POSTGRES_USER):$(env_get "$ENV_FILE" POSTGRES_PASSWORD)@db:5432/$(env_get "$ENV_FILE" POSTGRES_DB)?schema=public" \
    api yarn tsx prisma/seed.group.ts
}

health_check() {
  log "==> health checks"
  wait_port "API" 127.0.0.1 3001 120
  wait_http "http://127.0.0.1:3001/api/health" 120
  wait_port "Web" 127.0.0.1 3000 120
}
