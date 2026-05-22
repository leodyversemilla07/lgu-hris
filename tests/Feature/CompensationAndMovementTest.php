<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\SalaryGrade;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\SalaryGradeSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can create employee compensation', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(SalaryGradeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $salaryGrade = SalaryGrade::query()->firstOrFail();

    $this->actingAs($user)
        ->post(route('employee-compensation.store', $employee), [
            'salary_grade_id' => $salaryGrade->id,
            'effective_date' => '2026-01-01',
            'allowances' => 2000,
            'deductions' => 500,
            'notes' => 'Initial compensation',
        ])
        ->assertRedirect(route('employees.show', $employee));

    $this->assertDatabaseHas('employee_compensation', [
        'employee_id' => $employee->id,
        'salary_grade_id' => $salaryGrade->id,
        'allowances' => 2000,
        'deductions' => 500,
        'notes' => 'Initial compensation',
    ]);
});

test('hr staff can edit employee compensation', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(SalaryGradeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $salaryGrade = SalaryGrade::query()->firstOrFail();

    $compensation = EmployeeCompensation::factory()->create([
        'employee_id' => $employee->id,
        'salary_grade_id' => $salaryGrade->id,
        'allowances' => 1000,
        'deductions' => 200,
    ]);

    $this->actingAs($user)
        ->get(route('employee-compensation.edit', [$employee, $compensation]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/compensation-edit')
            ->where('compensation.id', $compensation->id)
        );

    $this->actingAs($user)
        ->patch(route('employee-compensation.update', [$employee, $compensation]), [
            'allowances' => 3000,
            'deductions' => 400,
            'notes' => 'Updated compensation',
        ])
        ->assertRedirect(route('employees.show', $employee));

    expect($compensation->fresh()->allowances)->toEqual(3000.0);
    expect($compensation->fresh()->deductions)->toEqual(400.0);
    expect($compensation->fresh()->notes)->toBe('Updated compensation');
});

test('hr staff can create personnel movement', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $movementType = MovementType::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->post(route('personnel-movements.store'), [
            'employee_id' => $employee->id,
            'movement_type_id' => $movementType->id,
            'effective_date' => '2026-06-01',
            'order_number' => 'ORD-2026-001',
            'remarks' => 'Promotion',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('personnel_movements', [
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'order_number' => 'ORD-2026-001',
    ]);
});

test('hr staff can edit personnel movement', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $department = Department::factory()->create(['is_active' => true]);
    $position = Position::factory()->create(['department_id' => $department->id, 'is_active' => true]);

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);
    $movementType = MovementType::factory()->create(['is_active' => true]);

    $movement = PersonnelMovement::factory()->create([
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'order_number' => 'ORD-2026-001',
    ]);

    $this->actingAs($user)
        ->get(route('personnel-movements.edit', $movement))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('personnel-movements/edit')
            ->where('movement.id', $movement->id)
        );

    $this->actingAs($user)
        ->patch(route('personnel-movements.update', $movement), [
            'order_number' => 'ORD-2026-002',
            'remarks' => 'Updated movement',
        ])
        ->assertRedirect(route('personnel-movements.show', $movement));

    expect($movement->fresh()->order_number)->toBe('ORD-2026-002');
    expect($movement->fresh()->remarks)->toBe('Updated movement');
});

test('hr staff can delete an employee compensation', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(SalaryGradeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $salaryGrade = SalaryGrade::query()->firstOrFail();

    $compensation = EmployeeCompensation::factory()->create([
        'employee_id' => $employee->id,
        'salary_grade_id' => $salaryGrade->id,
    ]);

    $this->actingAs($user)
        ->delete(route('employee-compensation.destroy', [$employee, $compensation]))
        ->assertRedirect(route('employees.show', $employee));

    expect(EmployeeCompensation::find($compensation->id))->toBeNull();
});

test('hr staff can delete a personnel movement', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $movement = PersonnelMovement::factory()->create();

    $this->actingAs($user)
        ->delete(route('personnel-movements.destroy', $movement))
        ->assertRedirect(route('personnel-movements.index'));

    expect(PersonnelMovement::find($movement->id))->toBeNull();
});

test('employee role cannot delete a personnel movement', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $movement = PersonnelMovement::factory()->create();

    $this->actingAs($user)
        ->delete(route('personnel-movements.destroy', $movement))
        ->assertForbidden();
});
