# LGU HRIS

Laravel 12 + Inertia React HRIS for LGU personnel records, leave, documents, attendance, movements, and government reporting.

## Requirements

- PHP 8.4+
- Composer
- Node.js 22+ and npm
- MySQL 8+

## Production Installation

1. Install dependencies.

```bash
composer install
npm install
```

2. Create the environment file.

```bash
cp .env.example .env
```

3. Update `.env` for your LGU deployment.

- Set `APP_URL`
- Set MySQL credentials
- Set mail credentials
- Keep `APP_ENV=production`
- Keep `APP_DEBUG=false`

4. Generate the application key.

```bash
php artisan key:generate
```

5. Run migrations.

```bash
php artisan migrate --force
```

6. Seed production-safe reference data.

```bash
php artisan db:seed --class=DatabaseSeeder --force
```

This seeds roles, permissions, reference tables, salary grades, and work schedules only.
It does not create demo users or demo HR records.

7. Build frontend assets.

```bash
npm run build
```

8. Create the initial HR admin account.

```bash
php artisan hris:create-admin --name=\"LGU HR Admin\" --email=\"admin@example.gov.ph\" --password=\"change-this-password\"
```

9. Start the queue worker in production.

```bash
php artisan queue:work --tries=1
```

## Demo / Local Installation

If you want a local environment with demo users and sample records:

```bash
composer run setup:demo
```

Or manually:

```bash
php artisan migrate --force
php artisan db:seed --class=DemoDatabaseSeeder --force
npm run build
```

## Seeder Modes

- `DatabaseSeeder`
  Seeds production-safe reference data only.
- `DemoDatabaseSeeder`
  Seeds reference data plus demo users, employees, leave data, attendance data, documents, reports, and audit samples.

## First Login

The production seed path does not create default users.
Use `php artisan hris:create-admin` to create the first real administrator account after seeding.

## Operations Notes

- Mail notifications depend on a working SMTP configuration.
- Background notifications and queued mail depend on `QUEUE_CONNECTION=database` and a running queue worker.
- Uploaded documents should be included in your backup strategy together with the MySQL database.
- Run `php artisan test --compact` before release changes.
