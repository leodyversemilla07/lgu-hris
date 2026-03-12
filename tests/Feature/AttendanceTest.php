<?php

use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\SalaryGrade;
use App\Models\User;
use App\Models\WorkSchedule;
use Database\Seeders\RoleAndPermissionSeeder;
use Database\Seeders\SalaryGradeSeeder;
use Illuminate\Http\UploadedFile;
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

test('department head sees only attendance summaries within managed department', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $managedDepartment = Department::factory()->create();
    $otherDepartment = Department::factory()->create();

    $departmentHead = User::factory()->create([
        'managed_department_id' => $managedDepartment->id,
    ]);
    $departmentHead->assignRole('Department Head');

    $inScopeEmployee = Employee::factory()->create([
        'department_id' => $managedDepartment->id,
        'first_name' => 'Maria',
        'last_name' => 'Santos',
    ]);
    $outOfScopeEmployee = Employee::factory()->create([
        'department_id' => $otherDepartment->id,
        'first_name' => 'Jose',
        'last_name' => 'Cruz',
    ]);

    AttendanceSummary::factory()->create([
        'employee_id' => $inScopeEmployee->id,
        'year' => 2025,
        'month' => 3,
    ]);
    AttendanceSummary::factory()->create([
        'employee_id' => $outOfScopeEmployee->id,
        'year' => 2025,
        'month' => 3,
    ]);

    $this->actingAs($departmentHead)
        ->get(route('attendance.index', ['year' => 2025, 'month' => 3]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('attendance/index')
            ->has('summaries', 1)
            ->has('employees', 1)
            ->where('summaries.0.employee_id', $inScopeEmployee->id)
            ->where('employees.0.value', (string) $inScopeEmployee->id)
            ->where('employees.0.label', 'Santos, Maria')
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

    $schedule = WorkSchedule::factory()->create([
        'name' => 'Regular Office Hours',
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)
        ->get(route('attendance.create'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('attendance/log')
            ->has('employees', 1)
            ->where('employees.0.value', (string) $employee->id)
            ->where('employees.0.work_schedule.name', 'Regular Office Hours')
        );
});

test('department head cannot view the attendance log form', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Department Head');

    $this->actingAs($user)
        ->get(route('attendance.create'))
        ->assertForbidden();
});

test('hr staff can log attendance for an employee using schedule defaults', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)
        ->post(route('attendance.store'), [
            'employee_id' => $employee->id,
            'log_date' => '2025-03-10',
            'time_in' => '08:15',
            'time_out' => '16:45',
            'status' => 'present',
            'minutes_late' => '',
            'minutes_undertime' => '',
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'status' => 'present',
        'minutes_late' => 15,
        'minutes_undertime' => 15,
        'recorded_by' => $user->id,
    ]);
});

test('logging attendance recomputes the monthly summary from schedule-aware values', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)->post(route('attendance.store'), [
        'employee_id' => $employee->id,
        'log_date' => '2025-03-10',
        'status' => 'present',
        'time_in' => '08:15',
        'time_out' => '17:00',
        'minutes_late' => '',
        'minutes_undertime' => '',
    ]);

    $this->assertDatabaseHas('attendance_summaries', [
        'employee_id' => $employee->id,
        'year' => 2025,
        'month' => 3,
        'days_present' => 1,
        'total_late_minutes' => 15,
        'total_undertime_minutes' => 0,
    ]);
});

test('manual late and undertime values override schedule defaults', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)
        ->post(route('attendance.store'), [
            'employee_id' => $employee->id,
            'log_date' => '2025-03-11',
            'time_in' => '08:30',
            'time_out' => '16:00',
            'status' => 'present',
            'minutes_late' => 5,
            'minutes_undertime' => 10,
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'minutes_late' => 5,
        'minutes_undertime' => 10,
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

test('bulk attendance import uses assigned schedule when minute fields are omitted', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)
        ->post(route('attendance.bulk-store'), [
            'rows' => [
                [
                    'employee_id' => $employee->id,
                    'log_date' => '2025-03-12',
                    'status' => 'present',
                    'time_in' => '08:20',
                    'time_out' => '16:50',
                    'minutes_late' => '',
                    'minutes_undertime' => '',
                ],
            ],
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'source' => 'import',
        'minutes_late' => 20,
        'minutes_undertime' => 10,
        'recorded_by' => $user->id,
    ]);

    $this->assertDatabaseHas('attendance_summaries', [
        'employee_id' => $employee->id,
        'year' => 2025,
        'month' => 3,
        'total_late_minutes' => 20,
        'total_undertime_minutes' => 10,
    ]);
});

test('bulk attendance import keeps manual minute values when provided', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'work_schedule_id' => $schedule->id,
    ]);

    $this->actingAs($user)
        ->post(route('attendance.bulk-store'), [
            'rows' => [
                [
                    'employee_id' => $employee->id,
                    'log_date' => '2025-03-13',
                    'status' => 'present',
                    'time_in' => '08:45',
                    'time_out' => '15:30',
                    'minutes_late' => 7,
                    'minutes_undertime' => 12,
                ],
            ],
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'source' => 'import',
        'minutes_late' => 7,
        'minutes_undertime' => 12,
        'recorded_by' => $user->id,
    ]);
});

test('biometric import uses employee number and assigned schedule defaults', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0001',
        'work_schedule_id' => $schedule->id,
    ]);

    $file = UploadedFile::fake()->createWithContent(
        'biometric.csv',
        implode(PHP_EOL, [
            'employee_number,log_date,time_in,time_out,device_name,remarks',
            'EMP-0001,2025-03-14,08:12,16:50,Kiosk A,Morning import',
        ]),
    );

    $this->actingAs($user)
        ->post(route('attendance.biometric-import'), [
            'file' => $file,
            'device_name' => 'Main Hall Terminal',
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'log_date' => '2025-03-14 00:00:00',
        'status' => 'present',
        'source' => 'biometric',
        'minutes_late' => 12,
        'minutes_undertime' => 10,
        'recorded_by' => $user->id,
    ]);

    $this->assertDatabaseHas('attendance_summaries', [
        'employee_id' => $employee->id,
        'year' => 2025,
        'month' => 3,
        'days_present' => 1,
        'total_late_minutes' => 12,
        'total_undertime_minutes' => 10,
    ]);
});

test('biometric import infers half day when only one punch time is available', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $schedule = WorkSchedule::factory()->create([
        'time_in' => '08:00:00',
        'time_out' => '17:00:00',
    ]);
    $employee = Employee::factory()->create([
        'employee_number' => 'EMP-0002',
        'work_schedule_id' => $schedule->id,
    ]);

    $file = UploadedFile::fake()->createWithContent(
        'biometric-half-day.csv',
        implode(PHP_EOL, [
            'employee_number,log_date,time_in',
            'EMP-0002,03/15/2025,08:05',
        ]),
    );

    $this->actingAs($user)
        ->post(route('attendance.biometric-import'), [
            'file' => $file,
        ])
        ->assertRedirect(route('attendance.index'));

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'log_date' => '2025-03-15 00:00:00',
        'status' => 'half_day',
        'source' => 'biometric',
        'minutes_late' => 5,
        'minutes_undertime' => 0,
    ]);

    $this->assertDatabaseHas('attendance_summaries', [
        'employee_id' => $employee->id,
        'year' => 2025,
        'month' => 3,
        'days_present' => 1,
        'total_late_minutes' => 5,
    ]);
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
