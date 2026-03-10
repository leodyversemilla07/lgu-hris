<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Service Record – {{ $employee->last_name }}, {{ $employee->first_name }}</title>
<style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DejaVu Sans', sans-serif; font-size: 10px; color: #1a1a1a; padding: 20px; }
    .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #1e3a5f; padding-bottom: 12px; }
    .header h1 { font-size: 14px; font-weight: bold; color: #1e3a5f; letter-spacing: 1px; }
    .header h2 { font-size: 11px; font-weight: normal; color: #444; margin-top: 2px; }
    .section { margin-bottom: 12px; }
    .section-title { font-size: 9px; font-weight: bold; color: #1e3a5f; text-transform: uppercase;
        letter-spacing: 1px; border-bottom: 1px solid #1e3a5f; padding-bottom: 3px; margin-bottom: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
    .info-row { display: flex; gap: 4px; }
    .info-label { font-weight: bold; color: #555; min-width: 110px; }
    .info-value { color: #111; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 9px; }
    th { background: #1e3a5f; color: white; padding: 5px 6px; text-align: left; font-weight: bold; }
    td { padding: 4px 6px; border-bottom: 1px solid #e5e7eb; }
    tr:nth-child(even) td { background: #f8fafc; }
    .footer { margin-top: 24px; font-size: 9px; color: #666; border-top: 1px solid #e5e7eb; padding-top: 8px;
        display: flex; justify-content: space-between; }
    .badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 8px; font-weight: bold; }
    .badge-active { background: #dcfce7; color: #166534; }
    .badge-inactive { background: #fee2e2; color: #991b1b; }
</style>
</head>
<body>

<div class="header">
    <h1>LOCAL GOVERNMENT UNIT – HUMAN RESOURCE INFORMATION SYSTEM</h1>
    <h2>SERVICE RECORD</h2>
</div>

<div class="section">
    <div class="section-title">Personal Information</div>
    <div class="info-grid">
        <div class="info-row"><span class="info-label">Employee No.:</span><span class="info-value">{{ $employee->employee_number }}</span></div>
        <div class="info-row"><span class="info-label">Status:</span><span class="info-value">
            <span class="badge {{ $employee->is_active ? 'badge-active' : 'badge-inactive' }}">{{ $employee->is_active ? 'Active' : 'Inactive' }}</span>
        </span></div>
        <div class="info-row"><span class="info-label">Full Name:</span><span class="info-value">{{ $employee->last_name }}, {{ $employee->first_name }} {{ $employee->middle_name }} {{ $employee->suffix }}</span></div>
        <div class="info-row"><span class="info-label">Date of Birth:</span><span class="info-value">{{ $employee->birth_date?->format('F d, Y') }}</span></div>
        <div class="info-row"><span class="info-label">Email:</span><span class="info-value">{{ $employee->email }}</span></div>
        <div class="info-row"><span class="info-label">Phone:</span><span class="info-value">{{ $employee->phone }}</span></div>
    </div>
</div>

<div class="section">
    <div class="section-title">Current Assignment</div>
    <div class="info-grid">
        <div class="info-row"><span class="info-label">Department:</span><span class="info-value">{{ $employee->department?->name }}</span></div>
        <div class="info-row"><span class="info-label">Position:</span><span class="info-value">{{ $employee->position?->name }}</span></div>
        <div class="info-row"><span class="info-label">Employment Type:</span><span class="info-value">{{ $employee->employmentType?->name }}</span></div>
        <div class="info-row"><span class="info-label">Employment Status:</span><span class="info-value">{{ $employee->employmentStatus?->name }}</span></div>
        <div class="info-row"><span class="info-label">Date Hired:</span><span class="info-value">{{ $employee->hired_at?->format('F d, Y') }}</span></div>
    </div>
</div>

@if($employee->compensations->isNotEmpty())
<div class="section">
    <div class="section-title">Compensation History</div>
    <table>
        <thead>
            <tr>
                <th>Effective Date</th>
                <th>Salary Grade</th>
                <th>Step</th>
                <th>Monthly Salary</th>
            </tr>
        </thead>
        <tbody>
            @foreach($employee->compensations->sortByDesc('effective_date') as $comp)
            <tr>
                <td>{{ $comp->effective_date?->format('Y-m-d') }}</td>
                <td>{{ $comp->salaryGrade?->grade }}</td>
                <td>{{ $comp->salaryGrade?->step }}</td>
                <td>{{ number_format($comp->salaryGrade?->monthly_salary ?? 0, 2) }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

@if($employee->movements->isNotEmpty())
<div class="section">
    <div class="section-title">Personnel Movement History</div>
    <table>
        <thead>
            <tr>
                <th>Effective Date</th>
                <th>Movement Type</th>
                <th>From Department</th>
                <th>To Department</th>
                <th>From Position</th>
                <th>To Position</th>
                <th>Order No.</th>
            </tr>
        </thead>
        <tbody>
            @foreach($employee->movements->sortByDesc('effective_date') as $movement)
            <tr>
                <td>{{ $movement->effective_date?->format('Y-m-d') }}</td>
                <td>{{ $movement->movementType?->name }}</td>
                <td>{{ $movement->fromDepartment?->name }}</td>
                <td>{{ $movement->toDepartment?->name }}</td>
                <td>{{ $movement->fromPosition?->name }}</td>
                <td>{{ $movement->toPosition?->name }}</td>
                <td>{{ $movement->order_number }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>
</div>
@endif

<div class="footer">
    <span>Generated: {{ now()->format('F d, Y \a\t h:i A') }}</span>
    <span>LGU HRIS – Confidential</span>
</div>

</body>
</html>
