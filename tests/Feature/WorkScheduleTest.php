<?php

use App\Models\Employee;
use App\Models\User;
use App\Models\WorkSchedule;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the work schedule index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'name' => 'Regular Office Hours',
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    Employee::factory()->create([
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)
        ->get(route('work-schedules.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('work-schedules/index')
            ->has('schedules', 1)
            ->where('schedules.0.name', 'Regular Office Hours')
            ->where('schedules.0.employees_count', 1)
        );
});

test('department heads cannot manage work schedules', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Department Head');

    $this->actingAs($user)
        ->get(route('work-schedules.index'))
        ->assertForbidden();
});

test('hr staff can create a work schedule', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->post(route('work-schedules.store'), [
            'name' => 'Compressed Weekday Shift',
            'time_in' => '07:30',
            'time_out' => '16:30',
            'break_minutes' => 45,
            'work_hours_per_day' => 8,
        ])
        ->assertRedirect(route('work-schedules.index'));

    $this->assertDatabaseHas('work_schedules', [
        'name' => 'Compressed Weekday Shift',
        'time_in' => '07:30:00',
        'time_out' => '16:30:00',
        'break_minutes' => 45,
        'work_hours_per_day' => 8.00,
        'is_active' => true,
    ]);
});

test('hr staff can update a work schedule', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'name' => 'Regular 8-5',
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
        'break_minutes' => 60,
        'work_hours_per_day' => 8.00,
    ]);

    $this->actingAs($user)
        ->put(route('work-schedules.update', $schedule), [
            'name' => 'Regular 8-5 Core Hours',
            'time_in' => '08:30',
            'time_out' => '17:30',
            'break_minutes' => 60,
            'work_hours_per_day' => 8,
            'is_active' => true,
        ])
        ->assertRedirect(route('work-schedules.index'));

    $this->assertDatabaseHas('work_schedules', [
        'id' => $schedule->id,
        'name' => 'Regular 8-5 Core Hours',
        'time_in' => '08:30:00',
        'time_out' => '17:30:00',
    ]);
});

test('hr staff can deactivate a work schedule', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->delete(route('work-schedules.destroy', $schedule))
        ->assertRedirect(route('work-schedules.index'));

    $this->assertDatabaseHas('work_schedules', [
        'id' => $schedule->id,
        'is_active' => false,
    ]);
});
