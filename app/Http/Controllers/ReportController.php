<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveType;
use App\Models\ReportExport;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $departmentQuery = Department::query()
            ->where('is_active', true)
            ->orderBy('name');

        $employeeQuery = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($user->hasRole('Department Head')) {
            $departmentId = $user->managed_department_id;

            if ($departmentId !== null) {
                $departmentQuery->whereKey($departmentId);
                $employeeQuery->where('department_id', $departmentId);
            } else {
                $departmentQuery->whereRaw('1 = 0');
                $employeeQuery->whereRaw('1 = 0');
            }
        }

        $departments = $departmentQuery
            ->get(['id', 'name'])
            ->map(fn (Department $department): array => ['value' => (string) $department->id, 'label' => $department->name]);

        $employees = $employeeQuery
            ->get(['id', 'uuid', 'first_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $employee): array => [
                'value' => $employee->uuid,
                'label' => "{$employee->last_name}, {$employee->first_name} ({$employee->employee_number})",
            ]);

        $leaveTypes = LeaveType::query()
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (LeaveType $leaveType): array => ['value' => (string) $leaveType->id, 'label' => $leaveType->name]);

        $years = collect(range(now()->year, max(now()->year - 5, 2020)))
            ->map(fn (int $year): array => ['value' => (string) $year, 'label' => (string) $year]);

        $recentExports = ReportExport::query()
            ->with(['department:id,name', 'employee:id,first_name,last_name,employee_number'])
            ->where('user_id', $user->id)
            ->latest('exported_at')
            ->limit(5)
            ->get()
            ->map(fn (ReportExport $export): array => [
                'id' => $export->id,
                'report_name' => $export->report_name,
                'export_format' => $export->export_format === 'excel' ? 'XLSX' : strtoupper($export->export_format),
                'file_name' => $export->file_name,
                'department' => $export->department?->name,
                'employee' => $export->employee
                    ? "{$export->employee->last_name}, {$export->employee->first_name} ({$export->employee->employee_number})"
                    : null,
                'exported_at' => $export->exported_at->format('M d, Y g:i A'),
                'filters' => $export->filters ?? [],
            ]);

        return Inertia::render('reports/index', [
            'departments' => $departments,
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
            'years' => $years,
            'recentExports' => $recentExports,
        ]);
    }
}
