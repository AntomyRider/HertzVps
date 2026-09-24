#!/bin/sh
set -e

echo "=================================================="
echo "  Starting Hertz Server (Production Container)    "
echo "=================================================="

DB_HOST="${DATABASE_HOST:-db}"
DB_PORT="${DATABASE_PORT:-3306}"
DB_USER="${DATABASE_USER:-root}"
DB_PASS="${DATABASE_PASSWORD:-}"
DB_NAME="${DATABASE_NAME:-hertz_db}"

# Construct DATABASE_URL automatically if not explicitly provided
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

# 1. Wait until MariaDB/MySQL TCP port is reachable
echo "[Entrypoint] Waiting for database at ${DB_HOST}:${DB_PORT}..."
MAX_RETRIES=30
RETRY_COUNT=0
until nc -z "$DB_HOST" "$DB_PORT" >/dev/null 2>&1; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ "$RETRY_COUNT" -ge "$MAX_RETRIES" ]; then
    echo "[Entrypoint] Warning: Database ${DB_HOST}:${DB_PORT} did not respond within timeout, continuing..."
    break
  fi
  echo "[Entrypoint] Database not ready yet (${RETRY_COUNT}/${MAX_RETRIES}). Retrying in 2s..."
  sleep 2
done
echo "[Entrypoint] Database port ${DB_HOST}:${DB_PORT} is reachable."

# 2. Run Prisma Migrations / Schema Sync if enabled
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[Entrypoint] Applying Prisma database migrations..."
  if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
    npx prisma migrate deploy --config prisma7.config.ts || npx prisma db push --config prisma7.config.ts
  else
    npx prisma db push --config prisma7.config.ts
  fi
  echo "[Entrypoint] Database schema is up to date."
fi

# 3. Run Database Seed (Admin user & default settings) if enabled
if [ "${RUN_SEED:-true}" = "true" ]; then
  echo "[Entrypoint] Seeding database (Admin account & default settings)..."
  node ./prisma/seed.mjs || echo "[Entrypoint] Warning: Seed script returned non-zero status, continuing..."
fi

echo "[Entrypoint] Launching Next.js server on ${HOSTNAME:-0.0.0.0}:${PORT:-3000}..."
exec "$@"
