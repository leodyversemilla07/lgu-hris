<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\User;

class LeaveRequestPolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('HR Admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('leave.file') || $user->can('leave.approve');
    }

    public function view(User $user, LeaveRequest $leaveRequest): bool
    {
        if ($user->hasRole('HR Staff')) {
            return $user->can('leave.file') || $user->can('leave.approve');
        }

        if ($user->hasRole('Department Head')) {
            return ! $leaveRequest->isDraft()
                && $user->can('leave.approve')
                && $this->managesLeaveRequest($user, $leaveRequest);
        }

        return $user->can('leave.file') && $this->ownsLeaveRequest($user, $leaveRequest);
    }

    public function create(User $user): bool
    {
        return $user->can('leave.file');
    }

    public function submit(User $user, LeaveRequest $leaveRequest): bool
    {
        if (! $user->can('leave.file')) {
            return false;
        }

        if ($user->hasRole('HR Staff')) {
            return true;
        }

        return $this->ownsLeaveRequest($user, $leaveRequest);
    }

    public function approve(User $user, LeaveRequest $leaveRequest): bool
    {
        if (! $user->can('leave.approve')) {
            return false;
        }

        if ($user->hasRole('HR Staff')) {
            return true;
        }

        if ($user->hasRole('Department Head')) {
            return $this->managesLeaveRequest($user, $leaveRequest);
        }

        return false;
    }

    public function cancel(User $user, LeaveRequest $leaveRequest): bool
    {
        if (! $user->can('leave.file')) {
            return false;
        }

        if ($user->hasRole('HR Staff')) {
            return true;
        }

        return $this->ownsLeaveRequest($user, $leaveRequest);
    }

    public function createFor(User $user, Employee $employee): bool
    {
        if (! $this->create($user)) {
            return false;
        }

        if ($user->hasRole('Employee')) {
            return $user->employee?->is($employee) ?? false;
        }

        return $user->hasRole('HR Staff');
    }

    private function managesLeaveRequest(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->managed_department_id !== null
            && $leaveRequest->employee?->department_id === $user->managed_department_id;
    }

    private function ownsLeaveRequest(User $user, LeaveRequest $leaveRequest): bool
    {
        return $user->employee?->id === $leaveRequest->employee_id;
    }
}
