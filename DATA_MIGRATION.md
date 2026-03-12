# Data Migration Guide

This guide helps LGUs prepare existing HR records for migration into `LGU HRIS`.

## Scope

Typical legacy sources include:

- spreadsheets
- paper personnel files
- prior in-house systems
- CSV exports from attendance or payroll-support tools

## Migration Principles

- migrate validated data, not raw unreviewed records
- keep an untouched source copy of every original file
- test with a pilot batch before a full cutover
- assign business owners for data validation

## Recommended Migration Order

1. Reference data
2. Employees
3. Documents
4. Leave balances or open leave requests
5. Personnel movements
6. Attendance summaries or raw imports, if needed

## Reference Data Preparation

Before importing employees, validate:

- departments
- positions
- employment types
- employment statuses
- leave types
- document types
- movement types

If legacy names differ from the target LGU naming convention, normalize them before bulk import.

## Employee Import

The application includes an employee import flow and template download.

Prepare employee records with:

- employee number
- first name
- middle name, if available
- last name
- suffix, if available
- email, if available
- phone, if available
- birth date
- hired date
- department
- position
- employment type
- employment status

Before full import:

- test a pilot batch
- verify duplicate employee-number behavior
- confirm unresolved references are corrected

## Document Migration

For employee documents:

- define a file naming convention
- confirm employee-number matching
- separate confidential documents clearly
- decide which historical versions must be uploaded
- verify storage size before bulk document loading

## Leave and Attendance Data

Decide whether the LGU needs:

- only current balances and active requests
- recent operational history
- full historical migration

For attendance:

- normalize employee numbers
- normalize dates and times
- decide whether to migrate monthly summaries, raw logs, or both
- test biometric CSV samples before bulk import

## Validation Checklist

After each migration batch, validate:

- row counts
- sample employee profiles
- department and position mapping
- leave balances or requests
- attendance summaries
- document accessibility
- report output correctness

## Cutover Notes

Before final cutover:

- freeze legacy edits for the selected cutover window
- run final import and validation
- confirm backups exist before and after migration
- keep rollback instructions available

## Recommended Deliverables

Each LGU rollout should produce:

- source data inventory
- field mapping sheet
- migration owner list
- pilot migration log
- final migration sign-off
