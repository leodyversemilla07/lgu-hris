<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSummary;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\LeaveRequest;
use App\Models\PersonnelMovement;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $now = now();

        $totalActive = Employee::where('is_active', true)->count();
        $totalInactive = Employee::where('is_active', false)->count();

        $byStatus = EmploymentStatus::withCount([
            'employees as count' => fn ($q) => $q->where('is_active', true),
        ])
            ->orderByDesc('count')
            ->get(['id', 'name'])
            ->map(fn ($s) => ['label' => $s->name, 'value' => $s->count]);

        $byDepartment = Department::withCount([
            'employees as count' => fn ($q) => $q->where('is_active', true),
        ])
            ->orderByDesc('count')
            ->limit(8)
            ->get(['id', 'name'])
            ->filter(fn ($d) => $d->count > 0)
            ->map(fn ($d) => ['label' => $d->name, 'value' => $d->count])
            ->values();

        $pendingLeave = LeaveRequest::where('status', 'submitted')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();

        $approvedLeaveThisMonth = LeaveRequest::where('status', 'approved')
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->count();

        $totalLeaveDaysThisMonth = LeaveRequest::where('status', 'approved')
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->sum('days_requested');

        $attendanceThisMonth = AttendanceSummary::where('year', $now->year)
            ->where('month', $now->month)
            ->selectRaw('
                SUM(days_present) as total_present,
                SUM(days_absent) as total_absent,
                SUM(total_late_minutes) as total_late_minutes,
                COUNT(DISTINCT employee_id) as employees_logged
            ')
            ->first();

        $recentMovements = PersonnelMovement::with([
            'employee:id,first_name,last_name',
            'movementType:id,name',
        ])
            ->orderByDesc('effective_date')
            ->limit(5)
            ->get()
            ->map(fn ($m) => [
                'id' => $m->id,
                'employee' => $m->employee
                    ? "{$m->employee->last_name}, {$m->employee->first_name}"
                    : '—',
                'type' => $m->movementType?->name ?? '—',
                'effective_date' => $m->effective_date?->format('Y-m-d'),
                'order_number' => $m->order_number,
            ]);

        return Inertia::render('dashboard', [
            'kpis' => [
                'totalActive' => $totalActive,
                'totalInactive' => $totalInactive,
                'pendingLeave' => $pendingLeave,
                'approvedLeaveThisMonth' => $approvedLeaveThisMonth,
                'totalLeaveDaysThisMonth' => (float) $totalLeaveDaysThisMonth,
                'attendanceThisMonth' => [
                    'total_present' => (int) ($attendanceThisMonth?->total_present ?? 0),
                    'total_absent' => (int) ($attendanceThisMonth?->total_absent ?? 0),
                    'total_late_minutes' => (int) ($attendanceThisMonth?->total_late_minutes ?? 0),
                    'employees_logged' => (int) ($attendanceThisMonth?->employees_logged ?? 0),
                ],
                'byStatus' => $byStatus,
                'byDepartment' => $byDepartment,
            ],
            'recentMovements' => $recentMovements,
        ]);
    }
}
