<?php

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

// ─── Shared setup ─────────────────────────────────────────────────────────────

function acSetup(): array
{
    (new RoleAndPermissionSeeder)->run();
    $admin = User::factory()->create();
    $admin->assignRole('HR Admin');

    $dept = Department::factory()->create(['name' => 'Finance', 'is_active' => true]);
    $pos = Position::factory()->create(['department_id' => $dept->id, 'is_active' => true]);
    $empType = EmploymentType::factory()->create(['name' => 'Permanent', 'is_active' => true]);
    $empStatus = EmploymentStatus::factory()->create(['name' => 'Permanent', 'is_active' => true]);

    return compact('admin', 'dept', 'pos', 'empType', 'empStatus');
}

// ─── Page access ──────────────────────────────────────────────────────────────

test('guests are redirected away from access control', function () {
    $this->get(route('access-control.index'))
        ->assertRedirect(route('login'));
});

test('non admins cannot visit access control', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)->get(route('access-control.index'))->assertForbidden();
});

test('hr admins can visit access control', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $user = User::factory()->create();
    $user->assignRole('HR Admin');

    $this->actingAs($user)
        ->get(route('access-control.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('access-control/index')
            ->has('users')
            ->has('roles')
            ->has('auditLogs')
        );
});

test('users without employee permission cannot visit employees', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)->get(route('employees.index'))->assertForbidden();
});

// ─── User CRUD ────────────────────────────────────────────────────────────────

test('hr admin can create a new user with a role', function () {
    ['admin' => $admin] = acSetup();

    $this->actingAs($admin)
        ->post(route('access-control.users.store'), [
            'name' => 'New User',
            'email' => 'newuser@lgu.gov.ph',
            'role' => 'HR Staff',
            'password' => 'password123',
        ])
        ->assertRedirect(route('access-control.index'));

    $created = User::where('email', 'newuser@lgu.gov.ph')->first();
    expect($created)->not->toBeNull();
    expect($created->hasRole('HR Staff'))->toBeTrue();
});

test('hr admin can update a user role', function () {
    ['admin' => $admin] = acSetup();
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($admin)
        ->put(route('access-control.users.update', $user), ['role' => 'HR Staff'])
        ->assertRedirect(route('access-control.index'));

    expect($user->fresh()->hasRole('HR Staff'))->toBeTrue();
});

test('hr admin can delete a user', function () {
    ['admin' => $admin] = acSetup();
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($admin)
        ->delete(route('access-control.users.destroy', $user))
        ->assertRedirect(route('access-control.index'));

    expect(User::find($user->id))->toBeNull();
});

test('admin cannot delete their own account', function () {
    ['admin' => $admin] = acSetup();

    $this->actingAs($admin)
        ->delete(route('access-control.users.destroy', $admin))
        ->assertRedirect(route('access-control.index'));

    expect(User::find($admin->id))->not->toBeNull();
});

test('cannot delete the last hr admin', function () {
    ['admin' => $admin] = acSetup();

    $this->actingAs($admin)
        ->delete(route('access-control.users.destroy', $admin))
        ->assertRedirect(route('access-control.index'));

    expect(User::find($admin->id))->not->toBeNull();
});

// ─── Audit Log ────────────────────────────────────────────────────────────────

test('creating an employee writes an audit log', function () {
    ['admin' => $admin, 'dept' => $dept, 'pos' => $pos, 'empType' => $empType, 'empStatus' => $empStatus] = acSetup();
    $this->actingAs($admin);

    Employee::factory()->create([
        'department_id' => $dept->id,
        'position_id' => $pos->id,
        'employment_type_id' => $empType->id,
        'employment_status_id' => $empStatus->id,
    ]);

    expect(AuditLog::where('event', 'created')->where('auditable_type', Employee::class)->exists())->toBeTrue();
});

test('updating an employee writes an audit log', function () {
    ['admin' => $admin, 'dept' => $dept, 'pos' => $pos, 'empType' => $empType, 'empStatus' => $empStatus] = acSetup();
    $this->actingAs($admin);

    $emp = Employee::factory()->create([
        'department_id' => $dept->id,
        'position_id' => $pos->id,
        'employment_type_id' => $empType->id,
        'employment_status_id' => $empStatus->id,
    ]);

    AuditLog::truncate();
    $emp->update(['first_name' => 'ChangedName']);

    expect(AuditLog::where('event', 'updated')->where('auditable_type', Employee::class)->exists())->toBeTrue();
});

test('leave request status change writes an audit log', function () {
    ['admin' => $admin, 'dept' => $dept, 'pos' => $pos, 'empType' => $empType, 'empStatus' => $empStatus] = acSetup();
    $this->actingAs($admin);

    $emp = Employee::factory()->create([
        'department_id' => $dept->id,
        'position_id' => $pos->id,
        'employment_type_id' => $empType->id,
        'employment_status_id' => $empStatus->id,
    ]);
    $leaveType = LeaveType::factory()->create();
    $leave = LeaveRequest::factory()->create([
        'employee_id' => $emp->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    AuditLog::truncate();
    $leave->update(['status' => 'approved']);

    expect(AuditLog::where('event', 'status_changed')->where('auditable_type', LeaveRequest::class)->exists())->toBeTrue();
});

test('role change for a user writes an audit log', function () {
    ['admin' => $admin] = acSetup();
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($admin)
        ->put(route('access-control.users.update', $user), ['role' => 'HR Staff']);

    expect(AuditLog::where('event', 'role_changed')->where('auditable_type', User::class)->exists())->toBeTrue();
});
