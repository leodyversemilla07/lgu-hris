<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Attendance Summary</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #1a1a1a; padding: 16px; }
    .header { text-align: center; margin-bottom: 14px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
    .header h1 { font-size: 13px; font-weight: bold; color: #1e3a5f; letter-spacing: 1px; }
    .header h2 { font-size: 10px; font-weight: normal; color: #444; margin-top: 2px; }
    .meta { font-size: 9px; color: #555; margin-bottom: 10px; }
    .count { font-size: 9px; color: #1e3a5f; font-weight: bold; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e3a5f; color: white; padding: 5px; text-align: left; font-weight: bold; font-size: 8px; text-transform: uppercase; }
    td { padding: 4px 5px; border-bottom: 1px solid #e5e7eb; font-size: 8.5px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 16px; font-size: 8px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 6px; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<div class="header">
    <h1>LOCAL GOVERNMENT UNIT - HUMAN RESOURCE INFORMATION SYSTEM</h1>
    <h2>ATTENDANCE SUMMARY{{ $department ? ' - ' . strtoupper($department->name) : '' }}</h2>
</div>

<div class="meta">
    Year: {{ $year }}
    @if($month)
        | Month: {{ \Carbon\Carbon::create()->month($month)->format('F') }}
    @else
        | Month: All months
    @endif
</div>

<div class="count">Total: {{ count($summaries) }} attendance summary row(s)</div>

<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Employee No.</th>
            <th>Employee Name</th>
            <th>Department</th>
            <th>Year</th>
            <th>Month</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Leave</th>
            <th>Holiday</th>
            <th>Rest Day</th>
            <th>Late (min)</th>
            <th>Undertime (min)</th>
        </tr>
    </thead>
    <tbody>
        @foreach($summaries as $index => $summary)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $summary->employee?->employee_number ?? '-' }}</td>
                <td>{{ $summary->employee ? $summary->employee->last_name . ', ' . $summary->employee->first_name : '-' }}</td>
                <td>{{ $summary->employee?->department?->name ?? '-' }}</td>
                <td>{{ $summary->year }}</td>
                <td>{{ \Carbon\Carbon::create()->month($summary->month)->format('F') }}</td>
                <td>{{ $summary->days_present }}</td>
                <td>{{ $summary->days_absent }}</td>
                <td>{{ $summary->days_leave }}</td>
                <td>{{ $summary->days_holiday }}</td>
                <td>{{ $summary->days_rest_day }}</td>
                <td>{{ $summary->total_late_minutes }}</td>
                <td>{{ $summary->total_undertime_minutes }}</td>
            </tr>
        @endforeach
    </tbody>
</table>

<div class="footer">
    <span>Generated: {{ now()->format('F d, Y \a\t h:i A') }}</span>
    <span>LGU HRIS - Confidential</span>
</div>

</body>
</html>
