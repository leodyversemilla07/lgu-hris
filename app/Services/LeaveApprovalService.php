<?php

namespace App\Services;

use App\Models\LeaveApproval;
use App\Models\LeaveRequest;

class LeaveApprovalService
{
    public static function record(
        LeaveRequest $leaveRequest,
        string $action,
        ?string $remarks = null,
        ?int $actedBy = null,
    ): void {
        LeaveApproval::query()->create([
            'leave_request_id' => $leaveRequest->id,
            'action' => $action,
            'remarks' => $remarks,
            'acted_by' => $actedBy,
            'acted_at' => now(),
        ]);
    }
}
