# Product Requirements Document (PRD)

## LGU Human Resource Information System (LGU HRIS)

## 1. Product Overview

The LGU Human Resource Information System (LGU HRIS) is a web-based platform built to digitize and streamline human resource operations for a municipal Local Government Unit in the Philippines.

It centralizes employee records, automates HR workflows, and supports compliance reporting for agencies such as the Civil Service Commission (CSC), Department of the Interior and Local Government (DILG), and Government Service Insurance System (GSIS).

The system is intended to replace manual, paper-based HR processes with a secure, accurate, and efficient digital solution.

## 2. Goals and Objectives

### 2.1 Primary Goals

- Digitize all employee 201 files and HR records
- Improve efficiency of HR operations
- Minimize manual paperwork and filing
- Maintain accurate, centralized employee information
- Support statutory and administrative reporting requirements

### 2.2 Secondary Goals

- Improve transparency in HR workflows
- Speed up report generation
- Strengthen data security and accessibility
- Support workforce planning through analytics

## 3. Target Users

| User Type          | Description                                               |
| ------------------ | --------------------------------------------------------- |
| HR Administrator   | Oversees the system, employee data, and HR operations     |
| HR Staff           | Updates records, processes leave, attendance, and reports |
| Department Heads   | Reviews team records and approves leave requests          |
| Employees          | Views personal data and leave balances                    |
| Municipal IT Staff | Maintains the system, server, and technical support       |

## 4. Scope

### 4.1 In Scope

- Employee Information Management
- Attendance Management
- Leave Management
- Payroll Data Support
- Personnel Movement Tracking
- Document Management
- Government Compliance Reporting
- User Management and Security
- HR Analytics and Reporting

### 4.2 Out of Scope

- Full payroll computation
- Budgeting and accounting
- Procurement processes
- Citizen-facing services

## 5. Key Features and Modules

### 5.1 Employee Information Management

This module manages employee personal and employment data.

Features:

- Digital 201 files
- Employee profile creation and update
- Employment history tracking
- Department and position assignment
- Document attachment and storage

Core Data Fields:

- Employee ID
- Full Name
- Birthdate
- Address
- Civil Status
- Contact Information
- Position Title
- Department
- Salary Grade
- Employment Type
- Date of Appointment
- Employment Status

### 5.2 Attendance Management

This module records and monitors employee attendance.

Features:

- Daily time and attendance logging
- Optional biometric integration
- Tracking of tardiness and absences
- Schedule management
- Monthly attendance summaries

Outputs:

- Attendance reports
- Absence summaries
- Time logs

### 5.3 Leave Management

This module handles leave balances, requests, and approvals.

Features:

- Leave credit tracking
- Leave application submission
- Approval workflow
- Leave history and ledger

Supported Leave Types:

- Vacation Leave
- Sick Leave
- Special Leave
- Maternity Leave
- Paternity Leave
- Emergency Leave
- Other CSC-approved leave types

### 5.4 Payroll Data Support

This module stores compensation-related data required for payroll preparation.

Features:

- Salary grade and step tracking
- Allowance records
- Deduction records
- Payroll-related report export

Payroll Data Fields:

- Salary Grade
- Step Increment
- Allowances
- Government Contributions

### 5.5 Personnel Movement Management

This module tracks employment changes.

Features:

- Promotion records
- Transfer records
- Status updates
- Separation records
- Reappointment tracking

### 5.6 Document Management

This module stores scanned and uploaded employee documents.

Supported Documents:

- Appointment papers
- Service records
- Training certificates
- Performance evaluations
- Leave forms

Features:

- File upload
- Version tracking
- Secure storage
- Document retrieval

### 5.7 Government Compliance Reporting

This module generates required reports for internal and external compliance.

Standard Reports:

- Plantilla of Personnel
- Service Records
- Leave Ledger
- Personnel Masterlist
- Personnel Movement Reports

Export Formats:

- PDF
- Excel
- CSV

### 5.8 HR Analytics and Reporting

This module provides summarized HR insights.

Metrics:

