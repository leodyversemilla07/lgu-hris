#!/bin/sh
set -eu

cd /home/site/wwwroot

mkdir -p bootstrap/cache
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs

if [ ! -L public/storage ]; then
    php artisan storage:link >/dev/null 2>&1 || true
fi

php artisan migrate --force || true
php artisan optimize || true

exec php artisan serve --host=0.0.0.0 --port=8080
