#!/bin/bash

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
for i in {1..30}; do
  if nc -z mysql 3306 2>/dev/null; then
    echo "MySQL is ready!"
    break
  fi
  echo "MySQL not ready, waiting... ($i/30)"
  sleep 1
done

# Fix storage directory permissions for Laravel
echo "Setting up storage directory permissions..."
mkdir -p storage/{logs,app,framework/{sessions,views,cache}}
chmod -R 775 storage
chown -R www-data:www-data storage bootstrap/cache

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