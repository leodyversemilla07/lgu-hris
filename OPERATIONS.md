# Operations Guide

## Purpose

This guide covers the minimum operational practices for deploying and maintaining `LGU HRIS` in an LGU environment.

Use this together with [README.md](README.md), [SECURITY.md](SECURITY.md), and [UAT_CHECKLIST.md](UAT_CHECKLIST.md).

## Deployment Baseline

Before go-live, confirm all of the following:

- production `.env` values are complete
- `APP_ENV=production`
- `APP_DEBUG=false`
- MySQL or MariaDB is configured
- mail is configured with a real transport
- queue workers are running
- frontend assets are built
- storage is linked if public files are required
- at least one real `HR Admin` account exists

Recommended validation sequence:

```bash
composer install
npm install
php artisan migrate --force
php artisan db:seed --class=DatabaseSeeder --force
npm run build
php artisan hris:create-admin --name="LGU HR Admin" --email="admin@example.gov.ph" --password="change-this-password"
php artisan storage:link
php artisan hris:preflight
```

## Backup Strategy

Every production deployment should back up both:

- the relational database
- uploaded files under `storage/app`

At minimum, define:

- backup frequency
- retention period
- backup destination
- who is responsible for monitoring backup success

Recommended coverage:

- daily database backup
- daily or more frequent file backup if document uploads are active
- off-server or off-site copy
- documented restore owner and contact

## Backup Verification

Backups are not complete until restores have been rehearsed.

For each environment, verify:

1. A fresh backup file is actually generated.
2. The backup can be copied to a separate restore location.
3. The database can be restored to a clean instance.
4. Uploaded documents restore correctly.
5. A restored application can log in and open employee records, leave data, and documents.

Record:

- backup date
- restore date
- person who performed the restore
- restore duration
- issues found and corrective action

## Queue and Mail Operations

The application depends on a working queue for notifications and other asynchronous tasks.

Operations owners should confirm:

- queue workers start automatically after server restart
- failed jobs are monitored
- mail is delivered to real recipients
- notification workflows are tested after deployment

Minimum checks:

- submit a leave request
- approve or reject a leave request
- confirm the expected notifications are processed

## Routine Operational Checks

After deployment, review these regularly:

- failed jobs
- disk usage for uploaded files and logs
- database growth
- recent successful backups
- HTTPS certificate validity
- admin account hygiene
- package and server patching schedule

## Go-Live Handoff

Before the LGU signs off on production use:

- complete [UAT_CHECKLIST.md](UAT_CHECKLIST.md)
- complete backup and restore rehearsal
- validate real user accounts and role assignments
- validate reports and exports on real sample data
- validate print and PDF outputs
- validate document access restrictions
- confirm help desk or escalation ownership

## Incident Response Notes

If a production issue affects data integrity or access control:

1. stop risky data-entry activity if needed
2. preserve logs and reproduction details
3. identify scope by module and user role
4. determine whether data restore is required
5. document the incident and corrective action

Security-sensitive issues should be handled using [SECURITY.md](SECURITY.md).
