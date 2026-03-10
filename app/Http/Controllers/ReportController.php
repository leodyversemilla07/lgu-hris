<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveType;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
{
    public function index(): Response
    {
        $departments = Department::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($d) => ['value' => (string) $d->id, 'label' => $d->name]);

        $employees = Employee::where('is_active', true)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'last_name', 'employee_number'])
            ->map(fn ($e) => [
                'value' => (string) $e->id,
                'label' => "{$e->last_name}, {$e->first_name} ({$e->employee_number})",
            ]);

        $leaveTypes = LeaveType::orderBy('name')
            ->get(['id', 'name'])
            ->map(fn ($l) => ['value' => (string) $l->id, 'label' => $l->name]);

        $years = collect(range(now()->year, max(now()->year - 5, 2020)))
            ->map(fn ($y) => ['value' => (string) $y, 'label' => (string) $y]);

        return Inertia::render('reports/index', [
            'departments' => $departments,
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
            'years' => $years,
        ]);
    }
}
