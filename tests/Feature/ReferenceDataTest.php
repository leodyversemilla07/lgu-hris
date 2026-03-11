<?php

use App\Models\Department;
use App\Models\DocumentType;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from reference data', function () {
    $this->get(route('reference-data.index'))
        ->assertRedirect(route('login'));
});

test('users without reference data permission cannot visit reference data', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('reference-data.index'))
        ->assertForbidden();
});

test('hr admins can visit reference data and receive the expected catalogs', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Admin');

    $department = Department::factory()->create([
        'name' => 'Finance',
        'code' => 'FIN',
        'is_active' => true,
    ]);

    Position::factory()->create([
        'name' => 'Accountant I',
        'code' => 'ACC-I',
        'department_id' => $department->id,
        'is_active' => true,
    ]);

    EmploymentType::factory()->create([
        'name' => 'Permanent',
        'code' => 'PERM',
        'is_active' => true,
    ]);

    EmploymentStatus::factory()->create([
        'name' => 'Active',
        'code' => 'ACT',
        'is_active' => true,
    ]);

    LeaveType::factory()->create([
        'name' => 'Vacation Leave',
        'code' => 'VL',
        'max_days_per_year' => 15,
        'requires_approval' => true,
        'is_active' => true,
    ]);

    DocumentType::factory()->create([
        'name' => 'Service Record',
        'code' => 'SR',
        'is_confidential' => false,
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('reference-data.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('reference-data/index')
            ->has('departments', 1)
            ->has('positions', 1)
            ->has('employmentTypes', 1)
            ->has('employmentStatuses', 1)
            ->has('leaveTypes', 1)
            ->has('documentTypes', 1)
            ->where('departments.0.name', 'Finance')
            ->where('positions.0.department_name', 'Finance')
            ->where('leaveTypes.0.name', 'Vacation Leave')
            ->where('documentTypes.0.name', 'Service Record')
        );
});
