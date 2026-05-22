<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

test('hr staff can export a single employee dtr pdf', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('employees.dtr.export', $employee))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('employee role cannot export dtr for another employee', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('employees.dtr.export', $employee))
        ->assertForbidden();
});

test('guests are redirected when exporting dtr', function () {
    $employee = Employee::factory()->create();

    $this->get(route('employees.dtr.export', $employee))
        ->assertRedirect(route('login'));
});
