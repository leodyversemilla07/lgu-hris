# Local Government Unit Human Resource Information System

LGU HRIS is a Laravel 12 and Inertia React application for managing core local government human resource operations. It centralizes employee records, leave, documents, attendance, personnel movements, reports, and role-based access control in one web-based system.

## Project Status

This repository is positioned as an open-source core LGU HRIS application for real deployment, pilot rollout, and further LGU customization.

Implemented modules include:

- employee information management
- employee profile history
- document upload, preview, access control, and version history
- leave filing, draft workflow, approval history, and notifications
- attendance logging, biometric CSV import, bulk import, schedules, and monthly summaries
- personnel movement tracking
- payroll-support data capture
- government-style reports and exports
- user, role, permission, and record-level access control
- audit activity and export history

The application is ready for serious deployment work, but each implementing LGU should still complete environment hardening, backup validation, UAT, and data migration rehearsal in its own target environment before final go-live.

## Core Features

### Employee Information Management

- employee master records
- department, position, employment type, and employment status tracking
- profile details, government IDs, emergency contacts, and employment data
- archive and restore workflow
- employment history timeline

### Document Management

- employee document upload
- confidential document handling
- document preview and download
- document version history and replacement chain

### Leave Management

- leave request filing
- draft and submitted workflows
- approval and rejection flow
- leave balances
- leave approval history
- employee and approver notifications

### Attendance Management

- manual attendance logging
- bulk attendance import
- biometric CSV import using employee numbers
- work schedule templates
- schedule-aware late and undertime computation
- monthly attendance summaries

### Personnel Movements

- movement recording
- employee movement history
- scoped access for department heads and HR users

### Reports and Exports

- employee masterlist
- plantilla of personnel
- leave ledger
- attendance summary
- personnel movements
- payroll support register
- service record PDF

Supported export formats vary by report and include `Excel`, `CSV`, and `PDF`.

### Security and Governance

- authentication with Laravel Fortify
- roles and permissions with Spatie Permission
- record-level authorization policies
- audit logging
- report export history
- in-app notifications

## Technology Stack

- PHP 8.4
- Laravel 12
- Inertia.js v2
- React 19
- Tailwind CSS v4
- MySQL 8
- Laravel Fortify
- Spatie Laravel Permission

## Requirements

- PHP 8.4+
- Composer
- Node.js 22+ and npm
- MySQL 8+

## Installation

### Production-Safe Setup

1. Install dependencies.

```bash
composer install
npm install
```

2. Create the environment file.

```bash
cp .env.example .env
```

3. Update `.env` for the target LGU environment.

Required production settings:

- set `APP_URL`
- set MySQL credentials
- set mail credentials
- keep `APP_ENV=production`
- keep `APP_DEBUG=false`
- use a real queue connection

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

This seeds roles, permissions, reference tables, salary grades, and work schedules only. It does not create demo users or demo HR records.

7. Build frontend assets.

```bash
npm run build
```

8. Create the initial HR administrator account.

```bash
php artisan hris:create-admin --name="LGU HR Admin" --email="admin@example.gov.ph" --password="change-this-password"
```

9. Start the queue worker.

```bash
php artisan queue:work --tries=1
```

10. Run deployment preflight checks.

```bash
php artisan hris:preflight
```

### Local Demo Setup

If you want a local environment with sample users and records:

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

## User Roles

Default seeded roles include:

- `HR Admin`
- `HR Staff`
- `Department Head`
- `Employee`

Permissions and record-level access are enforced both at route level and within application policies.

## Attendance Handling

Attendance currently supports:

- manual logging
- CSV-style bulk import
- biometric CSV import by employee number
- schedule-aware late and undertime defaults
- monthly summary recomputation

Current limitation:

- there is no live biometric device API integration or direct kiosk synchronization yet

## Reports and Exports

Current reporting workspace includes:

- masterlist
- plantilla of personnel
- leave ledger
- attendance summary
- personnel movements
- payroll support register
- service record PDF

The system also records export history for traceability.

## Operations Notes

- mail notifications depend on a working SMTP configuration
- queued notifications and mail depend on a non-`sync` queue connection and a running queue worker
- uploaded documents should be included in backups together with the MySQL database
- run `php artisan hris:preflight` before production handoff
- run `php artisan test --compact` before release changes

See:

- [OPERATIONS.md](OPERATIONS.md)
- [UAT_CHECKLIST.md](UAT_CHECKLIST.md)
- [DATA_MIGRATION.md](DATA_MIGRATION.md)

## Release Checklist

- configure production `.env`
- run migrations and production-safe seeding
- build frontend assets
- create the initial HR admin user
- start queue workers
- run `php artisan hris:preflight`
- verify document upload and public storage access
- verify mail delivery and notification processing
- verify backups and restore procedure
- complete UAT before go-live

## Known Limitations

- attendance does not yet support direct biometric device synchronization
- deployment hardening is environment-specific and still requires backup, restore, mail, queue, and HTTPS validation per LGU
- migration from spreadsheets or paper records is not automated for every LGU data shape and should be rehearsed before rollout

## Open Source Use

This project is intended to be reusable by other LGUs, implementers, and contributors. Before production use, each adopting organization should still complete:

- local policy and process validation
- real data migration planning
- production environment hardening
- user acceptance testing
- operational support planning

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

See [SECURITY.md](SECURITY.md).

## License

This project is licensed under the [MIT License](LICENSE).
