<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the employee registry', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-1001',
        'first_name' => 'Maria',
        'last_name' => 'Santos',
    ]);

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->has('employees', 1)
            ->where('employees.0.employee_number', $employee->employee_number)
            ->where('employees.0.department', $employee->department->name)
            ->where('employees.0.position', $employee->position->name)
        );
});

test('guests are redirected away from the employee registry', function () {
    $this->get(route('employees.index'))
        ->assertRedirect(route('login'));
});
