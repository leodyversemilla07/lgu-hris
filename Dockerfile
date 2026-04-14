FROM php:8.4-cli-bookworm AS composer
WORKDIR /app
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath exif gd intl pcntl pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*
COPY composer.json composer.lock ./
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader --no-scripts

FROM composer AS node
WORKDIR /app
COPY --from=node:22 /usr/local/bin/node /usr/local/bin/node
COPY --from=node:22 /usr/local/lib/node_modules /usr/local/lib/node_modules
RUN ln -sf /usr/local/lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
    && ln -sf /usr/local/lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx
COPY package.json package-lock.json ./
RUN npm ci
COPY --from=composer /app/vendor ./vendor
COPY . .
RUN cp .env.example .env \
    && php -r "file_put_contents('.env', preg_replace('/^APP_KEY=.*$/m', 'APP_KEY=base64:'.base64_encode(random_bytes(32)), file_get_contents('.env')));" \
    && rm -f bootstrap/cache/packages.php bootstrap/cache/services.php \
    && php artisan package:discover --ansi \
    && php artisan wayfinder:generate --with-form
RUN npm run build

FROM php:8.4-fpm-bookworm AS app
WORKDIR /var/www/html

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    git \
    unzip \
    libicu-dev \
    libzip-dev \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    libonig-dev \
    libxml2-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) bcmath exif gd intl opcache pcntl pdo_mysql zip \
    && rm -rf /var/lib/apt/lists/*

COPY . .
COPY --from=composer /app/vendor ./vendor
COPY --from=node /app/public/build ./public/build
COPY docker/nginx/default.conf /etc/nginx/sites-available/default
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /usr/local/bin/docker-entrypoint.sh

RUN chmod +x /usr/local/bin/docker-entrypoint.sh \
    && mkdir -p /run/php /var/log/supervisor /var/www/html/storage/framework/cache/data /var/www/html/storage/framework/sessions /var/www/html/storage/framework/views /var/www/html/storage/logs \
    && chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    PHP_OPCACHE_VALIDATE_TIMESTAMPS=0

EXPOSE 8080

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
