# User Acceptance Testing Checklist

Use this checklist before production rollout for each LGU deployment.

## Environment and Access

- [ ] Production URL is correct and uses HTTPS
- [ ] Real LGU administrator account can sign in
- [ ] `HR Admin`, `HR Staff`, `Department Head`, and `Employee` roles have expected access
- [ ] Unauthorized users are blocked from restricted modules

## Employee Management

- [ ] Create a new employee record
- [ ] Edit employee profile information
- [ ] Archive and restore an employee record
- [ ] View employment history entries
- [ ] Department heads only see scoped employee data

## Document Management

- [ ] Upload a normal document
- [ ] Upload a confidential document
- [ ] Preview supported files
- [ ] Download the current document version
- [ ] Upload a replacement version and verify history
- [ ] Confirm confidential document restrictions work

## Leave Management

- [ ] Employee can save a leave request as draft
- [ ] Employee can submit a draft leave request
- [ ] Approver can approve a scoped request
- [ ] Approver can reject a scoped request
- [ ] Employee can cancel an eligible request
- [ ] Leave approval history is visible
- [ ] Notifications are delivered for submission and action

## Attendance Management

- [ ] HR can log attendance manually
- [ ] HR can bulk import attendance
- [ ] HR can import biometric CSV data by employee number
- [ ] Schedule-aware late and undertime values compute correctly
- [ ] Monthly attendance view shows expected totals
- [ ] Department heads only see scoped attendance records

## Personnel Movements

- [ ] HR can record a personnel movement
- [ ] Employee movement history appears on the profile
- [ ] Department heads cannot access out-of-scope movement records

## Reports and Exports

- [ ] Reports page loads for authorized users
- [ ] Export permissions are enforced correctly
- [ ] Masterlist export works
- [ ] Plantilla export works
- [ ] Leave ledger export works
- [ ] Attendance export works
- [ ] Personnel movement export works
- [ ] Payroll support register export works
- [ ] Service record PDF works

## Notifications and Auditability

- [ ] In-app notifications appear for expected workflows
- [ ] Mark-as-read actions work
- [ ] Export history is recorded
- [ ] Audit trail entries are visible where expected

## Operations Readiness

- [ ] Queue worker is processing jobs
- [ ] Mail delivery is confirmed
- [ ] Backup job exists and has run successfully
- [ ] Restore rehearsal has been completed
- [ ] `php artisan hris:preflight` passes in the target environment

## Sign-Off

- [ ] HR office representative approved the workflows
- [ ] IT/operations representative approved the environment
- [ ] Issues found during UAT were resolved or explicitly accepted
