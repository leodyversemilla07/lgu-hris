# LGU HRIS Development Plan

## Stack Decision

- Database: `MySQL`
- Backend: `Laravel 12`
- Frontend: `React + Inertia + TypeScript + shadcn/ui`
- Auth/Security Base: `Laravel Fortify`
- Authorization Package: `spatie/laravel-permission`

## 1. Development Strategy

Build the system in phases, starting with the HR core and delaying non-critical integrations until the base records and workflows are stable.

### MVP First

The first production-ready release should include:

- Employee Information Management
- Document Management
- Leave Management
- Personnel Movement Tracking
- User Roles and Access Control
- Audit Logging
- Government Reporting (core reports only)

### Deferred to Later Phases

- Biometric device integration
- Advanced attendance automation
- Full payroll computation
- Mobile application
- Advanced analytics dashboards

## 2. Recommended Architecture

### Application Layers

- `Presentation`: Inertia pages, React components, forms, tables, dashboards
- `HTTP`: routes, controllers, form requests, middleware, policies
- `Domain`: services for leave workflow, report generation, personnel movement rules
- `Persistence`: Eloquent models, migrations, repositories if needed
- `Infrastructure`: file storage, exports, notifications, backups, logging

### Authorization Strategy

- Use `spatie/laravel-permission` for roles and permissions
- Use roles for broad access groups: `HR Admin`, `HR Staff`, `Department Head`, `Employee`
- Use permissions for module actions such as `employees.view`, `leave.approve`, and `reports.export`
- Use Laravel policies for record-level rules such as department-based visibility and approval scope
- Do not rely on role checks alone for sensitive HR data access

### MySQL Notes

- Use `utf8mb4`
- Add indexes for employee ID, department, status, leave dates, and report-heavy fields
- Prefer foreign keys for referential integrity
- Use soft deletes only where recovery/audit value is high

## 3. Module Delivery Roadmap

## Phase 0 - Foundation and Analysis

Goals:

- Confirm final workflows and report templates with the LGU HR office
- Define user roles and approval hierarchy
- Prepare MySQL schema plan
- Prepare seed/reference data

Deliverables:

- Approved workflow map
- Finalized report list and export fields
- ERD draft
- Role matrix

## Phase 1 - Core Platform Setup

Goals:

- Convert starter kit into HRIS shell
- Set up shared navigation, dashboard, and admin layout
- Add role-based access control and audit logging foundation

Backend:

- Install and configure `spatie/laravel-permission`
- Roles and permissions tables
- User-role assignment
- Policies and middleware
- Audit log table and activity recording

Frontend:

- Replace starter welcome/dashboard screens
- Add sidebar links for core HRIS modules
- Build reusable UI patterns for forms, tables, filters, and status badges

Definition of Done:

- Authenticated users land on HRIS dashboard
- Navigation reflects role permissions
- Sensitive actions are logged

## Phase 2 - Employee Information Management

Goals:

- Build digital 201 file management
- Centralize employee records and employment details

Backend:

- Tables for employees, departments, positions, employment types, employment statuses
- Employment history support
- Employee profile CRUD
- Validation rules for required HR fields

Frontend:

- Employee list page with search and filters
- Employee create/edit pages
- Profile detail page with tabs for personal info, employment info, documents, history

Definition of Done:

- HR staff can create, edit, view, and archive employee records
- Employee data is searchable and export-ready

## Phase 3 - Document Management

Goals:

- Store digital employee files securely
- Support retrieval and version awareness

Backend:

- Employee documents table
- File upload handling
- Storage organization by employee and document type
- Access controls for confidential files

Frontend:

- Upload and preview interface
- Document type filters
- Download and replace actions

Definition of Done:

- HR staff can upload and retrieve employee documents safely

## Phase 4 - Leave Management

Goals:

- Digitize leave balances, filing, and approvals

Backend:

- Leave types, leave balances, leave requests, approval actions
- Workflow states: draft, submitted, approved, rejected, cancelled
- Leave credit computation rules
- Department head approval flow

Frontend:

- Employee leave request form
- Department head approval queue
- HR leave ledger and balance management

Definition of Done:

- Employees can file leave
- Department heads can approve/reject
- HR can track balances and history

## Phase 5 - Personnel Movement Tracking

Goals:

- Record employment changes over time

Backend:

