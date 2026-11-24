#!/usr/bin/env bash
# Обновление уже развёрнутого VPS: git pull → build → migrate → up.
# Запускать НА сервере из корня репозитория.
#
# Пример:
#   cd /opt/ritual-shop && ./scripts/deploy-update.sh
#   ./scripts/deploy-update.sh --skip-pull --prune
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=deploy/_common.sh
source "$SCRIPT_DIR/deploy/_common.sh"

SKIP_PULL=0
SKIP_BUILD=0
SKIP_MIGRATE=0
DO_PRUNE=0
GIT_REF=""

usage() {
  cat <<'EOF'
Usage: scripts/deploy-update.sh [options]

Rolling update on an existing VPS (run inside the repo).

  --skip-pull      Do not git fetch/pull (deploy current working tree)
  --ref REF        git checkout REF after fetch (branch/tag/sha), then pull if branch
  --skip-build     Do not rebuild images
  --skip-migrate   Do not run prisma migrate deploy
  --prune          docker image prune -f after a successful deploy
  -h, --help       Show this help

Examples:
  ./scripts/deploy-update.sh
  ./scripts/deploy-update.sh --ref main
  ./scripts/deploy-update.sh --skip-pull

From your laptop:
  ssh user@vps 'cd /opt/ritual-shop && ./scripts/deploy-update.sh'
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-pull) SKIP_PULL=1 ;;
    --skip-build) SKIP_BUILD=1 ;;
    --skip-migrate) SKIP_MIGRATE=1 ;;
    --prune) DO_PRUNE=1 ;;
    --ref)
      GIT_REF="${2:?--ref requires a git ref}"
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

cd "$ROOT"
log "==> ritual-shop update"
log "  root: $ROOT"

ensure_docker
require_cmd curl
validate_prod_env

if [[ ! -d "$ROOT/.git" ]]; then
  die "not a git repo — bootstrap first or pass --skip-pull on a copied tree"
fi

if [[ "$SKIP_PULL" -eq 0 ]]; then
  require_cmd git
  log "==> git fetch"
  git fetch --all --tags --prune

  if [[ -n "$GIT_REF" ]]; then
    log "==> git checkout $GIT_REF"
    git checkout "$GIT_REF"
  fi

  # If on a branch, fast-forward to remote tracking branch when possible
  local_branch="$(git rev-parse --abbrev-ref HEAD)"
  if [[ "$local_branch" != "HEAD" ]]; then
    log "==> git pull --ff-only ($local_branch)"
    git pull --ff-only
  else
    log "  detached HEAD @ $(git rev-parse --short HEAD) — skip pull"
  fi
else
  log "==> skip git pull"
fi

log "==> ensuring db/redis are up"
compose up -d db redis
wait_port "Postgres" 127.0.0.1 "$(env_get "$ENV_FILE" POSTGRES_HOST_PORT)" 120

if [[ "$SKIP_BUILD" -eq 0 ]]; then
  log "==> building images (api, web)"
  compose build api web
else
  log "==> skip build"
fi

if [[ "$SKIP_MIGRATE" -eq 0 ]]; then
  log "==> applying migrations"
  compose run --rm --no-deps api npx prisma migrate deploy
else
  log "==> skip migrate"
fi

log "==> recreating app containers"
compose up -d --remove-orphans
# caddy/web/api подтянут новые образы
compose up -d --force-recreate api web caddy

health_check

if [[ "$DO_PRUNE" -eq 1 ]]; then
  log "==> docker image prune"
  docker image prune -f
fi

log ""
log "Update complete @ $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
log "  API health: http://127.0.0.1:3001/api/health"
log "  Web:        http://127.0.0.1:3000"
log "  Status:     docker compose -f docker-compose.yml ps"
