<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Admin');
    $this->actingAs($this->user);
});

test('personnel movement observer creates employee history on movement', function () {
    $fromDept = Department::factory()->create(['name' => 'Finance Office']);
    $toDept = Department::factory()->create(['name' => 'HR Office']);
    $fromPosition = Position::factory()->for($fromDept)->create(['name' => 'Accountant']);
    $toPosition = Position::factory()->for($toDept)->create(['name' => 'HR Assistant']);
    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-MOV-001',
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
    ]);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'personnel_movement',
        'title' => 'Promotion',
        'source_type' => PersonnelMovement::class,
        'source_id' => $movement->id,
    ]);
});

test('personnel movement observer creates history with correct before and after values', function () {
    $fromDept = Department::factory()->create(['name' => 'Finance Office']);
    $toDept = Department::factory()->create(['name' => 'HR Office']);
    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-MOV-002',
        'department_id' => $fromDept->id,
    ]);
    $movementType = MovementType::factory()->create(['name' => 'Transfer']);

    PersonnelMovement::factory()->create([
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'from_department_id' => $fromDept->id,
        'to_department_id' => $toDept->id,
        'from_position_id' => null,
        'to_position_id' => null,
    ]);

    $this->assertDatabaseHas('employee_histories', [
        'employee_id' => $employee->id,
        'event_type' => 'personnel_movement',
        'title' => 'Transfer',
    ]);
});
