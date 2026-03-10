<?php

namespace App\Exports;

use App\Models\LeaveRequest;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class LeaveLedgerExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    public function __construct(
        private readonly ?int $year = null,
        private readonly ?int $departmentId = null,
        private readonly ?int $employeeId = null,
    ) {}

    public function query()
    {
        $year = $this->year ?? now()->year;

        return LeaveRequest::query()
            ->with(['employee.department', 'employee.position', 'leaveType'])
            ->whereYear('start_date', $year)
            ->when($this->departmentId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('department_id', $this->departmentId)))
            ->when($this->employeeId, fn ($q) => $q->where('employee_id', $this->employeeId))
            ->orderBy('start_date');
    }

    public function headings(): array
    {
        return [
            'Employee No.',
            'Employee Name',
            'Department',
            'Position',
            'Leave Type',
            'Start Date',
            'End Date',
            'Days Requested',
            'Reason',
            'Status',
            'Actioned Date',
        ];
    }

    /** @param  LeaveRequest  $request */
    public function map($request): array
    {
        $emp = $request->employee;

        return [
            $emp?->employee_number ?? '',
            $emp ? "{$emp->last_name}, {$emp->first_name}" : '',
            $emp?->department?->name ?? '',
            $emp?->position?->name ?? '',
            $request->leaveType?->name ?? '',
            $request->start_date?->format('Y-m-d') ?? '',
            $request->end_date?->format('Y-m-d') ?? '',
            (float) $request->days_requested,
            $request->reason ?? '',
            ucfirst($request->status),
            $request->actioned_at?->format('Y-m-d') ?? '',
        ];
    }

    public function title(): string
    {
        return 'Leave Ledger';
    }
}
