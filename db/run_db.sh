#!/usr/bin/env bash

export $(grep -v '^#' .env | xargs)

DB_CONTAINER="pg-chatbot"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-chatbot}"
DB_PASS="${POSTGRES_PASSWORD:-chatbot}"
DB_NAME="${POSTGRES_DB:-chatbot}"

SCHEMA_FILE="./db/schema.sql"

if docker ps -q -f name="$DB_CONTAINER" >/dev/null; then
  echo "✅ Postgres already running ($DB_CONTAINER)"
elif docker ps -a -q -f name="$DB_CONTAINER" >/dev/null; then
  echo "▶️ Starting existing container..."
  docker start "$DB_CONTAINER" >/dev/null
else
  echo "🚀 Creating Postgres container..."
  docker run -d \
      --name "$DB_CONTAINER" \
      -e POSTGRES_USER=$DB_USER \
      -e POSTGRES_PASSWORD=$DB_PASS \
      -e POSTGRES_DB=$DB_NAME \
      -p $DB_PORT:5432 \
      -v pgdata:/var/lib/postgresql/data \
      "postgres:16"
fi 

docker cp "$SCHEMA_FILE" "$DB_CONTAINER":/schema.sql
docker exec -it "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -f /schema.sql