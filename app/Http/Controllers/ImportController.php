<?php

namespace App\Http\Controllers;

use App\Imports\EmployeeImport;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ImportController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:xlsx,xls,csv', 'max:5120'],
        ]);

        $import = new EmployeeImport;
        Excel::import($import, $request->file('file'));

        $message = "Import complete: {$import->imported} row(s) imported";
        if ($import->skipped > 0) {
            $message .= ", {$import->skipped} skipped";
        }
        if (! empty($import->errors)) {
            $message .= '. Errors: '.implode(' | ', array_slice($import->errors, 0, 5));
        }

        return to_route('employees.index')->with('success', $message);
    }

    public function template(): StreamedResponse
    {
        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="employee-import-template.csv"',
        ];

        $columns = [
            'employee_number',
            'first_name',
            'middle_name',
            'last_name',
            'suffix',
            'email',
            'phone',
            'birth_date',
            'hired_at',
            'department',
            'position',
            'employment_type',
            'employment_status',
        ];

        return response()->stream(function () use ($columns) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $columns);
            fputcsv($handle, [
                '2024-001', 'Juan', 'Santos', 'Dela Cruz', '', 'juan@lgu.gov.ph', '09171234567',
                '1990-01-15', '2020-06-01', 'Finance', 'Accountant I', 'Permanent', 'Permanent',
            ]);
            fclose($handle);
        }, 200, $headers);
    }
}
