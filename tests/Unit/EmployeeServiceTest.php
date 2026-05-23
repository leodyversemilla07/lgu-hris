<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\User;
use App\Services\EmployeeService;
use Database\Seeders\RoleAndPermissionSeeder;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Staff');
    $this->actingAs($this->user);
});

test('map employee for list returns correct structure', function () {
    $department = Department::factory()->create(['name' => 'Finance Office']);
    $position = Position::factory()->for($department)->create(['name' => 'Accountant']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0001',
        'first_name' => 'Juan',
        'middle_name' => 'M',
        'last_name' => 'Dela Cruz',
        'suffix' => null,
        'email' => 'juan@example.com',
        'phone' => '09171234567',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'hired_at' => '2025-06-01',
        'is_active' => true,
    ]);

    $service = app(EmployeeService::class);
    $mapped = $service->mapEmployeeForList($employee);

    expect($mapped)->toHaveKey('id', $employee->id);
    expect($mapped)->toHaveKey('uuid', $employee->uuid);
    expect($mapped)->toHaveKey('employee_number', 'EMP-0001');
    expect($mapped)->toHaveKey('full_name', 'Juan M Dela Cruz');
    expect($mapped)->toHaveKey('email', 'juan@example.com');
    expect($mapped)->toHaveKey('phone', '09171234567');
    expect($mapped)->toHaveKey('department', 'Finance Office');
    expect($mapped)->toHaveKey('position', 'Accountant');
    expect($mapped)->toHaveKey('employment_type', 'Permanent');
    expect($mapped)->toHaveKey('employment_status', 'Active');
    expect($mapped)->toHaveKey('hired_at', 'Jun 01, 2025');
    expect($mapped)->toHaveKey('is_active', true);
});

test('map employee detail returns complete profile', function () {
    $department = Department::factory()->create(['name' => 'IT Department']);
    $position = Position::factory()->for($department)->create(['name' => 'Developer']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0002',
        'first_name' => 'Maria',
        'middle_name' => null,
        'last_name' => 'Santos',
        'suffix' => 'Jr.',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
    ]);

    $service = app(EmployeeService::class);
    $mapped = $service->mapEmployeeDetail($employee);

    expect($mapped)->toHaveKey('full_name', 'Maria Santos Jr.');
    expect($mapped)->toHaveKey('first_name', 'Maria');
    expect($mapped)->toHaveKey('last_name', 'Santos');
    expect($mapped)->toHaveKey('suffix', 'Jr.');
    expect($mapped)->toHaveKey('department', 'IT Department');
    expect($mapped)->toHaveKey('position', 'Developer');
});

test('map history returns formatted changes', function () {
    $employee = Employee::factory()->create();

    $history = EmployeeHistory::factory()->create([
        'employee_id' => $employee->id,
        'event_type' => 'profile_updated',
        'before_values' => [
            'department' => 'Finance Office',
            'position' => 'Accountant I',
        ],
        'after_values' => [
            'department' => 'HR Office',
            'position' => 'HR Assistant',
        ],
        'effective_date' => '2026-01-15',
    ]);

    $service = app(EmployeeService::class);
    $mapped = $service->mapHistory($history);

    expect($mapped)->toHaveKey('id', $history->id);
    expect($mapped)->toHaveKey('event_type', 'profile_updated');
    expect($mapped)->toHaveKey('effective_date', 'Jan 15, 2026');
    expect($mapped['changes'])->toHaveCount(2);

    $departmentChange = collect($mapped['changes'])->firstWhere('label', 'Department');
    expect($departmentChange['from'])->toBe('Finance Office');
    expect($departmentChange['to'])->toBe('HR Office');
});

test('format file size returns human readable values', function () {
    $service = app(EmployeeService::class);

    expect($service->formatFileSize(500))->toBe('500 B');
    expect($service->formatFileSize(2048))->toBe('2 KB');
    expect($service->formatFileSize(1048576))->toBe('1 MB');
    expect($service->formatFileSize(1572864))->toBe('1.5 MB');
});
