#!/usr/bin/env bash
# Остановка локальной инфраструктуры (Postgres, Redis, MailHog).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE=(docker compose -f "$ROOT/docker-compose.development.yml" --profile infrastructure)

REMOVE_VOLUMES=0

usage() {
  cat <<'EOF'
Usage: scripts/dev-down.sh [options]

  (default)   docker compose ... stop
  --down      docker compose ... down (remove containers, keep volumes)
  -v, --volumes
              with --down: also remove volumes (wipes local DB/Redis data)
  -h, --help  Show this help
EOF
}

MODE=stop

while [[ $# -gt 0 ]]; do
  case "$1" in
    --down) MODE=down ;;
    -v|--volumes) REMOVE_VOLUMES=1 ;;
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

command -v docker >/dev/null 2>&1 || { echo "error: docker not found" >&2; exit 1; }

cd "$ROOT"

if [[ "$MODE" == stop ]]; then
  echo "==> stopping infrastructure"
  "${COMPOSE[@]}" stop
  echo "Stopped. Start again: yarn dev:up"
  exit 0
fi

if [[ "$REMOVE_VOLUMES" -eq 1 ]]; then
  echo "==> down -v (containers + volumes)"
  "${COMPOSE[@]}" down -v
else
  echo "==> down (containers, keep volumes)"
  "${COMPOSE[@]}" down
fi

echo "Done. Start again: yarn dev:up"
