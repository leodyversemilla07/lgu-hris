<?php

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Services\LeaveApprovalService;
use Database\Seeders\RoleAndPermissionSeeder;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Admin');
    $this->actingAs($this->user);
});

test('leave approval service records a submitted action', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'draft',
    ]);

    LeaveApprovalService::record(
        leaveRequest: $leaveRequest,
        action: 'submitted',
        actedBy: $this->user->id,
    );

    $this->assertDatabaseHas('leave_approvals', [
        'leave_request_id' => $leaveRequest->id,
        'action' => 'submitted',
        'remarks' => null,
        'acted_by' => $this->user->id,
    ]);
});

test('leave approval service records an approval with remarks', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    LeaveApprovalService::record(
        leaveRequest: $leaveRequest,
        action: 'approved',
        remarks: 'Approved per HR policy.',
        actedBy: $this->user->id,
    );

    $this->assertDatabaseHas('leave_approvals', [
        'leave_request_id' => $leaveRequest->id,
        'action' => 'approved',
        'remarks' => 'Approved per HR policy.',
        'acted_by' => $this->user->id,
    ]);
});

test('leave approval service records a rejection', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    LeaveApprovalService::record(
        leaveRequest: $leaveRequest,
        action: 'rejected',
        remarks: 'Insufficient leave credits.',
        actedBy: $this->user->id,
    );

    $this->assertDatabaseHas('leave_approvals', [
        'leave_request_id' => $leaveRequest->id,
        'action' => 'rejected',
        'remarks' => 'Insufficient leave credits.',
    ]);
});

test('leave approval service records multiple actions on same request', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'draft',
    ]);

    LeaveApprovalService::record($leaveRequest, 'submitted', actedBy: $this->user->id);
    LeaveApprovalService::record($leaveRequest, 'approved', 'Approved.', actedBy: $this->user->id);

    $this->assertDatabaseCount('leave_approvals', 2);
});
