#!/usr/bin/env bash

export $(grep -v '^#' .env | xargs)

DB_PORT="${POSTGRES_PORT:-5432}"
DB_USER="${POSTGRES_USER:-chatbot}"
DB_PASS="${POSTGRES_PASSWORD:-chatbot}"
DB_NAME="${POSTGRES_DB:-chatbot}"

docker run -d \
    --name "pg-chatbot" \
    -e POSTGRES_USER=$DB_USER \
    -e POSTGRES_PASSWORD=$DB_PASS \
    -e POSTGRES_DB=$DB_NAME \
    -p $DB_PORT:5432 \
    -v pgdata:/var/lib/postgresql/data \
    "postgres:16"