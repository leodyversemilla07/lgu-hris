<?php

namespace App\Http\Controllers;

use App\Models\AttendanceSummary;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\PersonnelMovement;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        /** @var User $user */
        $user = request()->user();

        $payload = match (true) {
            $user->hasAnyRole(['HR Admin', 'HR Staff']) => $this->organizationDashboard(),
            $user->hasRole('Department Head') => $this->departmentDashboard($user),
            $user->hasRole('Employee') => $this->employeeDashboard($user),
            default => $this->organizationDashboard(),
        };

        return Inertia::render('dashboard', $payload);
    }

    private function organizationDashboard(): array
    {
        $now = now();

        $totalActive = Employee::query()->where('is_active', true)->count();
        $totalInactive = Employee::query()->where('is_active', false)->count();

        $byStatus = EmploymentStatus::query()
            ->withCount([
                'employees as count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderByDesc('count')
            ->get(['id', 'name'])
            ->map(fn (EmploymentStatus $status) => [
                'label' => $status->name,
                'value' => $status->count,
            ])
            ->values()
            ->all();

        $byDepartment = Department::query()
            ->withCount([
                'employees as count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderByDesc('count')
            ->limit(8)
            ->get(['id', 'name'])
            ->filter(fn (Department $department) => $department->count > 0)
            ->map(fn (Department $department) => [
                'label' => $department->name,
                'value' => $department->count,
            ])
            ->values()
            ->all();

        $pendingLeave = LeaveRequest::query()
            ->where('status', 'submitted')
            ->whereYear('created_at', $now->year)
            ->whereMonth('created_at', $now->month)
            ->count();

        $approvedLeaveThisMonth = LeaveRequest::query()
            ->where('status', 'approved')
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->count();

        $totalLeaveDaysThisMonth = (float) LeaveRequest::query()
            ->where('status', 'approved')
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->sum('days_requested');

        $attendanceThisMonth = AttendanceSummary::query()
            ->where('year', $now->year)
            ->where('month', $now->month)
            ->selectRaw('
                SUM(days_present) as total_present,
                SUM(days_absent) as total_absent,
                SUM(total_late_minutes) as total_late_minutes,
                COUNT(DISTINCT employee_id) as employees_logged
            ')
            ->first();

        $recentRecords = PersonnelMovement::query()
            ->with([
                'employee:id,first_name,last_name',
                'movementType:id,name',
            ])
            ->orderByDesc('effective_date')
            ->limit(5)
            ->get()
            ->map(fn (PersonnelMovement $movement) => [
                'id' => $movement->id,
                'record' => $movement->employee
                    ? "{$movement->employee->last_name}, {$movement->employee->first_name}"
                    : 'N/A',
                'type' => $movement->movementType?->name ?? 'N/A',
                'date' => $movement->effective_date?->format('Y-m-d'),
                'reference' => $movement->order_number,
            ])
            ->all();

        return [
            'dashboardType' => 'organization',
            'title' => 'Overview',
            'description' => 'Monitor workforce-wide counts, grouped distributions, and recent personnel activity.',
            'cards' => [
                [
                    'title' => 'Total records',
                    'value' => number_format($totalActive + $totalInactive),
                    'detail' => number_format($totalActive).' active entries',
                    'hint' => 'Records',
                    'icon' => 'folder',
                ],
                [
                    'title' => 'Open items',
                    'value' => number_format($pendingLeave),
                    'detail' => number_format($approvedLeaveThisMonth).' cleared this cycle',
                    'hint' => 'Queue',
                    'icon' => 'calendar',
                ],
                [
                    'title' => 'Tracked activity',
                    'value' => number_format((int) ($attendanceThisMonth?->employees_logged ?? 0)),
                    'detail' => number_format((int) ($attendanceThisMonth?->total_absent ?? 0)).' absences logged',
                    'hint' => 'Logs',
                    'icon' => 'clock',
                ],
                [
                    'title' => 'Coverage groups',
                    'value' => number_format(count($byDepartment)),
                    'detail' => number_format($totalLeaveDaysThisMonth, 1).' days captured',
                    'hint' => 'Groups',
                    'icon' => 'building',
                ],
            ],
            'charts' => [
                [
                    'key' => 'primary',
                    'tab' => 'Statuses',
                    'title' => 'Employment status',
                    'description' => 'Active employee distribution by employment status.',
                    'emptyTitle' => 'No status data',
                    'emptyDescription' => 'Counts will render here once categorized employee records are available.',
                    'icon' => 'users',
                    'layout' => 'vertical',
                    'items' => $byStatus,
                ],
                [
                    'key' => 'secondary',
                    'tab' => 'Departments',
                    'title' => 'Departments',
                    'description' => 'Largest active groups by department.',
                    'emptyTitle' => 'No department data',
                    'emptyDescription' => 'Department counts will render here once active employees are available.',
                    'icon' => 'building',
                    'layout' => 'horizontal',
                    'items' => $byDepartment,
                ],
            ],
            'recentRecords' => [
                'title' => 'Recent personnel movements',
                'description' => 'Latest recorded personnel movements across the organization.',
                'rows' => $recentRecords,
            ],
        ];
    }

    private function departmentDashboard(User $user): array
    {
        $now = now();
        $department = $user->managedDepartment;

        if (! $department) {
            return [
                'dashboardType' => 'department',
                'title' => 'Department overview',
                'description' => 'No managed department is assigned to this account yet.',
                'cards' => $this->emptyCards(),
                'charts' => $this->emptyCharts('department'),
                'recentRecords' => [
                    'title' => 'Recent requests',
                    'description' => 'Team activity will appear here once a managed department is assigned.',
                    'rows' => [],
                ],
            ];
        }

        $employeeScope = Employee::query()->where('department_id', $department->id);

        $activeMembers = (clone $employeeScope)->where('is_active', true)->count();
        $pendingApprovals = LeaveRequest::query()
            ->whereHas('employee', fn ($query) => $query->where('department_id', $department->id))
            ->where('status', 'submitted')
            ->count();
        $approvedThisMonth = LeaveRequest::query()
            ->whereHas('employee', fn ($query) => $query->where('department_id', $department->id))
            ->where('status', 'approved')
            ->whereYear('start_date', $now->year)
            ->whereMonth('start_date', $now->month)
            ->count();
        $attendanceThisMonth = AttendanceSummary::query()
            ->whereHas('employee', fn ($query) => $query->where('department_id', $department->id))
            ->where('year', $now->year)
            ->where('month', $now->month)
            ->selectRaw('
                SUM(days_present) as total_present,
                SUM(days_absent) as total_absent,
                SUM(total_late_minutes) as total_late_minutes,
                COUNT(DISTINCT employee_id) as employees_logged
            ')
            ->first();

        $statusItems = EmploymentStatus::query()
            ->withCount([
                'employees as count' => fn ($query) => $query
                    ->where('department_id', $department->id)
                    ->where('is_active', true),
            ])
            ->orderByDesc('count')
            ->get(['id', 'name'])
            ->map(fn (EmploymentStatus $status) => [
                'label' => $status->name,
                'value' => $status->count,
            ])
            ->values()
            ->all();

        $leaveTypeItems = LeaveRequest::query()
            ->with('leaveType:id,name')
            ->whereHas('employee', fn ($query) => $query->where('department_id', $department->id))
            ->whereYear('created_at', $now->year)
            ->get()
            ->groupBy(fn (LeaveRequest $request) => $request->leaveType?->name ?? 'Unknown')
            ->map(fn ($requests, string $label) => [
                'label' => $label,
                'value' => $requests->count(),
            ])
            ->sortByDesc('value')
            ->values()
            ->all();

        $recentRecords = LeaveRequest::query()
            ->with([
                'employee:id,first_name,last_name',
                'leaveType:id,name',
            ])
            ->whereHas('employee', fn ($query) => $query->where('department_id', $department->id))
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (LeaveRequest $request) => [
                'id' => $request->id,
                'record' => $request->employee
                    ? "{$request->employee->last_name}, {$request->employee->first_name}"
                    : 'N/A',
                'type' => $request->leaveType?->name ?? 'N/A',
                'date' => $request->start_date?->format('Y-m-d'),
                'reference' => str($request->status)->headline()->toString(),
            ])
            ->all();

        return [
            'dashboardType' => 'department',
            'title' => $department->name,
            'description' => 'Track your department roster, approvals queue, and recent leave activity.',
            'cards' => [
                [
                    'title' => 'Active members',
                    'value' => number_format($activeMembers),
                    'detail' => number_format($pendingApprovals).' awaiting review',
                    'hint' => 'Team',
                    'icon' => 'users',
                ],
                [
                    'title' => 'Pending approvals',
                    'value' => number_format($pendingApprovals),
                    'detail' => number_format($approvedThisMonth).' approved this month',
                    'hint' => 'Queue',
                    'icon' => 'calendar',
                ],
                [
                    'title' => 'Attendance logs',
                    'value' => number_format((int) ($attendanceThisMonth?->employees_logged ?? 0)),
                    'detail' => number_format((int) ($attendanceThisMonth?->total_absent ?? 0)).' absences recorded',
                    'hint' => 'Logs',
                    'icon' => 'clock',
                ],
                [
                    'title' => 'Late minutes',
                    'value' => number_format((int) ($attendanceThisMonth?->total_late_minutes ?? 0)),
                    'detail' => 'Current month attendance summary',
                    'hint' => 'Discipline',
                    'icon' => 'building',
                ],
            ],
            'charts' => [
                [
                    'key' => 'primary',
                    'tab' => 'Statuses',
                    'title' => 'Team status',
                    'description' => 'Current employment status mix across your department.',
                    'emptyTitle' => 'No team status data',
                    'emptyDescription' => 'Status counts will render once team records are available.',
                    'icon' => 'users',
                    'layout' => 'vertical',
                    'items' => $statusItems,
                ],
                [
                    'key' => 'secondary',
                    'tab' => 'Leave types',
                    'title' => 'Leave types',
                    'description' => 'Leave request distribution by type for the current year.',
                    'emptyTitle' => 'No leave request data',
                    'emptyDescription' => 'Leave type counts will render once the department has leave requests.',
                    'icon' => 'calendar',
                    'layout' => 'horizontal',
                    'items' => $leaveTypeItems,
                ],
            ],
            'recentRecords' => [
                'title' => 'Recent leave requests',
                'description' => 'Latest leave activity submitted by members of your department.',
                'rows' => $recentRecords,
            ],
        ];
    }

    private function employeeDashboard(User $user): array
    {
        $now = now();
        $employee = $user->employee;

        if (! $employee) {
            return [
                'dashboardType' => 'employee',
                'title' => 'My workspace',
                'description' => 'Your account is not linked to an employee record yet.',
                'cards' => $this->emptyCards(),
                'charts' => $this->emptyCharts('employee'),
                'recentRecords' => [
                    'title' => 'Recent leave requests',
                    'description' => 'Your leave activity will appear here once an employee record is linked.',
                    'rows' => [],
                ],
            ];
        }

        $leaveBalances = LeaveBalance::query()
            ->with('leaveType:id,name')
            ->where('employee_id', $employee->id)
            ->where('year', $now->year)
            ->get();

        $remainingLeave = $leaveBalances->sum(fn (LeaveBalance $balance) => $balance->remainingDays());
        $pendingRequests = LeaveRequest::query()
            ->where('employee_id', $employee->id)
            ->where('status', 'submitted')
            ->count();
        $approvedThisYear = LeaveRequest::query()
            ->where('employee_id', $employee->id)
            ->where('status', 'approved')
            ->whereYear('start_date', $now->year)
            ->count();
        $attendanceSummary = AttendanceSummary::query()
            ->where('employee_id', $employee->id)
            ->where('year', $now->year)
            ->where('month', $now->month)
            ->first();

        $leaveBalanceItems = $leaveBalances
            ->map(fn (LeaveBalance $balance) => [
                'label' => $balance->leaveType?->name ?? 'Unknown',
                'value' => round($balance->remainingDays(), 2),
            ])
            ->values()
            ->all();

        $statusLabels = [
            'submitted' => 'Pending',
            'approved' => 'Approved',
            'rejected' => 'Rejected',
            'cancelled' => 'Cancelled',
        ];

        $requestStatusItems = collect($statusLabels)
            ->map(fn (string $label, string $status) => [
                'label' => $label,
                'value' => LeaveRequest::query()
                    ->where('employee_id', $employee->id)
                    ->where('status', $status)
                    ->count(),
            ])
            ->values()
            ->all();

        $recentRecords = LeaveRequest::query()
            ->with('leaveType:id,name')
            ->where('employee_id', $employee->id)
            ->latest('created_at')
            ->limit(5)
            ->get()
            ->map(fn (LeaveRequest $request) => [
                'id' => $request->id,
                'record' => $request->leaveType?->name ?? 'N/A',
                'type' => number_format((float) $request->days_requested, 0).' day(s)',
                'date' => $request->start_date?->format('Y-m-d'),
                'reference' => str($request->status)->headline()->toString(),
            ])
            ->all();

        $roleContext = $employee->position?->name
            ? $employee->position->name.' • '.($employee->department?->name ?? 'No department')
            : ($employee->department?->name ?? 'Employee workspace');

        return [
            'dashboardType' => 'employee',
            'title' => 'My workspace',
            'description' => 'Track your leave balances, request history, and attendance summary. '.$roleContext,
            'cards' => [
                [
                    'title' => 'Remaining leave',
                    'value' => number_format($remainingLeave, 1),
                    'detail' => number_format(count($leaveBalanceItems)).' tracked leave balances this year',
                    'hint' => 'Balance',
                    'icon' => 'calendar',
                ],
                [
                    'title' => 'Pending requests',
                    'value' => number_format($pendingRequests),
                    'detail' => number_format($approvedThisYear).' approved this year',
                    'hint' => 'Requests',
                    'icon' => 'folder',
                ],
                [
                    'title' => 'Days present',
                    'value' => number_format((int) ($attendanceSummary?->days_present ?? 0)),
                    'detail' => number_format((int) ($attendanceSummary?->days_absent ?? 0)).' absences this month',
                    'hint' => 'Attendance',
                    'icon' => 'clock',
                ],
                [
                    'title' => 'Late minutes',
                    'value' => number_format((int) ($attendanceSummary?->total_late_minutes ?? 0)),
                    'detail' => number_format((int) ($attendanceSummary?->days_leave ?? 0)).' leave day(s) this month',
                    'hint' => 'Time',
                    'icon' => 'users',
                ],
            ],
            'charts' => [
                [
                    'key' => 'primary',
                    'tab' => 'Balances',
                    'title' => 'Leave balances',
                    'description' => 'Remaining leave credits for the current year.',
                    'emptyTitle' => 'No leave balances',
                    'emptyDescription' => 'Balance totals will appear here once your leave credits are recorded.',
                    'icon' => 'calendar',
                    'layout' => 'vertical',
                    'items' => $leaveBalanceItems,
                ],
                [
                    'key' => 'secondary',
                    'tab' => 'Requests',
                    'title' => 'Request statuses',
                    'description' => 'Current breakdown of your leave request history.',
                    'emptyTitle' => 'No request activity',
                    'emptyDescription' => 'Request totals will render once you file leave requests.',
                    'icon' => 'folder',
                    'layout' => 'horizontal',
                    'items' => $requestStatusItems,
                ],
            ],
            'recentRecords' => [
                'title' => 'Recent leave requests',
                'description' => 'Your most recent leave requests and their current statuses.',
                'rows' => $recentRecords,
            ],
        ];
    }

    private function emptyCards(): array
    {
        return [
            [
                'title' => 'Total',
                'value' => '0',
                'detail' => 'No data available yet',
                'hint' => 'Overview',
                'icon' => 'folder',
            ],
            [
                'title' => 'Pending',
                'value' => '0',
                'detail' => 'No data available yet',
                'hint' => 'Queue',
                'icon' => 'calendar',
            ],
            [
                'title' => 'Tracked',
                'value' => '0',
                'detail' => 'No data available yet',
                'hint' => 'Activity',
                'icon' => 'clock',
            ],
            [
                'title' => 'Groups',
                'value' => '0',
                'detail' => 'No data available yet',
                'hint' => 'Coverage',
                'icon' => 'building',
            ],
        ];
    }

    private function emptyCharts(string $context): array
    {
        $secondaryTab = $context === 'employee' ? 'Requests' : 'Groups';

        return [
            [
                'key' => 'primary',
                'tab' => 'Primary',
                'title' => 'Primary distribution',
                'description' => 'Primary grouped counts will render here.',
                'emptyTitle' => 'No primary data',
                'emptyDescription' => 'Grouped counts will appear here once records are available.',
                'icon' => 'users',
                'layout' => 'vertical',
                'items' => [],
            ],
            [
                'key' => 'secondary',
                'tab' => $secondaryTab,
                'title' => 'Secondary distribution',
                'description' => 'Secondary grouped counts will render here.',
                'emptyTitle' => 'No secondary data',
                'emptyDescription' => 'Additional grouped counts will appear here once records are available.',
                'icon' => 'building',
                'layout' => 'horizontal',
                'items' => [],
            ],
        ];
    }
}
