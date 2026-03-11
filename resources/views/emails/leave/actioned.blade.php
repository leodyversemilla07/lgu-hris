<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Request {{ ucfirst($leaveRequest->status) }}</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { padding: 24px 32px; }
        .header.approved { background: #166534; color: #fff; }
        .header.rejected { background: #991b1b; color: #fff; }
        .header.cancelled { background: #475569; color: #fff; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.85; }
        .body { padding: 32px; }
        .field { margin-bottom: 16px; }
        .field dt { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
        .field dd { font-size: 14px; color: #1e293b; margin: 0; }
        .badge-approved { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dcfce7; color: #166534; }
        .badge-rejected { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #fee2e2; color: #991b1b; }
        .badge-cancelled { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #f1f5f9; color: #475569; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header {{ $leaveRequest->status }}">
            <h1>Leave Request {{ ucfirst($leaveRequest->status) }}</h1>
            <p>Your leave request has been {{ $leaveRequest->status }}.</p>
        </div>
        <div class="body">
            <dl>
                <div class="field">
                    <dt>Employee</dt>
                    <dd>{{ $leaveRequest->employee->full_name ?? $leaveRequest->employee->last_name.', '.$leaveRequest->employee->first_name }}</dd>
                </div>
                <div class="field">
                    <dt>Leave type</dt>
                    <dd>{{ $leaveRequest->leaveType->name }}</dd>
                </div>
                <div class="field">
                    <dt>Period</dt>
                    <dd>{{ $leaveRequest->start_date->format('M d, Y') }} – {{ $leaveRequest->end_date->format('M d, Y') }}</dd>
                </div>
                <div class="field">
                    <dt>Days</dt>
                    <dd>{{ $leaveRequest->days_requested }} day(s)</dd>
                </div>
                <div class="field">
                    <dt>Status</dt>
                    <dd>
                        @if($leaveRequest->status === 'approved')
                            <span class="badge-approved">Approved</span>
                        @elseif($leaveRequest->status === 'rejected')
                            <span class="badge-rejected">Rejected</span>
                        @else
                            <span class="badge-cancelled">{{ ucfirst($leaveRequest->status) }}</span>
                        @endif
                    </dd>
                </div>
                @if($leaveRequest->remarks)
                <div class="field">
                    <dt>Remarks</dt>
                    <dd>{{ $leaveRequest->remarks }}</dd>
                </div>
                @endif
                @if($leaveRequest->actionedBy)
                <div class="field">
                    <dt>Actioned by</dt>
                    <dd>{{ $leaveRequest->actionedBy->name }} on {{ $leaveRequest->actioned_at?->format('M d, Y H:i') }}</dd>
                </div>
                @endif
            </dl>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} LGU Human Resource Information System
        </div>
    </div>
</body>
</html>
