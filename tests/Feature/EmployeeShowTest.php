<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view an employee profile', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
    ]);

    $this->actingAs($user)
        ->get(route('employees.show', $employee))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/show')
            ->has('employee')
            ->has('users')
            ->has('documents', 0)
            ->has('documentTypes')
            ->has('movements', 0)
            ->where('compensation', null)
            ->where('employee.id', $employee->id)
            ->where('employee.first_name', 'Maria')
            ->where('employee.last_name', 'Santos')
            ->where('employee.department', $employee->department->name)
            ->where('employee.position', $employee->position->name)
        );
});

test('guests are redirected from the employee show page', function () {
    $employee = Employee::factory()->create();

    $this->get(route('employees.show', $employee))
        ->assertRedirect(route('login'));
});

test('employees with only leave.file permission cannot view employee profiles', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('employees.show', $employee))
        ->assertForbidden();
});

test('hr staff can archive an employee', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('employees.archive', $employee))
        ->assertRedirect(route('employees.show', $employee));

    expect($employee->fresh()->is_active)->toBeFalse();
    expect($employee->fresh()->archived_at)->not->toBeNull();
});

test('hr staff can restore an archived employee', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create([
        'is_active' => false,
        'archived_at' => now(),
    ]);

    $this->actingAs($user)
        ->patch(route('employees.restore', $employee))
        ->assertRedirect(route('employees.show', $employee));

    expect($employee->fresh()->is_active)->toBeTrue();
    expect($employee->fresh()->archived_at)->toBeNull();
});

test('employees without manage permission cannot archive', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create(['is_active' => true]);

    $this->actingAs($user)
        ->patch(route('employees.archive', $employee))
        ->assertForbidden();

    expect($employee->fresh()->is_active)->toBeTrue();
});
