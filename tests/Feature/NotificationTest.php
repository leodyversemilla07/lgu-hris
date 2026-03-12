<?php

use App\Mail\LeaveRequestActioned;
use App\Mail\LeaveRequestSubmitted;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Notifications\LeaveRequestActionedNotification;
use App\Notifications\LeaveRequestSubmittedNotification;
use Database\Seeders\LeaveTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;

test('leave submission creates a database notification for approvers', function () {
    $this->seed([RoleAndPermissionSeeder::class, LeaveTypeSeeder::class]);
    Mail::fake();

    $approver = User::factory()->create();
    $approver->assignRole('HR Staff');

    $requestor = User::factory()->create();
    $requestor->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::query()->where('code', 'VL')->firstOrFail();

    $this->actingAs($requestor)
        ->post(route('leave.store'), [
            'employee_id' => $employee->id,
            'leave_type_id' => $leaveType->id,
            'start_date' => '2026-04-01',
            'end_date' => '2026-04-03',
            'days_requested' => 3,
            'reason' => 'Vacation',
        ])
        ->assertRedirect(route('leave.index'));

    $approver->refresh();

    expect($approver->notifications)->toHaveCount(1);
    expect($approver->notifications->first()->type)->toBe(LeaveRequestSubmittedNotification::class);
    expect($approver->notifications->first()->data['category'])->toBe('leave');

    Mail::assertQueued(LeaveRequestSubmitted::class);
});

test('leave approval creates a database notification for the employee user', function () {
    $this->seed([RoleAndPermissionSeeder::class, LeaveTypeSeeder::class]);
    Mail::fake();

    $approver = User::factory()->create();
    $approver->assignRole('HR Staff');

    $employeeUser = User::factory()->create();
    $employeeUser->assignRole('Employee');

    $employee = Employee::factory()->create([
        'user_id' => $employeeUser->id,
    ]);

    $leaveType = LeaveType::query()->where('code', 'VL')->firstOrFail();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
    ]);

    $this->actingAs($approver)
        ->post(route('leave.approve', $leaveRequest), [
            'action' => 'approved',
            'remarks' => 'Approved by HR',
        ])
        ->assertRedirect(route('leave.show', $leaveRequest));

    $employeeUser->refresh();

    expect($employeeUser->notifications)->toHaveCount(1);
    expect($employeeUser->notifications->first()->type)->toBe(LeaveRequestActionedNotification::class);
    expect($employeeUser->notifications->first()->data['status'])->toBe('approved');

    Mail::assertQueued(LeaveRequestActioned::class);
});

test('shared inertia props include unread notifications', function () {
    $this->seed([RoleAndPermissionSeeder::class, LeaveTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::query()->where('code', 'VL')->firstOrFail();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
    ]);

    $user->notify(new LeaveRequestSubmittedNotification($leaveRequest));

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('notifications.recent', 1)
            ->where('notifications.unread_count', 1)
        );
});

test('user can mark one notification as read', function () {
    $this->seed([RoleAndPermissionSeeder::class, LeaveTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::query()->where('code', 'VL')->firstOrFail();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
    ]);

    $user->notify(new LeaveRequestSubmittedNotification($leaveRequest));
    $notification = $user->notifications()->latest()->firstOrFail();

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->patch(route('notifications.read', $notification->id))
        ->assertRedirect(route('dashboard'));

    expect($notification->fresh()->read_at)->not->toBeNull();
});

test('user can mark all notifications as read', function () {
    $this->seed([RoleAndPermissionSeeder::class, LeaveTypeSeeder::class]);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $leaveType = LeaveType::query()->where('code', 'VL')->firstOrFail();
    $leaveRequest = LeaveRequest::factory()->create([
        'employee_id' => $employee->id,
        'leave_type_id' => $leaveType->id,
    ]);

    $user->notify(new LeaveRequestSubmittedNotification($leaveRequest));
    $user->notify(new LeaveRequestActionedNotification($leaveRequest));

    $this->actingAs($user)
        ->from(route('dashboard'))
        ->patch(route('notifications.read-all'))
        ->assertRedirect(route('dashboard'));

    expect($user->fresh()->unreadNotifications)->toHaveCount(0);
});
