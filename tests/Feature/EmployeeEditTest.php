<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\User;
use App\Models\WorkSchedule;
use Database\Seeders\HrReferenceSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the employee edit page', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $department = Department::query()->firstOrFail();
    $position = Position::query()->where('department_id', $department->id)->firstOrFail();
    $employmentType = EmploymentType::query()->firstOrFail();
    $employmentStatus = EmploymentStatus::query()->firstOrFail();
    $workSchedule = WorkSchedule::factory()->create();

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'work_schedule_id' => $workSchedule->id,
    ]);

    $this->actingAs($user)
        ->get(route('employees.edit', $employee))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/edit')
            ->has('employee')
            ->has('departments')
            ->has('positions')
            ->has('employmentTypes')
            ->has('employmentStatuses')
            ->has('workSchedules')
            ->where('employee.id', $employee->id)
            ->where('employee.employee_number', $employee->employee_number)
            ->where('employee.department_id', (string) $department->id)
            ->where('employee.position_id', (string) $position->id)
        );
});

test('hr staff can update an employee record', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $department = Department::query()->firstOrFail();
    $position = Position::query()->where('department_id', $department->id)->firstOrFail();
    $employmentType = EmploymentType::query()->firstOrFail();
    $employmentStatus = EmploymentStatus::query()->firstOrFail();
    $workSchedule = WorkSchedule::factory()->create([
        'name' => 'Regular 8-5',
    ]);
    $updatedWorkSchedule = WorkSchedule::factory()->create([
        'name' => 'Shifting Evening',
    ]);

    $employee = Employee::factory()->create([
        'first_name' => 'Juan',
        'last_name' => 'Cruz',
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'work_schedule_id' => $workSchedule->id,
    ]);

    $this->actingAs($user)
        ->put(route('employees.update', $employee), [
            'employee_number' => $employee->employee_number,
            'first_name' => 'Juan',
            'middle_name' => 'M.',
            'last_name' => 'dela Cruz',
            'suffix' => null,
            'email' => 'juan.m.delacruz@example.com',
            'phone' => '09171234567',
            'birth_date' => '1992-04-12',
            'hired_at' => $employee->hired_at->format('Y-m-d'),
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employment_type_id' => $employmentType->id,
            'employment_status_id' => $employmentStatus->id,
            'work_schedule_id' => $updatedWorkSchedule->id,
            'is_active' => true,
        ])
        ->assertRedirect(route('employees.show', $employee));

    $this->assertDatabaseHas('employees', [
        'id' => $employee->id,
        'last_name' => 'dela Cruz',
        'middle_name' => 'M.',
        'work_schedule_id' => $updatedWorkSchedule->id,
    ]);

    $history = EmployeeHistory::query()
        ->where('employee_id', $employee->id)
        ->where('event_type', 'profile_updated')
        ->latest('id')
        ->first();

    expect($history)->not->toBeNull();
    expect($history->before_values['work_schedule'])->toBe($workSchedule->name);
    expect($history->after_values['work_schedule'])->toBe($updatedWorkSchedule->name);
});

test('employee update validates required fields', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->from(route('employees.edit', $employee))
        ->put(route('employees.update', $employee), [])
        ->assertRedirect(route('employees.edit', $employee))
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

test('employee update rejects duplicate employee number from another record', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $existing = Employee::factory()->create(['employee_number' => 'EMP-9999']);
    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->from(route('employees.edit', $employee))
        ->put(route('employees.update', $employee), [
            'employee_number' => 'EMP-9999',
            'first_name' => $employee->first_name,
            'last_name' => $employee->last_name,
            'hired_at' => $employee->hired_at->format('Y-m-d'),
            'department_id' => $employee->department_id,
            'position_id' => $employee->position_id,
            'employment_type_id' => $employee->employment_type_id,
            'employment_status_id' => $employee->employment_status_id,
            'is_active' => true,
        ])
        ->assertSessionHasErrors('employee_number');
});

test('employee update accepts same employee number for same record', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $department = Department::query()->firstOrFail();
    $position = Position::query()->where('department_id', $department->id)->firstOrFail();
    $employmentType = EmploymentType::query()->firstOrFail();
    $employmentStatus = EmploymentStatus::query()->firstOrFail();
    $workSchedule = WorkSchedule::factory()->create();

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
        'work_schedule_id' => $workSchedule->id,
    ]);

    $this->actingAs($user)
        ->put(route('employees.update', $employee), [
            'employee_number' => $employee->employee_number,
            'first_name' => $employee->first_name,
            'last_name' => $employee->last_name,
            'hired_at' => $employee->hired_at->format('Y-m-d'),
            'department_id' => $department->id,
            'position_id' => $position->id,
            'employment_type_id' => $employmentType->id,
            'employment_status_id' => $employmentStatus->id,
            'is_active' => true,
        ])
        ->assertRedirect(route('employees.show', $employee));
});

test('users without employee manage permission cannot update employees', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();

    $this->actingAs($user)
        ->put(route('employees.update', $employee), [
            'employee_number' => $employee->employee_number,
            'first_name' => 'Changed',
            'last_name' => $employee->last_name,
            'hired_at' => $employee->hired_at->format('Y-m-d'),
            'department_id' => $employee->department_id,
            'position_id' => $employee->position_id,
            'employment_type_id' => $employee->employment_type_id,
            'employment_status_id' => $employee->employment_status_id,
            'is_active' => true,
        ])
        ->assertForbidden();
});
