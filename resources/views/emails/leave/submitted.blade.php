<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Request Filed</title>
    <style>
        body { font-family: Arial, sans-serif; background: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; }
        .header { background: #1f4e79; color: #fff; padding: 24px 32px; }
        .header h1 { margin: 0; font-size: 20px; font-weight: 600; }
        .header p { margin: 4px 0 0; font-size: 13px; opacity: 0.85; }
        .body { padding: 32px; }
        .field { margin-bottom: 16px; }
        .field dt { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
        .field dd { font-size: 14px; color: #1e293b; margin: 0; }
        .badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #dbeafe; color: #1d4ed8; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 32px; font-size: 12px; color: #64748b; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Request Filed</h1>
            <p>A new leave request has been submitted and requires review.</p>
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
                    <dt>Days requested</dt>
                    <dd>{{ $leaveRequest->days_requested }} day(s)</dd>
                </div>
                @if($leaveRequest->reason)
                <div class="field">
                    <dt>Reason</dt>
                    <dd>{{ $leaveRequest->reason }}</dd>
                </div>
                @endif
                <div class="field">
                    <dt>Status</dt>
                    <dd><span class="badge">{{ ucfirst($leaveRequest->status) }}</span></dd>
                </div>
            </dl>
            <p style="margin-top:24px;font-size:13px;color:#475569;">Please log in to the HRIS system to review and action this request.</p>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} LGU Human Resource Information System
        </div>
    </div>
</body>
</html>
