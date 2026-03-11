<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\HrReferenceSeeder;
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
            ->where('employees.0.id', $employee->id)
            ->where('employees.0.employee_number', $employee->employee_number)
            ->where('employees.0.email', $employee->email)
            ->where('employees.0.department', $employee->department->name)
            ->where('employees.0.employment_status', $employee->employmentStatus->name)
            ->where('employees.0.is_active', true)
            ->where('employees.0.position', $employee->position->name)
        );
});

test('guests are redirected away from the employee registry', function () {
    $this->get(route('employees.index'))
        ->assertRedirect(route('login'));
});

test('employee registry returns multiple records for frontend pagination', function () {
    $this->seed([RoleAndPermissionSeeder::class, HrReferenceSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $department = Department::query()->firstOrFail();
    $position = Position::query()->where('department_id', $department->id)->firstOrFail();
    $employmentType = EmploymentType::query()->firstOrFail();
    $employmentStatus = EmploymentStatus::query()->firstOrFail();

    Employee::factory()->count(12)->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
        'employment_type_id' => $employmentType->id,
        'employment_status_id' => $employmentStatus->id,
    ]);

    $this->actingAs($user)
        ->get(route('employees.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('employees/index')
            ->has('employees', 12)
        );
});