- Employee count by department
- Leave utilization
- Attendance trends
- Employment status distribution

### 5.9 User Management and Security

This module manages access and protection of system data.

Features:

- Role-based access control
- Secure user authentication
- Activity logging
- Password encryption
- Session management
- Permission-based module actions

User Roles:

| Role            | Permissions                                 |
| --------------- | ------------------------------------------- |
| HR Admin        | Full access to all modules                  |
| HR Staff        | Manage employee records and reports         |
| Department Head | View department staff and approve leave     |
| Employee        | View personal profile and leave information |

Implementation Note:

- The system should use `spatie/laravel-permission` for maintainable role and permission management.
- Laravel policies should be used alongside roles and permissions for department-based and record-level access control.

## 6. Functional Requirements

| ID   | Requirement                                                                      |
| ---- | -------------------------------------------------------------------------------- |
| FR1  | The system shall allow HR staff to create and manage employee profiles           |
| FR2  | The system shall store employee records in a centralized database                |
| FR3  | The system shall track leave balances and usage                                  |
| FR4  | The system shall allow employees to submit leave requests                        |
| FR5  | The system shall allow supervisors or department heads to approve leave requests |
| FR6  | The system shall record and monitor employee attendance                          |
| FR7  | The system shall generate HR and compliance reports                              |
| FR8  | The system shall export reports in PDF, Excel, and CSV formats                   |
| FR9  | The system shall store and retrieve employee documents                           |
| FR10 | The system shall log user activity for audit purposes                            |

## 7. Non-Functional Requirements

### Performance

- Must support up to 500 employees
- Average response time must be under 3 seconds

### Security

- Passwords must be encrypted
- Data must be protected from unauthorized access
- Role-based permissions must be enforced

### Reliability

- System uptime must be at least 99% during office hours

### Usability

- Interface must be easy to learn and use
- System must work on modern web browsers

## 8. System Architecture

### Platform

- Web-based application accessible through desktop and mobile browsers

### Proposed Technology Stack

Frontend:

- React
- Tailwind CSS
- shadcn/ui

Backend:

- Laravel 12
- Laravel Fortify
- `spatie/laravel-permission`

Database:

- MySQL

Hosting:

- Cloud-hosted or on-premise municipal server

## 9. Data Privacy and Security

The system must comply with the Data Privacy Act of 2012.

Data Protection Measures:

- Secure authentication
- Role-based access control
- Permission-based authorization
- Encrypted sensitive data
- Audit trails
- Scheduled backups
- Controlled document access

## 10. User Interface Requirements

### Design Principles

- Clean and professional admin dashboard
- Sidebar navigation for modules
- Tabular presentation for employee records
- Simple and consistent data entry forms

### UI Style

- Use the `Nova` theme style from `shadcn/ui`
- Maintain a professional administrative appearance suitable for LGU use

## 11. Implementation Plan

| Phase   | Description            |
| ------- | ---------------------- |
| Phase 1 | Requirements gathering |
| Phase 2 | System design          |
| Phase 3 | Development            |
| Phase 4 | Testing                |
| Phase 5 | Deployment             |
| Phase 6 | Training and rollout   |

## 12. Success Metrics

| Metric                       | Target                |
| ---------------------------- | --------------------- |
| Reduction in HR paperwork    | 70%                   |
| Faster report generation     | 50% improvement       |
| Employee data retrieval time | Under 5 seconds       |
| User satisfaction rating     | 80% positive feedback |

## 13. Risks and Mitigation

| Risk                  | Mitigation                                        |
| --------------------- | ------------------------------------------------- |
| Data migration issues | Perform cleansing and validation before import    |
| Resistance from users | Conduct training and onboarding sessions          |
| System downtime       | Implement backups and recovery procedures         |
| Security threats      | Apply encryption, access controls, and monitoring |

## 14. Future Enhancements

Possible future modules and improvements:

- Full payroll processing
- Recruitment and applicant tracking
- Performance management
- Training and development management
- Mobile access
- Biometric attendance integration
- Employee self-service portal enhancements
