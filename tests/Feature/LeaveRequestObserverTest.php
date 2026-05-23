<?php

use App\Models\AuditLog;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Admin');
    $this->actingAs($this->user);
});

test('leave request observer creates audit log on creation', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => LeaveRequest::class,
        'auditable_id' => $leaveRequest->id,
        'event' => 'created',
        'description' => 'Leave request filed',
    ]);
});

test('leave request observer logs status change on update', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $leaveRequest->update([
        'status' => 'approved',
        'actioned_by' => $this->user->id,
        'actioned_at' => now(),
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'auditable_type' => LeaveRequest::class,
        'auditable_id' => $leaveRequest->id,
        'event' => 'status_changed',
        'description' => 'Leave request status changed from submitted to approved',
    ]);
});

test('leave request observer does not log on non-status updates', function () {
    $employee = Employee::factory()->create();
    $leaveType = LeaveType::factory()->create();

    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'draft',
    ]);

    // Update a non-status field
    $leaveRequest->updateQuietly(['reason' => 'Updated reason']);

    $leaveRequest->update(['reason' => 'Updated reason']);

    // Only the created audit log should exist
    $auditLogsForStatusChange = AuditLog::where('auditable_id', $leaveRequest->id)
        ->where('auditable_type', LeaveRequest::class)
        ->where('event', 'status_changed')
        ->count();

    expect($auditLogsForStatusChange)->toBe(0);
});
