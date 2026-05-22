<?php

use App\Models\Employee;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

test('hr staff can export a single employee service record pdf', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('employees.service-record.export', $employee))
        ->assertOk()
        ->assertHeader('Content-Type', 'application/pdf');
});

test('employee role cannot export service record for another employee', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('employees.service-record.export', $employee))
        ->assertForbidden();
});

test('guests are redirected when exporting service record', function () {
    $employee = Employee::factory()->create();

    $this->get(route('employees.service-record.export', $employee))
        ->assertRedirect(route('login'));
});
