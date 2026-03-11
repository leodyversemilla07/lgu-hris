<?php

use App\Models\AttendanceSummary;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected to the login page', function () {
    $response = $this->get(route('dashboard'));
    $response->assertRedirect(route('login'));
});

test('hr staff receives the organization dashboard payload', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');
    $this->actingAs($user);

    $this->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboardType', 'organization')
            ->where('title', 'Overview')
            ->has('cards', 4)
            ->has('auth.user')
            ->where('auth.user.primary_role', 'HR Staff')
            ->where('auth.user.roles', ['HR Staff'])
            ->where('auth.user.permissions', [
                'employees.view',
                'employees.manage',
                'documents.view',
                'documents.manage',
                'leave.file',
                'leave.approve',
                'movements.view',
                'movements.manage',
                'attendance.view',
                'attendance.manage',
                'reports.view',
                'reports.export',
            ])
        );
});

test('department head receives a department-scoped dashboard payload', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $department = Department::factory()->create([
        'name' => 'Human Resource Department',
    ]);

    $user = User::factory()->create([
        'managed_department_id' => $department->id,
    ]);
    $user->assignRole('Department Head');

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'is_active' => true,
        'first_name' => 'Mario',
        'last_name' => 'Ramos',
    ]);

    $leaveType = LeaveType::factory()->create([
        'name' => 'Vacation Leave',
    ]);

    LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboardType', 'department')
            ->where('title', 'Human Resource Department')
            ->where('cards.0.value', '1')
            ->where('cards.1.value', '1')
            ->where('recentRecords.rows.0.record', 'Ramos, Mario')
            ->where('recentRecords.rows.0.type', 'Vacation Leave')
        );
});

test('employee receives a personal dashboard payload', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create([
        'user_id' => $user->id,
    ]);

    $leaveType = LeaveType::factory()->create([
        'name' => 'Sick Leave',
    ]);

    LeaveBalance::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => now()->year,
        'total_days' => 15,
        'used_days' => 3,
    ]);

    LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    AttendanceSummary::factory()->create([
        'employee_id' => $employee->id,
        'year' => now()->year,
        'month' => now()->month,
        'days_present' => 18,
        'days_absent' => 1,
        'days_leave' => 1,
        'total_late_minutes' => 12,
    ]);

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboardType', 'employee')
            ->where('title', 'My workspace')
            ->where('cards.0.value', '12.0')
            ->where('cards.1.value', '1')
            ->where('recentRecords.rows.0.record', 'Sick Leave')
            ->where('auth.user.primary_role', 'Employee')
            ->where('auth.user.roles', ['Employee'])
            ->where('auth.user.permissions', ['leave.file'])
        );
});

test('authenticated users can visit the employee workspace shell', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
        );
});

test('employee workspace requires authentication', function () {
    $this->get(route('employees.index'))
        ->assertRedirect(route('login'));
});
