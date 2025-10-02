#!/bin/bash
set -e

echo "Waiting for PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "PostgreSQL started"

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
exec "$@"