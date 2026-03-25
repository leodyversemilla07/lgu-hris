<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Service Record - {{ $employee->full_name }}</title>
    <style>
        @page {
            margin: 1cm;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 9pt;
            line-height: 1.2;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            font-size: 14pt;
            margin: 0;
            text-transform: uppercase;
        }
        .header h2 {
            font-size: 11pt;
            margin: 5px 0;
            text-transform: uppercase;
        }
        .employee-info {
            margin-bottom: 20px;
        }
        .employee-info table {
            width: 100%;
        }
        .employee-info td {
            border: none;
            padding: 2px 0;
        }
        table.service-history {
            width: 100%;
            border-collapse: collapse;
            font-size: 8.5pt;
        }
        table.service-history th, table.service-history td {
            border: 1px solid #000;
            padding: 5px;
            text-align: center;
        }
        .cert-statement {
            margin-top: 30px;
            text-indent: 50px;
            text-align: justify;
        }
        .signature-section {
            margin-top: 50px;
            width: 100%;
        }
        .signature-box {
            float: right;
            width: 300px;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            margin-bottom: 5px;
            font-weight: bold;
            text-transform: uppercase;
        }
    </style>
</head>
<body>
    <div class="header">
        <p>Republic of the Philippines</p>
        <h2>{{ config('app.name', 'LOCAL GOVERNMENT UNIT') }}</h2>
        <p>Province of Example</p>
        <div style="margin-top: 20px;">
            <h1>SERVICE RECORD</h1>
        </div>
    </div>

    <div class="employee-info">
        <table>
            <tr>
                <td width="15%">Name:</td>
                <td width="35%"><b>{{ $employee->last_name }}, {{ $employee->first_name }} {{ $employee->middle_name }}</b></td>
                <td width="15%">Birth Date:</td>
                <td width="35%">{{ $employee->birth_date?->format('F d, Y') ?? 'N/A' }}</td>
            </tr>
            <tr>
                <td>Employee No:</td>
                <td>{{ $employee->employee_number }}</td>
                <td>Hired At:</td>
                <td>{{ $employee->hired_at?->format('F d, Y') ?? 'N/A' }}</td>
            </tr>
        </table>
    </div>

    <p style="text-align: justify;">This is to certify that the employee named hereinabove actually rendered services in this Office as shown by the service record below, each line of which is supported by appointment and other papers actually issued by this Office and approved by the Civil Service Commission.</p>

    <table class="service-history">
        <thead>
            <tr>
                <th colspan="2">Inclusive Dates</th>
                <th colspan="3">Designation / Assignment</th>
                <th rowspan="2">Status</th>
                <th rowspan="2">Salary</th>
                <th rowspan="2">Station / Office</th>
                <th rowspan="2">Branch / Remarks</th>
            </tr>
            <tr>
                <th>From</th>
                <th>To</th>
                <th colspan="3">Position</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($careerHistory as $entry)
            <tr>
                <td>{{ $entry['date_from']?->format('m/d/Y') }}</td>
                <td>{{ $entry['date_to'] instanceof \Carbon\Carbon ? $entry['date_to']->format('m/d/Y') : $entry['date_to'] }}</td>
                <td colspan="3">{{ $entry['position'] }}</td>
                <td>{{ $entry['status'] }}</td>
                <td>{{ $entry['salary'] }}</td>
                <td>{{ $entry['station'] }}</td>
                <td>{{ $entry['remarks'] }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="cert-statement">
        Issued in compliance with Executive Order No. 54 dated August 10, 1954 and in accordance with Circular No. 58 dated August 10, 1954 of the System.
    </div>

    <div class="signature-section">
        <div style="float: left; width: 300px;">
            <p>Date: {{ now()->format('F d, Y') }}</p>
        </div>
        <div class="signature-box">
            <p>Certified Correct:</p>
            <div style="height: 40px;"></div>
            <div class="signature-line">{{ $hrmoName }}</div>
            <p>Municipal Government Department Head</p>
            <p>(Human Resource Management Officer)</p>
        </div>
    </div>
</body>
</html>
