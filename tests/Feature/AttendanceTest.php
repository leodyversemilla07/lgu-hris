<?php

use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\SalaryGrade;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\SalaryGradeSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the attendance index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('attendance.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('attendance/index')
            ->has('summaries')
            ->has('employees')
            ->has('filters')
        );
});

test('guests are redirected from the attendance index', function () {
    $this->get(route('attendance.index'))
        ->assertRedirect(route('login'));
});

test('employee role cannot view attendance index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('attendance.index'))
        ->assertForbidden();
});

test('hr staff can view the attendance log form', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('attendance.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('attendance/log')
            ->has('employees')
        );
});

test('hr staff can log attendance for an employee', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->post(route('attendance.store'), [
            'employee_id' => $employee->id,
            'log_date' => '2025-03-10',
            'time_in' => '08:00',
            'time_out' => '17:00',
            'status' => 'present',
            'minutes_late' => 0,
            'minutes_undertime' => 0,
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'status' => 'present',
        'recorded_by' => $user->id,
    ]);
});

test('logging attendance recomputes the monthly summary', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    $this->actingAs($user)->post(route('attendance.store'), [
        'employee_id' => $employee->id,
        'log_date' => '2025-03-10',
        'status' => 'present',
        'minutes_late' => 15,
        'minutes_undertime' => 0,
    ]);

    $this->assertDatabaseHas('attendance_summaries', [
        'employee_id' => $employee->id,
        'year' => 2025,
        'month' => 3,
        'days_present' => 1,
        'total_late_minutes' => 15,
    ]);
});

test('duplicate attendance log for same employee and date is rejected', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    AttendanceLog::factory()->create([
        'employee_id' => $employee->id,
        'log_date' => '2025-03-10',
        'recorded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->post(route('attendance.store'), [
            'employee_id' => $employee->id,
            'log_date' => '2025-03-10',
            'status' => 'present',
        ])
        ->assertSessionHasErrors(['log_date']);
});

test('attendance index filters by year and month', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    AttendanceSummary::factory()->create([
        'employee_id' => $employee->id,
        'year' => 2024,
        'month' => 6,
    ]);

    $this->actingAs($user)
        ->get(route('attendance.index', ['year' => 2024, 'month' => 6]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('summaries', 1)
            ->where('filters.year', 2024)
            ->where('filters.month', 6)
        );
});

test('hr staff can view compensation create form for employee', function () {
    $this->seed([RoleAndPermissionSeeder::class, SalaryGradeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->get(route('employee-compensation.create', $employee))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/compensation')
            ->has('salaryGrades')
            ->has('employee')
            ->where('employee.id', $employee->id)
            ->where('current', null)
        );
});

test('hr staff can assign a salary grade to employee', function () {
    $this->seed([RoleAndPermissionSeeder::class, SalaryGradeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $sg = SalaryGrade::query()->where('grade', 11)->where('step', 1)->first();

    $this->actingAs($user)
        ->post(route('employee-compensation.store', $employee), [
            'employee_id' => $employee->id,
            'salary_grade_id' => $sg->id,
            'effective_date' => '2025-01-01',
            'allowances' => 2000,
            'deductions' => 500,
        ])
        ->assertRedirect(route('employees.show', $employee));

    $this->assertDatabaseHas('employee_compensation', [
        'employee_id' => $employee->id,
        'salary_grade_id' => $sg->id,
        'allowances' => 2000,
    ]);
});

test('compensation appears on employee show page', function () {
    $this->seed([RoleAndPermissionSeeder::class, SalaryGradeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $sg = SalaryGrade::query()->where('grade', 11)->where('step', 1)->first();

    EmployeeCompensation::factory()->create([
        'employee_id' => $employee->id,
        'salary_grade_id' => $sg->id,
        'recorded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('employees.show', $employee))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('compensation')
            ->whereNot('compensation', null)
        );
});
