# Security Policy

## Supported Use

This repository is intended for legitimate LGU HRIS deployments, evaluation, and contribution.

Before production use, each implementer should:

- review environment configuration
- disable debug mode
- configure real mail and queue infrastructure
- validate backup and restore procedures
- rotate all bootstrap credentials

## Reporting a Vulnerability

Please do not open public GitHub issues for security vulnerabilities.

Report vulnerabilities privately to the maintainers with:

- a clear description of the issue
- affected area or endpoint
- reproduction steps
- impact assessment
- suggested fix, if available

If this repository is published under an organization account, add the official security contact address before public release.

## Scope Notes

Known operational boundaries that should not be mistaken for vulnerabilities:

- attendance does not yet integrate with biometric devices or kiosks
- deployment-specific backup and restore automation is not bundled in this repository
- implementers are responsible for production mail, queue, HTTPS, and database hardening
