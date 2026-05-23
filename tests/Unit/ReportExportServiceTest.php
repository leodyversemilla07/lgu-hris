<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\User;
use App\Services\ReportExportService;
use Database\Seeders\RoleAndPermissionSeeder;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Staff');
    $this->actingAs($this->user);
});

test('report export service records an export event', function () {
    ReportExportService::record(
        user: $this->user,
        reportKey: 'personnel_masterlist',
        reportName: 'Personnel Masterlist',
        format: 'excel',
        fileName: 'masterlist-2026.xlsx',
    );

    $this->assertDatabaseHas('report_exports', [
        'user_id' => $this->user->id,
        'report_key' => 'personnel_masterlist',
        'report_name' => 'Personnel Masterlist',
        'export_format' => 'excel',
        'file_name' => 'masterlist-2026.xlsx',
        'department_id' => null,
        'employee_id' => null,
        'filters' => null,
    ]);
});

test('report export service records with filters and department', function () {
    $department = Department::factory()->create();

    ReportExportService::record(
        user: $this->user,
        reportKey: 'leave_ledger',
        reportName: 'Leave Ledger',
        format: 'pdf',
        fileName: 'leave-ledger.pdf',
        filters: ['year' => '2026', 'department_id' => (string) $department->id],
        departmentId: $department->id,
    );

    $this->assertDatabaseHas('report_exports', [
        'user_id' => $this->user->id,
        'report_key' => 'leave_ledger',
        'export_format' => 'pdf',
        'department_id' => $department->id,
    ]);
});

test('report export service records with employee scope', function () {
    $employee = Employee::factory()->create();

    ReportExportService::record(
        user: $this->user,
        reportKey: 'service_record',
        reportName: 'Service Record',
        format: 'pdf',
        fileName: 'service-record.pdf',
        filters: ['employee_id' => (string) $employee->id],
        employeeId: $employee->id,
    );

    $this->assertDatabaseHas('report_exports', [
        'user_id' => $this->user->id,
        'report_key' => 'service_record',
        'employee_id' => $employee->id,
    ]);
});

test('report export service sanitizes empty filters', function () {
    ReportExportService::record(
        user: $this->user,
        reportKey: 'attendance',
        reportName: 'Attendance Summary',
        format: 'csv',
        fileName: 'attendance.csv',
        filters: ['status' => null, 'department_id' => '', 'year' => 'all'],
    );

    $this->assertDatabaseHas('report_exports', [
        'report_key' => 'attendance',
        'filters' => null,
    ]);
});
