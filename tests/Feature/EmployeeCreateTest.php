<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\HrReferenceSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the employee create page', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('employees.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/create')
            ->has('departments.0.value')
            ->has('departments.0.label')
            ->has('positions.0.value')
            ->has('positions.0.label')
            ->has('employmentTypes.0.value')
            ->has('employmentTypes.0.label')
            ->has('employmentStatuses.0.value')
            ->has('employmentStatuses.0.label')
        );
});

test('hr staff can create an employee record', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $department = Department::query()->firstOrFail();
    $position = Position::query()->where('department_id', $department->id)->firstOrFail();
    $employmentType = EmploymentType::query()->firstOrFail();
    $employmentStatus = EmploymentStatus::query()->firstOrFail();

    $this->actingAs($user)
        ->post(route('employees.store'), [
            'employee_number' => 'EMP-2001',
            'first_name' => 'Juan',
            'middle_name' => 'Dela',
            'last_name' => 'Cruz',
            'suffix' => null,
            'email' => 'juan.delacruz@example.com',
            'phone' => '09171234567',
            'birth_date' => '1992-04-12',
            'hired_at' => '2024-01-15',
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employment_type_id' => $employmentType->id,
            'employment_status_id' => $employmentStatus->id,
            'is_active' => true,
        ])
        ->assertRedirect(route('employees.index'));

    $this->assertDatabaseHas('employees', [
        'employee_number' => 'EMP-2001',
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);
});

test('employee creation validates required fields', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->from(route('employees.create'))
        ->post(route('employees.store'), [])
        ->assertRedirect(route('employees.create'))
        ->assertSessionHasErrors([
            'employee_number',
            'first_name',
            'last_name',
            'hired_at',
            'department_id',
            'position_id',
            'employment_type_id',
            'employment_status_id',
        ]);
});

test('users without employee manage permission cannot create employees', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $department = Department::query()->firstOrFail();
    $position = Position::query()->where('department_id', $department->id)->firstOrFail();
    $employmentType = EmploymentType::query()->firstOrFail();
    $employmentStatus = EmploymentStatus::query()->firstOrFail();

    $this->actingAs($user)
        ->post(route('employees.store'), [
            'employee_number' => 'EMP-9001',
            'first_name' => 'Blocked',
            'last_name' => 'User',
            'hired_at' => '2024-01-01',
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employment_type_id' => $employmentType->id,
            'employment_status_id' => $employmentStatus->id,
            'is_active' => true,
        ])
        ->assertForbidden();

    expect(Employee::query()->where('employee_number', 'EMP-9001')->exists())->toBeFalse();
});
