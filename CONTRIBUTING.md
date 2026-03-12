# Contributing to LGU HRIS

Thank you for contributing to the Local Government Unit Human Resource Information System.

This repository is an application project, not a reusable library package, so contributions should be practical, deployment-aware, and aligned with real LGU HR workflows.

## Ways to Contribute

Contributions are welcome for:

- bug fixes
- automated tests
- LGU workflow improvements
- UI consistency improvements
- reports and export improvements
- documentation and deployment guidance
- security and operational hardening

## Before You Start

Please review:

- [README.md](README.md)
- [SECURITY.md](SECURITY.md)

If your change affects production setup, data migration, access control, or reporting, include that context in the pull request description.

## Local Setup

### Demo Sandbox

Use this when you want sample users and records.

```bash
composer run setup:demo
```

### Production-Safe Local Setup

Use this when you want a clean install without demo records.

```bash
composer run setup
php artisan hris:create-admin
```

## Development Guidelines

- follow the existing Laravel, Inertia, and React conventions already used in the repository
- keep production-safe seeding separate from demo seeding
- do not commit `.env` files, credentials, secrets, or generated keys
- do not introduce schema or workflow changes without updating tests
- prefer focused changes over large mixed pull requests

## Testing Expectations

Every functional change should be covered by tests.

Before opening a pull request:

- run `vendor/bin/pint --dirty --format agent`
- run the narrowest relevant `php artisan test --compact ...` commands
- run `npm run build` for frontend changes

If your change affects installation, setup, or deployment behavior, also verify:

- seeding behavior
- migration behavior
- documented commands still match the implementation

## Pull Request Guidelines

Please include:

- a short summary of the change
- the problem being solved
- any migration impact
- any seed-data impact
- any deployment or rollback considerations
- screenshots for significant UI changes, when applicable

Keep pull requests focused. If a change includes multiple unrelated concerns, split it into separate pull requests whenever possible.

## Issues

When filing an issue, include:

- the expected behavior
- the actual behavior
- steps to reproduce
- environment details
- screenshots or logs when relevant

Do not use public issues for security vulnerabilities. Follow [SECURITY.md](SECURITY.md) instead.

## Scope Notes

This repository is intended to support a practical LGU HRIS MVP and related extensions. Contributions that improve real HR operations, maintainability, and deployment readiness are preferred over speculative or overly abstract changes.
