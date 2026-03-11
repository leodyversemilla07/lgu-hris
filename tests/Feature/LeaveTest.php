<?php

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Database\Seeders\LeaveTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the leave index', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
    ]);
    $leaveType = LeaveType::where('code', 'VL')->first();

    LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($user)
        ->get(route('leave.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/index')
            ->has('leaveRequests', 1)
            ->has('leaveTypes')
            ->where('leaveRequests.0.employee_id', $employee->id)
            ->where('leaveRequests.0.employee_name', 'Santos, Maria')
            ->where('leaveRequests.0.leave_type', $leaveType->name)
            ->where('leaveRequests.0.status', 'submitted')
            ->where('canApprove', true)
        );
});

test('employee can view the leave index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('leave.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/index')
            ->where('canApprove', false)
        );
});

test('leave index returns multiple requests for frontend pagination', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->firstOrFail();

    LeaveRequest::factory()->count(12)->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($user)
        ->get(route('leave.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/index')
            ->has('leaveRequests', 12)
        );
});

test('hr staff can view the leave create page', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create([
        'first_name' => 'Ana',
        'last_name' => 'Reyes',
        'employee_number' => 'EMP-1007',
        'is_active' => true,
    ]);
    $leaveType = LeaveType::where('code', 'VL')->firstOrFail();

    LeaveBalance::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => now()->year,
        'total_days' => 15,
        'used_days' => 2,
    ]);

    $this->actingAs($user)
        ->get(route('leave.create', ['employee_id' => $employee->id]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/create')
            ->has('employees.0.value')
            ->has('employees.0.label')
            ->has('leaveTypes.0.value')
            ->has('leaveTypes.0.label')
            ->has('balances')
            ->where('year', now()->year)
            ->where('preselectedEmployeeId', (string) $employee->id)
        );
});

test('guests are redirected from the leave index', function () {
    $this->get(route('leave.index'))
        ->assertRedirect(route('login'));
});

test('hr staff can file a leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->first();

    $this->actingAs($user)
        ->post(route('leave.store'), [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-04-01',
            'end_date' => '2026-04-03',
            'days_requested' => 3,
            'reason' => 'Family vacation',
        ])
        ->assertRedirect(route('leave.index'));

    $this->assertDatabaseHas('leave_requests', [
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'days_requested' => 3,
        'status' => 'submitted',
    ]);
});

test('employee can view their leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->first();

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
    ]);

    $this->actingAs($user)
        ->get(route('leave.show', $leaveRequest))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/show')
            ->has('leaveRequest')
            ->where('leaveRequest.id', $leaveRequest->id)
            ->where('leaveRequest.status', 'submitted')
            ->where('canApprove', false)
            ->where('canCancel', true)
        );
});

test('hr staff can view a leave request with approval actions', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $leaveType = LeaveType::where('code', 'VL')->first();
    $leaveRequest = LeaveRequest::factory()->create([
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($user)
        ->get(route('leave.show', $leaveRequest))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/show')
            ->where('leaveRequest.id', $leaveRequest->id)
            ->where('canApprove', true)
            ->where('canCancel', true)
        );
});

test('hr staff can approve a leave request and balance is deducted', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $approver = User::factory()->create();
    $approver->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->first();

    LeaveBalance::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => 2026,
        'total_days' => 15,
        'used_days' => 0,
    ]);

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'start_date' => '2026-04-01',
        'end_date' => '2026-04-03',
        'days_requested' => 3,
        'status' => 'submitted',
    ]);

    $this->actingAs($approver)
        ->post(route('leave.approve', $leaveRequest), [
            'action' => 'approved',
            'remarks' => 'Approved.',
        ])
        ->assertRedirect(route('leave.show', $leaveRequest));

    expect($leaveRequest->fresh()->status)->toBe('approved');
    expect($leaveRequest->fresh()->actioned_by)->toBe($approver->id);

    $balance = LeaveBalance::query()
        ->where('employee_id', $employee->id)
        ->where('leave_type_id', $leaveType->id)
        ->first();
    expect((float) $balance->used_days)->toBe(3.0);
});

test('hr staff can reject a leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $approver = User::factory()->create();
    $approver->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->first();

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($approver)
        ->post(route('leave.approve', $leaveRequest), [
            'action' => 'rejected',
            'remarks' => 'Insufficient staffing.',
        ])
        ->assertRedirect(route('leave.show', $leaveRequest));

    expect($leaveRequest->fresh()->status)->toBe('rejected');
    expect($leaveRequest->fresh()->remarks)->toBe('Insufficient staffing.');
});

test('department head can approve a leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $deptHead = User::factory()->create();
    $deptHead->assignRole('Department Head');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->first();

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($deptHead)
        ->post(route('leave.approve', $leaveRequest), [
            'action' => 'approved',
        ])
        ->assertRedirect(route('leave.show', $leaveRequest));

    expect($leaveRequest->fresh()->status)->toBe('approved');
});

test('employee role cannot approve a leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $leaveType = LeaveType::where('code', 'VL')->first();
    $leaveRequest = LeaveRequest::factory()->create([
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($user)
        ->post(route('leave.approve', $leaveRequest), [
            'action' => 'approved',
        ])
        ->assertForbidden();
});

test('employee can cancel a submitted leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $leaveType = LeaveType::where('code', 'VL')->first();
    $leaveRequest = LeaveRequest::factory()->create([
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($user)
        ->patch(route('leave.cancel', $leaveRequest))
        ->assertRedirect(route('leave.show', $leaveRequest));

    expect($leaveRequest->fresh()->status)->toBe('cancelled');
});

test('cannot approve an already-actioned leave request', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $approver = User::factory()->create();
    $approver->assignRole('HR Staff');

    $leaveType = LeaveType::where('code', 'VL')->first();
    $leaveRequest = LeaveRequest::factory()->create([
        'leave_type_id' => $leaveType->id,
        'status' => 'approved',
    ]);

    $this->actingAs($approver)
        ->post(route('leave.approve', $leaveRequest), [
            'action' => 'approved',
        ])
        ->assertStatus(422);
});

test('hr staff can view leave balances', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    Employee::factory()->create([
        'is_active' => true,
    ]);

    $this->actingAs($user)
        ->get(route('leave-balances.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('leave/balances')
            ->has('rows.0.employee_id')
            ->has('rows.0.leave_type_id')
            ->has('leaveTypes.0.value')
            ->has('leaveTypes.0.label')
            ->has('year')
        );
});

test('hr staff can upsert a leave balance', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(LeaveTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::where('code', 'VL')->first();

    $this->actingAs($user)
        ->post(route('leave-balances.upsert'), [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'year' => 2026,
            'total_days' => 15,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('leave_balances', [
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'year' => 2026,
        'total_days' => 15,
    ]);
});
