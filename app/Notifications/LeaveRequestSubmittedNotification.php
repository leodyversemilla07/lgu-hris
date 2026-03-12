<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveRequestSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(protected LeaveRequest $leaveRequest) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $employee = $this->leaveRequest->employee;
        $employeeName = $employee
            ? sprintf('%s, %s', $employee->last_name, $employee->first_name)
            : 'An employee';

        return [
            'category' => 'leave',
            'title' => 'New leave request submitted',
            'message' => sprintf(
                '%s filed %s from %s to %s.',
                $employeeName,
                $this->leaveRequest->leaveType?->name ?? 'leave',
                $this->leaveRequest->start_date->format('M d, Y'),
                $this->leaveRequest->end_date->format('M d, Y'),
            ),
            'action_url' => route('leave.show', $this->leaveRequest),
            'leave_request_id' => $this->leaveRequest->id,
            'status' => $this->leaveRequest->status,
            'recorded_at' => now()->toIso8601String(),
        ];
    }
}
