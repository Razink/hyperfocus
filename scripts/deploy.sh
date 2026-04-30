#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_DIR="$APP_DIR/backend"

cd "$APP_DIR"

echo "Updating repository..."
git fetch origin master
git reset --hard origin/master

echo "Building and starting containers..."
cd "$COMPOSE_DIR"
docker compose up -d --build

if [ -d "$COMPOSE_DIR/prisma/migrations" ]; then
  echo "Applying database migrations..."
  docker compose exec -T backend npx prisma migrate deploy
else
  echo "No Prisma migrations directory found, skipping database migrations."
fi

echo "Checking backend health..."
curl --fail --silent --show-error http://127.0.0.1:3000/health
echo

echo "Deployment complete."
