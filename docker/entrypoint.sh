#!/bin/sh
set -eu

cd /var/www/html

mkdir -p bootstrap/cache \
    storage/framework/cache/data \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs

chown -R www-data:www-data storage bootstrap/cache || true

if [ ! -L public/storage ]; then
    php artisan storage:link >/dev/null 2>&1 || true
fi

php artisan migrate --force || true
php artisan optimize || true

exec "$@"
