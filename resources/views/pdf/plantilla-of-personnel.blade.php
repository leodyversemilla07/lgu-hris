<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Plantilla of Personnel</title>
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
    td { padding: 4px 5px; border-bottom: 1px solid #e5e7eb; font-size: 8.5px; vertical-align: top; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 16px; font-size: 8px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 6px; display: flex; justify-content: space-between; }
</style>
</head>
<body>

<div class="header">
    <h1>LOCAL GOVERNMENT UNIT - HUMAN RESOURCE INFORMATION SYSTEM</h1>
    <h2>PLANTILLA OF PERSONNEL{{ $department ? ' - ' . strtoupper($department->name) : '' }}</h2>
</div>

<div class="meta">
    As of {{ now()->format('F d, Y') }}
</div>

<div class="count">Total: {{ count($positions) }} plantilla position(s)</div>

<table>
    <thead>
        <tr>
            <th>#</th>
            <th>Position Code</th>
            <th>Position Title</th>
            <th>Salary Grade</th>
            <th>Department</th>
            <th>Incumbent</th>
            <th>Status</th>
        </tr>
    </thead>
    <tbody>
        @foreach($positions as $index => $position)
            @php($incumbent = $position->employees->first())
            <tr>
                <td>{{ $index + 1 }}</td>
                <td>{{ $position->code ?? '-' }}</td>
                <td>{{ $position->name }}</td>
                <td>{{ $position->salary_grade ?? '-' }}</td>
                <td>{{ $position->department?->name ?? '-' }}</td>
                <td>
                    @if($incumbent)
                        {{ $incumbent->last_name }}, {{ $incumbent->first_name }}
                    @else
                        -
                    @endif
                </td>
                <td>{{ $incumbent ? 'Filled' : 'Vacant' }}</td>
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
