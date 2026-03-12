<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Personnel Movements</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #1a1a1a; padding: 16px; }
    .header { text-align: center; margin-bottom: 14px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
    .header h1 { font-size: 13px; font-weight: bold; color: #1e3a5f; letter-spacing: 1px; }
    .header h2 { font-size: 10px; font-weight: normal; color: #444; margin-top: 2px; }
    .filters { font-size: 9px; color: #555; margin-bottom: 10px; }
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
    <h2>PERSONNEL MOVEMENTS{{ $department ? ' - ' . strtoupper($department->name) : '' }}</h2>
</div>

<div class="filters">
    @if($employee)
        Employee: {{ $employee->last_name }}, {{ $employee->first_name }}
    @else
        Employee: All employees
    @endif
    @if($dateFrom)
        | From: {{ \Carbon\Carbon::parse($dateFrom)->format('F d, Y') }}
    @endif
    @if($dateTo)
        | To: {{ \Carbon\Carbon::parse($dateTo)->format('F d, Y') }}
    @endif
</div>

<div class="count">Total: {{ count($movements) }} movement record(s)</div>

<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Employee No.</th>
            <th>Employee Name</th>
            <th>Movement Type</th>
            <th>Effective Date</th>
            <th>Order No.</th>
            <th>From Department</th>
            <th>To Department</th>
            <th>From Position</th>
            <th>To Position</th>
            <th>Remarks</th>
        </tr>
    </thead>
    <tbody>
        @foreach($movements as $index => $movement)
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $movement->employee?->employee_number ?? '-' }}</td>
                <td>{{ $movement->employee ? $movement->employee->last_name . ', ' . $movement->employee->first_name : '-' }}</td>
                <td>{{ $movement->movementType?->name ?? '-' }}</td>
                <td>{{ $movement->effective_date?->format('Y-m-d') ?? '-' }}</td>
                <td>{{ $movement->order_number ?? '-' }}</td>
                <td>{{ $movement->fromDepartment?->name ?? '-' }}</td>
                <td>{{ $movement->toDepartment?->name ?? '-' }}</td>
                <td>{{ $movement->fromPosition?->name ?? '-' }}</td>
                <td>{{ $movement->toPosition?->name ?? '-' }}</td>
                <td>{{ $movement->remarks ?? '-' }}</td>
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
