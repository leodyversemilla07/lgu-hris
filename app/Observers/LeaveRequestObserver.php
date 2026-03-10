<?php

namespace App\Observers;

use App\Models\LeaveRequest;
use App\Services\AuditService;

class LeaveRequestObserver
{
    public function created(LeaveRequest $leaveRequest): void
    {
        AuditService::log(
            'created',
            $leaveRequest,
            null,
            $leaveRequest->only(['employee_id', 'leave_type_id', 'start_date', 'end_date', 'days_requested', 'status']),
            'Leave request filed',
        );
    }

    public function updated(LeaveRequest $leaveRequest): void
    {
        $dirty = $leaveRequest->getDirty();
        if (empty($dirty)) {
            return;
        }

        if (isset($dirty['status'])) {
            $old = $leaveRequest->getOriginal('status');
            $new = $dirty['status'];
            AuditService::log(
                'status_changed',
                $leaveRequest,
                ['status' => $old],
                ['status' => $new],
                "Leave request status changed from {$old} to {$new}",
            );
        }
    }
}
