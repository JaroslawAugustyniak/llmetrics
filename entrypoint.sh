#!/bin/bash

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
  if nc -z postgres 5432 2>/dev/null; then
    echo "PostgreSQL is ready!"
    break
  fi
  echo "PostgreSQL not ready, waiting... ($i/30)"
  sleep 1
done

# Install dependencies
if [ ! -d "vendor" ]; then
    echo "Installing Composer dependencies..."
    composer install
fi

# Generate APP_KEY if empty
if [ -z "$(grep '^APP_KEY=' .env | cut -d= -f2)" ] || [ "$(grep '^APP_KEY=' .env | cut -d= -f2)" = "" ]; then
    echo "Generating APP_KEY..."
    php artisan key:generate
fi

# Clear caches
echo "Clearing caches..."
php artisan config:clear
php artisan route:clear
php artisan cache:clear

# Run migrations
echo "Running migrations..."
php artisan migrate --force

# Start supervisord (manages nginx + php-fpm)
echo "Starting supervisor..."
supervisord -c /etc/supervisor/conf.d/supervisord.conf