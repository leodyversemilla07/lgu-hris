<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Daily Time Record - CSC Form 48</title>
    <style>
        @page {
            margin: 0.5cm;
        }
        body {
            font-family: 'Arial', sans-serif;
            font-size: 8pt;
            margin: 0;
            padding: 0;
        }
        .container {
            width: 100%;
        }
        .dtr-side {
            width: 48%;
            float: left;
            padding: 5px;
            border: 1px dashed #ccc;
        }
        .dtr-side:last-child {
            float: right;
        }
        .header {
            text-align: center;
            margin-bottom: 10px;
        }
        .header h1 {
            font-size: 10pt;
            margin: 0;
            text-transform: uppercase;
        }
        .header p {
            font-size: 8pt;
            margin: 2px 0;
        }
        .employee-info {
            margin-bottom: 10px;
        }
        .employee-info span {
            border-bottom: 1px solid #000;
            display: inline-block;
            min-width: 150px;
            font-weight: bold;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 7.5pt;
        }
        th, td {
            border: 1px solid #000;
            text-align: center;
            padding: 2px;
        }
        .footer {
            margin-top: 15px;
            font-size: 7pt;
        }
        .signature-section {
            margin-top: 20px;
            text-align: center;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            margin-top: 30px;
            width: 80%;
            display: inline-block;
        }
        .spacer {
            height: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        @for ($i = 0; $i < 2; $i++)
        <div class="dtr-side">
            <div class="header">
                <p style="text-align: left; font-style: italic;">Civil Service Form No. 48</p>
                <h1>DAILY TIME RECORD</h1>
                <p>----- <b style="font-size: 9pt;">{{ $employee->full_name }}</b> -----</p>
                <p>(Name)</p>
            </div>

            <div class="employee-info">
                <p>For the month of: <span>{{ $month }} {{ $year }}</span></p>
                <p>Official hours for arrival <br> and departure: <span>Regular Days</span></p>
            </div>

            <table>
                <thead>
                    <tr>
                        <th rowspan="2">Day</th>
                        <th colspan="2">A.M.</th>
                        <th colspan="2">P.M.</th>
                        <th colspan="2">Undertime</th>
                    </tr>
                    <tr>
                        <th>Arrival</th>
                        <th>Departure</th>
                        <th>Arrival</th>
                        <th>Departure</th>
                        <th>Hours</th>
                        <th>Minutes</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($days as $day)
                    <tr>
                        <td>{{ $day['day'] }}</td>
                        <td>{{ $day['am_in'] ?? '' }}</td>
                        <td>{{ $day['am_out'] ?? '' }}</td>
                        <td>{{ $day['pm_in'] ?? '' }}</td>
                        <td>{{ $day['pm_out'] ?? '' }}</td>
                        <td></td>
                        <td>{{ $day['late_minutes'] + $day['undertime_minutes'] ?: '' }}</td>
                    </tr>
                    @endforeach
                </tbody>
                <tfoot>
                    <tr>
                        <th colspan="5" style="text-align: right;">TOTAL</th>
                        <th></th>
                        <th>{{ $totals['late'] + $totals['undertime'] }}</th>
                    </tr>
                </tfoot>
            </table>

            <div class="footer">
                <p>I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.</p>
                
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <p>(Signature of Employee)</p>
                </div>

                <p>Verified as to the prescribed office hours:</p>
                
                <div class="signature-section">
                    <div class="signature-line"></div>
                    <p><b>{{ $employee->department?->head?->name ?? 'Department Head' }}</b></p>
                    <p>In Charge</p>
                </div>
            </div>
        </div>
        @endfor
    </div>
</body>
</html>
