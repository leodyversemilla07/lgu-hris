<?php

namespace App\Notifications;

use App\Models\LeaveRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class LeaveRequestActionedNotification extends Notification
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
        return [
            'category' => 'leave',
            'title' => sprintf(
                'Leave request %s',
                str_replace('_', ' ', $this->leaveRequest->status),
            ),
            'message' => sprintf(
                'Your %s request from %s to %s is now %s.',
                $this->leaveRequest->leaveType?->name ?? 'leave',
                $this->leaveRequest->start_date->format('M d, Y'),
                $this->leaveRequest->end_date->format('M d, Y'),
                $this->leaveRequest->status,
            ),
            'action_url' => route('leave.show', $this->leaveRequest),
            'leave_request_id' => $this->leaveRequest->id,
            'status' => $this->leaveRequest->status,
            'recorded_at' => now()->toIso8601String(),
        ];
    }
}