- Movement types table
- Personnel movements table for promotion, transfer, separation, reappointment, status change
- Timeline history per employee

Frontend:

- Personnel movement entry form
- Employee movement history view
- Department/personnel movement reports

Definition of Done:

- HR can trace employment changes for each employee

## Phase 6 - Attendance and Payroll Data Support

Goals:

- Support attendance recording and payroll-related reference data without full payroll computation

Backend:

- Work schedules
- Attendance logs
- Monthly summaries
- Salary grade, step increment, allowance, deduction reference fields

Frontend:

- Attendance summary screens
- Import/manual entry workflow
- Payroll-support data view on employee profiles

Definition of Done:

- HR can record attendance and export attendance summaries
- Payroll office can retrieve support data from HRIS

## Phase 7 - Government Reports and Analytics

Goals:

- Deliver compliance-ready reports and dashboards

Reports:

- Plantilla of Personnel
- Service Records
- Leave Ledger
- Personnel Masterlist
- Personnel Movement Reports

Exports:

- PDF
- Excel
- CSV

Dashboard KPIs:

- Employee count by department
- Leave utilization
- Attendance trends
- Employment status distribution

Definition of Done:

- HR can generate required reports without manual spreadsheet consolidation

## Phase 8 - Hardening, Migration, and Rollout

Goals:

- Prepare the system for actual municipal adoption

Tasks:

- User acceptance testing
- Data migration from paper/Excel records
- Backup and restore verification
- Training for HR staff and department heads
- Deployment on municipal server or managed hosting

Definition of Done:

- Pilot users can operate the system in real workflows
- Critical defects are resolved

## 4. MySQL Data Model Implementation Order

### Foundation Tables

- Spatie permission tables: `roles`, `permissions`, `model_has_roles`, `model_has_permissions`, `role_has_permissions`
- `departments`
- `positions`
- `employment_types`
- `employment_statuses`
- `document_types`
- `leave_types`
- `movement_types`

### Core HR Tables

- `employees`
- `employee_employment_details`
- `employee_contacts`
- `employee_addresses`
- `employee_documents`
- `employee_histories`

### Workflow Tables

- `leave_balances`
- `leave_requests`
- `leave_approvals`
- `personnel_movements`
- `attendance_logs`
- `work_schedules`

### System Tables

- `audit_logs`
- `notifications`
- `report_exports`

## 5. Suggested Sprint Plan

### Sprint 1

- Project setup cleanup
- MySQL configuration
- Roles and permissions
- HRIS navigation and dashboard shell

### Sprint 2

- Departments, positions, employment references
- Employee master record CRUD

### Sprint 3

- Employee detail pages
- Document management
- Employment history

### Sprint 4

- Leave types and balances
- Leave filing and approval workflow

### Sprint 5

- Personnel movement tracking
- Audit logs

### Sprint 6

- Core government reports
- Export features

### Sprint 7

- Attendance basics
- Payroll-support fields

### Sprint 8

- UAT fixes
- Data migration support
- Training and deployment prep

## 6. Testing Plan

### Automated Tests

- Feature tests for employee CRUD
- Feature tests for leave filing/approval
- Policy tests for role access
- Validation tests for required HR data
- Report generation tests

### Manual/UAT Tests

- HR Admin full workflow
- HR Staff record maintenance workflow
- Department Head leave approval workflow
- Employee self-service workflow

## 7. Security and Compliance Checklist

- Enforce role-based access in backend policies
- Implement `spatie/laravel-permission` for maintainable authorization
- Encrypt passwords and protect sessions
- Log sensitive actions
- Restrict employee document access
- Configure backups for MySQL and uploaded files
- Align data handling with the Data Privacy Act of 2012

## 8. Immediate Build Order for This Repo

Based on the current codebase, the next implementation sequence should be:

1. Replace starter dashboard and sidebar with HRIS navigation
2. Add roles/permissions and MySQL-ready migrations
3. Build departments, positions, and employee reference tables
4. Build employee management module
5. Add document management
6. Add leave management workflow
7. Add personnel movement records
8. Add report generation

## 9. Recommended Success Criteria for MVP

- HR staff can encode and manage all employee records digitally
- Department heads can approve leave requests online
- Employee records and documents are searchable in under 5 seconds
- Core reports can be exported without manual recomputation
- Access is restricted by role and sensitive actions are auditable
