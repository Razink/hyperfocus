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

echo "Repairing legacy lesson resource schema if needed..."
docker compose exec -T db psql -U hyperfocus -d hyperfocus -c \
  'ALTER TABLE lesson_resources ADD COLUMN IF NOT EXISTS file_size integer;
   UPDATE lesson_resources SET file_size = size WHERE file_size IS NULL AND size IS NOT NULL;
   ALTER TABLE lesson_resources ALTER COLUMN type TYPE "ResourceType" USING type::text::"ResourceType";' \
  2>/dev/null || true

if [ -d "$COMPOSE_DIR/prisma/migrations" ]; then
  echo "Applying database migrations..."
  # Clear any failed migration entries so they can be retried
  docker compose exec -T db psql -U hyperfocus -d hyperfocus \
    -c "DELETE FROM _prisma_migrations WHERE finished_at IS NULL;" 2>/dev/null || true
  docker compose exec -T backend ./node_modules/.bin/prisma migrate deploy
else
  echo "No Prisma migrations directory found, skipping database migrations."
fi

echo "Waiting for backend health..."
for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:3000/health; then
    echo
    echo "Backend is healthy."
    echo "Deployment complete."
    exit 0
  fi

  echo "Backend not ready yet, retrying ($attempt/30)..."
  sleep 2
done

echo "Backend healthcheck failed after 60 seconds."
docker compose ps
docker compose logs --tail=120 backend
exit 1
