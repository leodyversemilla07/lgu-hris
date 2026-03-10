<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Personnel Masterlist</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 9px; color: #1a1a1a; padding: 16px; }
    .header { text-align: center; margin-bottom: 14px; border-bottom: 2px solid #1e3a5f; padding-bottom: 10px; }
    .header h1 { font-size: 13px; font-weight: bold; color: #1e3a5f; letter-spacing: 1px; }
    .header h2 { font-size: 10px; font-weight: normal; color: #444; margin-top: 2px; }
    .filters { font-size: 9px; color: #555; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    th { background: #1e3a5f; color: white; padding: 5px 5px; text-align: left; font-weight: bold; font-size: 8px; text-transform: uppercase; }
    td { padding: 4px 5px; border-bottom: 1px solid #e5e7eb; font-size: 8.5px; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 16px; font-size: 8px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 6px;
        display: flex; justify-content: space-between; }
    .count { font-size: 9px; color: #1e3a5f; font-weight: bold; margin-bottom: 8px; }
</style>
</head>
<body>

<div class="header">
    <h1>LOCAL GOVERNMENT UNIT – HUMAN RESOURCE INFORMATION SYSTEM</h1>
    <h2>PERSONNEL MASTERLIST{{ $department ? ' – ' . strtoupper($department->name) : '' }}</h2>
</div>

<div class="filters">
    As of {{ now()->format('F d, Y') }}
    @if($statusFilter) &nbsp;|&nbsp; Filter: {{ ucfirst($statusFilter) }} employees @endif
</div>

<div class="count">Total: {{ count($employees) }} employee(s)</div>

<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Emp No.</th>
            <th>Name</th>
            <th>Department</th>
            <th>Position</th>
            <th>Type</th>
            <th>Status</th>
            <th>Date Hired</th>
        </tr>
    </thead>
    <tbody>
        @foreach($employees as $i => $employee)
        <tr>
            <td>{{ $i + 1 }}</td>
            <td>{{ $employee->employee_number }}</td>
            <td>{{ $employee->last_name }}, {{ $employee->first_name }} {{ $employee->middle_name }}</td>
            <td>{{ $employee->department?->name }}</td>
            <td>{{ $employee->position?->name }}</td>
            <td>{{ $employee->employmentType?->name }}</td>
            <td>{{ $employee->employmentStatus?->name }}</td>
            <td>{{ $employee->hired_at?->format('Y-m-d') }}</td>
        </tr>
        @endforeach
    </tbody>
</table>

<div class="footer">
    <span>Generated: {{ now()->format('F d, Y \a\t h:i A') }}</span>
    <span>LGU HRIS – Confidential</span>
</div>

</body>
</html>
