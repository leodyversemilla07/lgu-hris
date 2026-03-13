<?php

namespace App\Http\Controllers;

use App\Http\Requests\LeaveApprovalRequest;
use App\Http\Requests\LeaveRequestStoreRequest;
use App\Mail\LeaveRequestActioned;
use App\Mail\LeaveRequestSubmitted;
use App\Models\Employee;
use App\Models\LeaveApproval;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\User;
use App\Notifications\LeaveRequestActionedNotification;
use App\Notifications\LeaveRequestSubmittedNotification;
use App\Services\LeaveApprovalService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Inertia\Response;

class LeaveController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', LeaveRequest::class);

        $user = $request->user();
        $canApprove = $user->hasPermissionTo('leave.approve');

        $query = LeaveRequest::query()
            ->with(['employee', 'leaveType', 'actionedBy'])
            ->latest();

        if ($user->hasRole('Department Head')) {
            $departmentId = $user->managed_department_id;

            if ($departmentId !== null) {
                $deptEmployeeIds = Employee::query()
                    ->where('department_id', $departmentId)
                    ->where('is_active', true)
                    ->pluck('id');

                $query->whereIn('employee_id', $deptEmployeeIds)
                    ->where('status', '!=', 'draft');
            } else {
                $query->whereRaw('1 = 0');
            }
        } elseif (! $canApprove) {
            $employeeId = $user->employee?->id;

            if ($employeeId !== null) {
                $query->where('employee_id', $employeeId);
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        if ($canApprove && ($employeeFilter = $request->query('employee_id'))) {
            $query->where('employee_id', $employeeFilter);
        }

        if ($statusFilter = $request->query('status')) {
            $query->where('status', $statusFilter);
        }

        if ($typeFilter = $request->query('leave_type_id')) {
            $query->where('leave_type_id', $typeFilter);
        }

        $leaveRequests = $query->get()->map(
            fn (LeaveRequest $leaveRequest): array => $this->mapLeaveRequest($leaveRequest),
        );

        $employees = $canApprove
            ? Employee::query()
                ->when(
                    $user->hasRole('Department Head'),
                    fn ($query) => $user->managed_department_id !== null
                        ? $query->where('department_id', $user->managed_department_id)
                        : $query->whereRaw('1 = 0'),
                )
                ->where('is_active', true)
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'middle_name', 'last_name'])
                ->map(fn (Employee $employee): array => [
                    'value' => (string) $employee->id,
                    'label' => "{$employee->last_name}, {$employee->first_name}",
                ])
            : [];

        $leaveTypes = LeaveType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (LeaveType $leaveType): array => [
                'value' => (string) $leaveType->id,
                'label' => $leaveType->name,
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
        $this->authorize('create', LeaveRequest::class);

        $year = now()->year;
        $user = $request->user();
        $employeeQuery = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name');

        if ($user->hasRole('Employee')) {
            $employeeId = $user->employee?->id;

            if ($employeeId !== null) {
                $employeeQuery->whereKey($employeeId);
            } else {
                $employeeQuery->whereRaw('1 = 0');
            }
        }

        $employees = $employeeQuery
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $employee): array => [
                'value' => (string) $employee->id,
                'label' => "{$employee->last_name}, {$employee->first_name}",
                'employee_number' => $employee->employee_number,
            ]);

        $leaveTypes = LeaveType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name', 'max_days_per_year', 'requires_approval'])
            ->map(fn (LeaveType $leaveType): array => [
                'value' => (string) $leaveType->id,
                'label' => $leaveType->name,
                'max_days_per_year' => $leaveType->max_days_per_year,
                'requires_approval' => $leaveType->requires_approval,
            ]);

        $balances = LeaveBalance::query()
            ->when(
                $user->hasRole('Employee'),
                fn ($query) => $query->where('employee_id', $user->employee?->id ?? 0),
            )
            ->where('year', $year)
            ->get()
            ->groupBy('employee_id')
            ->map(fn ($rows) => $rows->keyBy('leave_type_id')
                ->map(fn (LeaveBalance $balance): array => [
                    'total_days' => (float) $balance->total_days,
                    'used_days' => (float) $balance->used_days,
                    'remaining_days' => $balance->remainingDays(),
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
        $this->authorize('create', LeaveRequest::class);

        $employee = Employee::query()->findOrFail($request->integer('employee_id'));

        abort_unless($request->user()->can('createFor', [LeaveRequest::class, $employee]), 403);

        $status = $request->input('status') === 'draft' ? 'draft' : 'submitted';

        $leaveRequest = LeaveRequest::query()->create([
            'employee_id' => $employee->id,
            'leave_type_id' => $request->integer('leave_type_id'),
            'start_date' => $request->date('start_date'),
            'end_date' => $request->date('end_date'),
            'days_requested' => $request->float('days_requested'),
            'reason' => $request->string('reason')->trim()->value() ?: null,
            'status' => $status,
            'submitted_at' => $status === 'submitted' ? now() : null,
        ]);

        $leaveRequest->load(['employee', 'leaveType']);

        if ($leaveRequest->isSubmitted()) {
            LeaveApprovalService::record(
                $leaveRequest,
                action: 'submitted',
                actedBy: $request->user()->id,
            );

            $this->notifyApproversOfSubmission($leaveRequest);

            return to_route('leave.index');
        }

        return to_route('leave.show', $leaveRequest);
    }

    public function show(Request $request, LeaveRequest $leaveRequest): Response
    {
        $this->authorize('view', $leaveRequest);

        $leaveRequest->load(['employee', 'leaveType', 'actionedBy', 'approvals.actedBy']);
        $user = $request->user();

        return Inertia::render('leave/show', [
            'leaveRequest' => $this->mapLeaveRequestDetail($leaveRequest),
            'approvalHistory' => $leaveRequest->approvals
                ->sortByDesc('acted_at')
                ->values()
                ->map(fn (LeaveApproval $approval): array => [
                    'id' => $approval->id,
                    'action' => $approval->action,
                    'remarks' => $approval->remarks,
                    'acted_by' => $approval->actedBy?->name,
                    'acted_at' => $approval->acted_at->format('M d, Y g:i A'),
                ]),
            'canApprove' => $user->can('approve', $leaveRequest),
            'canSubmit' => $leaveRequest->isDraft() && $user->can('submit', $leaveRequest),
            'canCancel' => $leaveRequest->canBeCancelled() && $user->can('cancel', $leaveRequest),
        ]);
    }

    public function submit(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->authorize('submit', $leaveRequest);

        abort_unless($leaveRequest->isDraft(), 422, 'Only draft requests can be submitted.');

        $leaveRequest->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        LeaveApprovalService::record(
            $leaveRequest,
            action: 'submitted',
            actedBy: $request->user()->id,
        );

        $leaveRequest->load(['employee', 'leaveType']);
        $this->notifyApproversOfSubmission($leaveRequest);

        return to_route('leave.show', $leaveRequest);
    }

    public function approve(LeaveApprovalRequest $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->authorize('approve', $leaveRequest);

        abort_unless($leaveRequest->isSubmitted(), 422, 'Leave request is no longer pending.');

        $action = $request->string('action')->value();

        $leaveRequest->update([
            'status' => $action,
            'actioned_by' => $request->user()->id,
            'actioned_at' => now(),
            'remarks' => $request->string('remarks')->trim()->value() ?: null,
        ]);

        LeaveApprovalService::record(
            $leaveRequest,
            action: $action,
            remarks: $leaveRequest->remarks,
            actedBy: $request->user()->id,
        );

        if ($action === 'approved') {
            $this->deductLeaveBalance($leaveRequest);
        }

        $leaveRequest->load(['employee.user', 'leaveType', 'actionedBy']);
        $employeeUser = $leaveRequest->employee?->user;
        if ($employeeUser) {
            Mail::to($employeeUser->email)->queue(new LeaveRequestActioned($leaveRequest));
            $employeeUser->notify(new LeaveRequestActionedNotification($leaveRequest));
        }

        return to_route('leave.show', $leaveRequest);
    }

    public function cancel(Request $request, LeaveRequest $leaveRequest): RedirectResponse
    {
        $this->authorize('cancel', $leaveRequest);

        abort_unless($leaveRequest->canBeCancelled(), 422, 'Only draft or submitted requests can be cancelled.');

        $wasSubmitted = $leaveRequest->isSubmitted();

        $leaveRequest->update([
            'status' => 'cancelled',
            'actioned_by' => $request->user()->id,
            'actioned_at' => now(),
        ]);

        LeaveApprovalService::record(
            $leaveRequest,
            action: 'cancelled',
            actedBy: $request->user()->id,
        );

        if ($wasSubmitted) {
            $leaveRequest->load(['employee.user', 'leaveType', 'actionedBy']);
            $employeeUser = $leaveRequest->employee?->user;
            if ($employeeUser) {
                Mail::to($employeeUser->email)->queue(new LeaveRequestActioned($leaveRequest));
                $employeeUser->notify(new LeaveRequestActionedNotification($leaveRequest));
            }
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

    private function notifyApproversOfSubmission(LeaveRequest $leaveRequest): void
    {
        User::permission('leave.approve')->get()->each(function (User $approver) use ($leaveRequest) {
            Mail::to($approver->email)->queue(new LeaveRequestSubmitted($leaveRequest));
            $approver->notify(new LeaveRequestSubmittedNotification($leaveRequest));
        });
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapLeaveRequest(LeaveRequest $leaveRequest): array
    {
        return [
            'id' => $leaveRequest->id,
            'uuid' => $leaveRequest->uuid,
            'employee_id' => $leaveRequest->employee_id,
            'employee_name' => "{$leaveRequest->employee->last_name}, {$leaveRequest->employee->first_name}",
            'leave_type' => $leaveRequest->leaveType->name,
            'start_date' => $leaveRequest->start_date->format('M d, Y'),
            'end_date' => $leaveRequest->end_date->format('M d, Y'),
            'days_requested' => (float) $leaveRequest->days_requested,
            'status' => $leaveRequest->status,
            'saved_at' => $leaveRequest->created_at->format('M d, Y'),
            'submitted_at' => $leaveRequest->submitted_at?->format('M d, Y'),
            'recorded_at' => ($leaveRequest->isDraft()
                ? $leaveRequest->created_at
                : $leaveRequest->submitted_at ?? $leaveRequest->created_at)
                ->format('M d, Y'),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapLeaveRequestDetail(LeaveRequest $leaveRequest): array
    {
        return array_merge($this->mapLeaveRequest($leaveRequest), [
            'employee_number' => $leaveRequest->employee->employee_number,
            'leave_type_id' => (string) $leaveRequest->leave_type_id,
            'reason' => $leaveRequest->reason,
            'actioned_by' => $leaveRequest->actionedBy?->name,
            'actioned_at' => $leaveRequest->actioned_at?->format('M d, Y g:i A'),
            'remarks' => $leaveRequest->remarks,
        ]);
    }
}
