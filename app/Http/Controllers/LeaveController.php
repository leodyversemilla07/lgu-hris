<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeaveApprovalRequest;
use App\Http\Requests\LeaveRequestStoreRequest;
use App\Mail\LeaveRequestActioned;
use App\Mail\LeaveRequestSubmitted;
use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();
        $canApprove = $user->hasPermissionTo('leave.approve');

        $query = LeaveRequest::query()
            ->with(['employee', 'leaveType', 'actionedBy'])
            ->latest();

        if (! $canApprove) {
            $employeeId = $request->query('employee_id');
            if ($employeeId) {
                $query->where('employee_id', $employeeId);
            }
        } elseif ($user->hasRole('Department Head') && $user->managed_department_id) {
            $deptEmployeeIds = Employee::where('department_id', $user->managed_department_id)
                ->where('is_active', true)
                ->pluck('id');
            $query->whereIn('employee_id', $deptEmployeeIds);
        }

        if ($statusFilter = $request->query('status')) {
            $query->where('status', $statusFilter);
        }

        if ($typeFilter = $request->query('leave_type_id')) {
            $query->where('leave_type_id', $typeFilter);
        }

        $leaveRequests = $query->get()->map(
            fn (LeaveRequest $lr): array => $this->mapLeaveRequest($lr),
        );

        $employees = $canApprove
            ? Employee::query()
                ->where('is_active', true)
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'middle_name', 'last_name'])
                ->map(fn (Employee $e): array => [
                    'value' => (string) $e->id,
                    'label' => "{$e->last_name}, {$e->first_name}",
                ])
            : [];

        $leaveTypes = LeaveType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (LeaveType $lt): array => [
                'value' => (string) $lt->id,
                'label' => $lt->name,
            ]);

        return Inertia::render('leave/index', [
            'leaveRequests' => $leaveRequests,
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
            'canApprove' => $canApprove,
            'filters' => $request->only(['status', 'leave_type_id', 'employee_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        $year = now()->year;

        $employees = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $e): array => [
                'value' => (string) $e->id,
                'label' => "{$e->last_name}, {$e->first_name}",
                'employee_number' => $e->employee_number,
            ]);

        $leaveTypes = LeaveType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'max_days_per_year', 'requires_approval'])
            ->map(fn (LeaveType $lt): array => [
                'value' => (string) $lt->id,
                'label' => $lt->name,
                'max_days_per_year' => $lt->max_days_per_year,
                'requires_approval' => $lt->requires_approval,
            ]);

        $balances = LeaveBalance::query()
            ->where('year', $year)
            ->get()
            ->groupBy('employee_id')
            ->map(fn ($rows) => $rows->keyBy('leave_type_id')
                ->map(fn (LeaveBalance $b): array => [
                    'total_days' => (float) $b->total_days,
                    'used_days' => (float) $b->used_days,
                    'remaining_days' => $b->remainingDays(),
                ]));

        return Inertia::render('leave/create', [
            'employees' => $employees,
            'leaveTypes' => $leaveTypes,
            'balances' => $balances,
            'year' => $year,
            'preselectedEmployeeId' => $request->query('employee_id', ''),
        ]);
    }

    public function store(LeaveRequestStoreRequest $request): RedirectResponse
    {
        $leaveRequest = LeaveRequest::query()->create([
            'employee_id' => $request->integer('employee_id'),
            'leave_type_id' => $request->integer('leave_type_id'),
            'start_date' => $request->date('start_date'),
            'end_date' => $request->date('end_date'),
            'days_requested' => $request->float('days_requested'),
            'reason' => $request->string('reason')->trim()->value() ?: null,
            'status' => 'submitted',
        ]);

        $leaveRequest->load(['employee', 'leaveType']);

        // Notify users who can approve leave
        User::permission('leave.approve')->get()->each(function (User $approver) use ($leaveRequest) {
            Mail::to($approver->email)->queue(new LeaveRequestSubmitted($leaveRequest));
        });

        return to_route('leave.index');
    }

    public function show(LeaveRequest $leaveRequest): Response
    {
        $leaveRequest->load(['employee', 'leaveType', 'actionedBy']);

        return Inertia::render('leave/show', [
            'leaveRequest' => $this->mapLeaveRequestDetail($leaveRequest),
        ]);
    }

    public function approve(LeaveApprovalRequest $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_unless($leaveRequest->isSubmitted(), 422, 'Leave request is no longer pending.');

        $action = $request->string('action')->value();

        $leaveRequest->update([
            'status' => $action,
            'actioned_by' => $request->user()->id,
            'actioned_at' => now(),
            'remarks' => $request->string('remarks')->trim()->value() ?: null,
        ]);

        if ($action === 'approved') {
            $this->deductLeaveBalance($leaveRequest);
        }

        // Notify the employee if linked to a user account
        $leaveRequest->load(['employee.user', 'leaveType', 'actionedBy']);
        $employeeUser = $leaveRequest->employee?->user;
        if ($employeeUser) {
            Mail::to($employeeUser->email)->queue(new LeaveRequestActioned($leaveRequest));
        }

        return to_route('leave.show', $leaveRequest);
    }

    public function cancel(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        abort_unless($leaveRequest->isSubmitted(), 422, 'Only submitted requests can be cancelled.');

        $leaveRequest->update([
            'status' => 'cancelled',
            'actioned_by' => $request->user()->id,
            'actioned_at' => now(),
        ]);

        $leaveRequest->load(['employee.user', 'leaveType', 'actionedBy']);
        $employeeUser = $leaveRequest->employee?->user;
        if ($employeeUser) {
            Mail::to($employeeUser->email)->queue(new LeaveRequestActioned($leaveRequest));
        }

        return to_route('leave.show', $leaveRequest);
    }

    private function deductLeaveBalance(LeaveRequest $leaveRequest): void
    {
        $balance = LeaveBalance::query()
            ->where('employee_id', $leaveRequest->employee_id)
            ->where('leave_type_id', $leaveRequest->leave_type_id)
            ->where('year', $leaveRequest->start_date->year)
            ->first();

        if ($balance) {
            $balance->increment('used_days', (float) $leaveRequest->days_requested);
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapLeaveRequest(LeaveRequest $lr): array
    {
        return [
            'id' => $lr->id,
            'employee_id' => $lr->employee_id,
            'employee_name' => "{$lr->employee->last_name}, {$lr->employee->first_name}",
            'leave_type' => $lr->leaveType->name,
            'start_date' => $lr->start_date->format('M d, Y'),
            'end_date' => $lr->end_date->format('M d, Y'),
            'days_requested' => (float) $lr->days_requested,
            'status' => $lr->status,
            'submitted_at' => $lr->created_at->format('M d, Y'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapLeaveRequestDetail(LeaveRequest $lr): array
    {
        return array_merge($this->mapLeaveRequest($lr), [
            'employee_number' => $lr->employee->employee_number,
            'leave_type_id' => (string) $lr->leave_type_id,
            'reason' => $lr->reason,
            'actioned_by' => $lr->actionedBy?->name,
            'actioned_at' => $lr->actioned_at?->format('M d, Y g:i A'),
            'remarks' => $lr->remarks,
        ]);
    }
}
