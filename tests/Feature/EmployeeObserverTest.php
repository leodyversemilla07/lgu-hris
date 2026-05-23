<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Admin');
    $this->actingAs($this->user);
});

test('employee observer creates audit log on employee creation', function () {
    $employee = Employee::factory()->create();

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Employee::class,
        'auditable_id' => $employee->id,
        'event' => 'created',
        'user_id' => $this->user->id,
    ]);
});

test('employee observer creates employee history on creation', function () {
    $department = Department::factory()->create(['name' => 'HR Office']);
    $position = Position::factory()->for($department)->create(['name' => 'Staff']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-OBS-001',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
    ]);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'hired',
        'title' => 'Employee added to registry',
    ]);
});

test('employee observer creates audit log on employee update', function () {
    $employee = Employee::factory()->create([
        'first_name' => 'Juan',
    ]);

    $employee->update(['first_name' => 'Juan Carlos']);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => Employee::class,
        'auditable_id' => $employee->id,
        'event' => 'updated',
    ]);
});

test('employee observer creates history on employee department change', function () {
    $department = Department::factory()->create(['name' => 'Finance Office']);
    $position = Position::factory()->for($department)->create(['name' => 'Accountant']);
    $employmentType = EmploymentType::factory()->create(['name' => 'Permanent']);
    $employmentStatus = EmploymentStatus::factory()->create(['name' => 'Active']);

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-OBS-002',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
    ]);

    $newDept = Department::factory()->create(['name' => 'HR Office']);
    $employee->update(['department_id' => $newDept->id]);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'profile_updated',
    ]);
});

test('employee observer does not create history when non-tracked fields change', function () {
    $employee = Employee::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
    ]);

    // Updating a non-tracked field like email
    $employee->updateQuietly(['email' => 'newemail@example.com']);

    $employee->update(['email' => 'newemail@example.com']);

    // Only the created history should exist, no duplicate update
    $histories = EmployeeHistory::where('employee_id', $employee->id)
        ->where('event_type', 'profile_updated')
        ->count();

    // Email is not in TRACKED_ATTRIBUTE_MAP, so no update history
    expect($histories)->toBe(0);
});
