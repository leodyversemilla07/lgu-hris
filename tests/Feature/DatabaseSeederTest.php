<?php

use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\EmployeeDocument;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\SalaryGrade;
use App\Models\User;
use App\Models\WorkSchedule;
use Database\Seeders\DatabaseSeeder;
use Database\Seeders\DemoDatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

uses(RefreshDatabase::class);

test('database seeder populates production-safe reference data only', function () {
    $this->seed(DatabaseSeeder::class);

    expect(Role::query()->count())->toBeGreaterThan(0)
        ->and(Permission::query()->count())->toBeGreaterThan(0)
        ->and(Department::query()->count())->toBeGreaterThan(0)
        ->and(Position::query()->count())->toBeGreaterThan(0)
        ->and(EmploymentType::query()->count())->toBeGreaterThan(0)
        ->and(EmploymentStatus::query()->count())->toBeGreaterThan(0)
        ->and(DocumentType::query()->count())->toBeGreaterThan(0)
        ->and(LeaveType::query()->count())->toBeGreaterThan(0)
        ->and(MovementType::query()->count())->toBeGreaterThan(0)
        ->and(SalaryGrade::query()->count())->toBeGreaterThan(0)
        ->and(WorkSchedule::query()->count())->toBeGreaterThan(0)
        ->and(User::query()->count())->toBe(0)
        ->and(Employee::query()->count())->toBe(0)
        ->and(EmployeeDocument::query()->count())->toBe(0)
        ->and(LeaveBalance::query()->count())->toBe(0)
        ->and(LeaveRequest::query()->count())->toBe(0)
        ->and(PersonnelMovement::query()->count())->toBe(0)
        ->and(AttendanceLog::query()->count())->toBe(0)
        ->and(AttendanceSummary::query()->count())->toBe(0)
        ->and(EmployeeCompensation::query()->count())->toBe(0)
        ->and(AuditLog::query()->count())->toBe(0);
});

test('demo database seeder populates sample users and hris records', function () {
    $this->seed(DemoDatabaseSeeder::class);

    expect(Role::query()->count())->toBeGreaterThan(0)
        ->and(Permission::query()->count())->toBeGreaterThan(0)
        ->and(User::query()->count())->toBeGreaterThan(0)
        ->and(Department::query()->count())->toBeGreaterThan(0)
        ->and(Position::query()->count())->toBeGreaterThan(0)
        ->and(EmploymentType::query()->count())->toBeGreaterThan(0)
        ->and(EmploymentStatus::query()->count())->toBeGreaterThan(0)
        ->and(DocumentType::query()->count())->toBeGreaterThan(0)
        ->and(LeaveType::query()->count())->toBeGreaterThan(0)
        ->and(MovementType::query()->count())->toBeGreaterThan(0)
        ->and(SalaryGrade::query()->count())->toBeGreaterThan(0)
        ->and(WorkSchedule::query()->count())->toBeGreaterThan(0)
        ->and(Employee::query()->count())->toBeGreaterThan(0)
        ->and(EmployeeDocument::query()->count())->toBeGreaterThan(0)
        ->and(LeaveBalance::query()->count())->toBeGreaterThan(0)
        ->and(LeaveRequest::query()->count())->toBeGreaterThan(0)
        ->and(PersonnelMovement::query()->count())->toBeGreaterThan(0)
        ->and(AttendanceLog::query()->count())->toBeGreaterThan(0)
        ->and(AttendanceSummary::query()->count())->toBeGreaterThan(0)
        ->and(EmployeeCompensation::query()->count())->toBeGreaterThan(0)
        ->and(AuditLog::query()->count())->toBeGreaterThan(0);
});
