<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\MovementTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the movements index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('personnel-movements.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('personnel-movements/index')
            ->has('movements')
            ->has('employees')
            ->has('movementTypes')
        );
});

test('guests are redirected from the movements index', function () {
    $this->get(route('personnel-movements.index'))
        ->assertRedirect(route('login'));
});

test('employee role cannot access movements index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('personnel-movements.index'))
        ->assertForbidden();
});

test('hr staff can view the create movement form', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('personnel-movements.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('personnel-movements/create')
            ->has('employees')
            ->has('movementTypes')
            ->has('departments')
            ->has('positions')
            ->has('employmentStatuses')
        );
});

test('hr staff can record a personnel movement', function () {
    $this->seed([RoleAndPermissionSeeder::class, MovementTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $movementType = MovementType::query()->first();

    $this->actingAs($user)
        ->post(route('personnel-movements.store'), [
            'employee_id' => $employee->id,
            'movement_type_id' => $movementType->id,
            'effective_date' => '2025-01-15',
            'order_number' => 'ORD-001-2025',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('personnel_movements', [
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'order_number' => 'ORD-001-2025',
        'recorded_by' => $user->id,
    ]);
});

test('movement stores from/to department and position', function () {
    $this->seed([RoleAndPermissionSeeder::class, MovementTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $movementType = MovementType::query()->first();
    $fromDept = Department::factory()->create();
    $toDept = Department::factory()->create();
    $fromPos = Position::factory()->create();
    $toPos = Position::factory()->create();

    $this->actingAs($user)
        ->post(route('personnel-movements.store'), [
            'employee_id' => $employee->id,
            'movement_type_id' => $movementType->id,
            'effective_date' => '2025-06-01',
            'from_department_id' => $fromDept->id,
            'to_department_id' => $toDept->id,
            'from_position_id' => $fromPos->id,
            'to_position_id' => $toPos->id,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('personnel_movements', [
        'employee_id' => $employee->id,
        'from_department_id' => $fromDept->id,
        'to_department_id' => $toDept->id,
        'from_position_id' => $fromPos->id,
        'to_position_id' => $toPos->id,
    ]);
});

test('hr staff can view a movement detail', function () {
    $this->seed([RoleAndPermissionSeeder::class, MovementTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $movementType = MovementType::query()->first();
    $movement = PersonnelMovement::factory()->create([
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'recorded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('personnel-movements.show', $movement))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('personnel-movements/show')
            ->has('movement')
            ->where('movement.id', $movement->id)
        );
});

test('movement appears in the employee show page movements tab', function () {
    $this->seed([RoleAndPermissionSeeder::class, MovementTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $movementType = MovementType::query()->first();
    PersonnelMovement::factory()->create([
        'employee_id' => $employee->id,
        'movement_type_id' => $movementType->id,
        'recorded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('employees.show', $employee))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/show')
            ->has('movements', 1)
        );
});

test('store validates required fields', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->post(route('personnel-movements.store'), [])
        ->assertSessionHasErrors(['employee_id', 'movement_type_id', 'effective_date']);
});

test('employee role cannot access the create movement form', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('personnel-movements.create'))
        ->assertForbidden();
});
