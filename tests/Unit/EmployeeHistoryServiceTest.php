<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\User;
use App\Models\WorkSchedule;
use App\Services\EmployeeHistoryService;
use Database\Seeders\RoleAndPermissionSeeder;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Admin');
    $this->actingAs($this->user);
});

test('record created employee history', function () {
    $department = Department::factory()->create(['name' => 'Finance Office']);
    $position = Position::factory()->for($department)->create(['name' => 'Accountant']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);
    $workSchedule = WorkSchedule::factory()->create(['name' => 'Regular 8-5']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0001',
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'work_schedule_id' => $workSchedule->id,
        'hired_at' => now()->subYear(),
        'is_active' => true,
    ]);

    EmployeeHistoryService::recordCreated($employee);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'hired',
        'title' => 'Employee added to registry',
    ]);
});

test('record updated employee history tracks department change', function () {
    $department = Department::factory()->create(['name' => 'Finance Office']);
    $position = Position::factory()->for($department)->create(['name' => 'Accountant']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);
    $workSchedule = WorkSchedule::factory()->create(['name' => 'Regular 8-5']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0002',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'work_schedule_id' => $workSchedule->id,
    ]);

    $newDepartment = Department::factory()->create(['name' => 'HR Office']);
    $employee->update(['department_id' => $newDepartment->id]);

    EmployeeHistoryService::recordUpdated($employee);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'profile_updated',
        'title' => 'Employment profile updated',
    ]);
});

test('record updated employee history detects archive event', function () {
    $employee = Employee::factory()->create([
        'is_active' => true,
    ]);

    $employee->update(['is_active' => false]);
    EmployeeHistoryService::recordUpdated($employee);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'archived',
        'title' => 'Employee archived from active registry',
    ]);
});

test('record updated employee history detects restore event', function () {
    $employee = Employee::factory()->create([
        'is_active' => false,
        'archived_at' => now()->subDay(),
    ]);

    $employee->update(['is_active' => true, 'archived_at' => null]);
    EmployeeHistoryService::recordUpdated($employee);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'restored',
        'title' => 'Employee restored to active registry',
    ]);
});

test('record movement creates personnel movement history', function () {
    $fromDept = Department::factory()->create(['name' => 'Finance Office']);
    $toDept = Department::factory()->create(['name' => 'HR Office']);
    $fromPosition = Position::factory()->for($fromDept)->create(['name' => 'Accountant I']);
    $toPosition = Position::factory()->for($toDept)->create(['name' => 'HR Assistant']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0003',
        'department_id' => $fromDept->id,
        'position_id' => $fromPosition->id,
    ]);

    $movementType = MovementType::factory()->create(['name' => 'Promotion']);
    $movement = PersonnelMovement::factory()->create([
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'from_department_id' => $fromDept->id,
        'to_department_id' => $toDept->id,
        'from_position_id' => $fromPosition->id,
        'to_position_id' => $toPosition->id,
        'order_number' => 'CSC-2026-0001',
        'remarks' => 'Promoted due to exemplary performance.',
    ]);

    EmployeeHistoryService::recordMovement($movement);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'personnel_movement',
        'title' => 'Promotion',
        'source_type' => PersonnelMovement::class,
        'source_id' => $movement->id,
    ]);
});

test('record movement with null optional fields still creates history', function () {
    $employee = Employee::factory()->create();

    $movementType = MovementType::factory()->create(['name' => 'Status Change']);
    $movement = PersonnelMovement::factory()->create([
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'from_department_id' => null,
        'to_department_id' => null,
        'from_position_id' => null,
        'to_position_id' => null,
        'order_number' => null,
        'remarks' => null,
    ]);

    EmployeeHistoryService::recordMovement($movement);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'personnel_movement',
        'title' => 'Status Change',
    ]);
});

test('record created employee history with correct snapshot values', function () {
    $department = Department::factory()->create(['name' => 'IT Department']);
    $position = Position::factory()->for($department)->create(['name' => 'Developer']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);
    $workSchedule = WorkSchedule::factory()->create(['name' => 'Regular 8-5']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0004',
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'work_schedule_id' => $workSchedule->id,
        'hired_at' => '2025-01-15',
    ]);

    EmployeeHistoryService::recordCreated($employee);

    $history = EmployeeHistory::where('employee_id', $employee->id)
        ->where('event_type', 'hired')
        ->first();

    expect($history)->not->toBeNull();
    expect($history->after_values)->toHaveKey('department', 'IT Department');
    expect($history->after_values)->toHaveKey('position', 'Developer');
    expect($history->after_values)->toHaveKey('employment_type', 'Permanent');
    expect($history->after_values)->toHaveKey('employment_status', 'Active');
    expect($history->after_values)->toHaveKey('work_schedule', 'Regular 8-5');
    expect($history->after_values)->toHaveKey('hired_at', 'Jan 15, 2025');
    expect($history->after_values)->toHaveKey('is_active', 'Active');
});
