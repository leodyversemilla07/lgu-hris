<?php

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view leave balances', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $leaveType = LeaveType::factory()->create(['is_active' => true]);
    $employee = Employee::factory()->create();

    LeaveBalance::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'total_days' => 15,
        'used_days' => 3,
    ]);

    $this->actingAs($user)
        ->get(route('leave-balances.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/balances')
            ->has('rows')
            ->has('leaveTypes')
            ->where('year', now()->year)
        );
});

test('employee role cannot access leave balances', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('leave-balances.index'))
        ->assertForbidden();
});

test('guests are redirected from leave balances', function () {
    $this->get(route('leave-balances.index'))
        ->assertRedirect(route('login'));
});

test('hr staff can upsert a leave balance', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create(['is_active' => true]);
    $year = now()->year;

    $this->actingAs($user)
        ->post(route('leave-balances.upsert'), [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => $year,
            'total_days' => 20,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('leave_balances', [
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => $year,
        'total_days' => 20,
    ]);
});

test('upserting an existing balance updates the total days', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create(['is_active' => true]);
    $year = now()->year;

    LeaveBalance::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => $year,
        'total_days' => 15,
        'used_days' => 0,
    ]);

    $this->actingAs($user)
        ->post(route('leave-balances.upsert'), [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => $year,
            'total_days' => 30,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('leave_balances', [
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => $year,
        'total_days' => 30,
    ]);
});
