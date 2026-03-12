# Security Policy

## Overview

`LGU HRIS` is a deployable web application for Local Government Unit human resource operations. It may store employee records, leave data, attendance records, personnel movements, document metadata, and other sensitive administrative information.

Security issues should be handled privately until they are understood, validated, and remediated.

## Supported Releases

Security fixes are expected only for the latest maintained branch published by the project maintainers.

If you are running:

- an older commit
- a fork with local modifications
- a demo deployment
- a misconfigured production environment

you may be asked to reproduce the issue against the latest supported branch before it is treated as an active security case.

## Reporting a Vulnerability

Do not open public GitHub issues for suspected security vulnerabilities.

Report vulnerabilities privately to the maintainers and include:

- a concise description of the issue
- affected module, route, controller, page, or workflow
- reproduction steps
- required roles or permissions
- proof of impact
- suggested remediation, if available

If this repository is published under an organization account, maintainers should replace this section with the official security contact email or private disclosure channel before public rollout.

## Sensitive Areas

Please treat findings in the following areas as security-sensitive:

- authentication and account recovery
- authorization, policies, and permission checks
- employee profiles and compensation data
- employee documents and confidential file access
- leave approvals and department-scoped workflows
- attendance logging and biometric CSV imports
- reports, exports, and personal data exposure
- notification and audit trail integrity

## Response Expectations

Maintainers should aim to:

- acknowledge receipt of a report promptly
- validate and triage the report
- provide status updates when practical
- coordinate a fix before public disclosure

Response timelines may vary depending on maintainer availability and report quality.

## Disclosure Policy

Please allow maintainers reasonable time to investigate and remediate vulnerabilities before public disclosure.

Public disclosure should happen only after:

- the issue has been confirmed
- affected users have had a reasonable opportunity to update
- the maintainers indicate that disclosure is safe

## Deployment Responsibilities

This repository does not remove the need for deployment hardening. Implementers are responsible for secure production operations, including:

- enforcing HTTPS
- setting `APP_ENV=production`
- setting `APP_DEBUG=false`
- using strong administrator credentials
- rotating bootstrap credentials after first setup
- configuring real mail and queue infrastructure
- limiting database and server access with least privilege
- validating backup and restore procedures
- protecting uploaded files and storage access
- keeping PHP, Node, Laravel, and server dependencies updated

## Out of Scope

The following are generally not treated as product vulnerabilities unless there is a clear defect in the application itself:

- insecure server administration
- disabled HTTPS
- debug mode left enabled in production
- weak passwords chosen by deployers
- unsupported forks or heavily modified deployments
- exposure caused by custom local code changes
- missing backup or disaster recovery procedures

## Known Operational Boundaries

The current application supports manual attendance logging, CSV imports, and biometric-ready CSV ingestion. It does not yet provide direct live integration with biometric kiosk or device APIs. That limitation should not be reported as a security vulnerability by itself.
