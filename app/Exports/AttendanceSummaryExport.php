<?php

namespace App\Exports;

use App\Models\AttendanceSummary;
use App\Models\Employee;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class AttendanceSummaryExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    public function __construct(
        private readonly ?int $year = null,
        private readonly ?int $month = null,
        private readonly ?int $departmentId = null,
    ) {}

    public function query()
    {
        $year = $this->year ?? now()->year;

        return AttendanceSummary::query()
            ->with(['employee.department', 'employee.position'])
            ->where('year', $year)
            ->when($this->month, fn ($q) => $q->where('month', $this->month))
            ->when($this->departmentId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('department_id', $this->departmentId)))
            ->orderBy('year')
            ->orderBy('month')
            ->orderBy(
                Employee::select('last_name')
                    ->whereColumn('employees.id', 'attendance_summaries.employee_id')
                    ->limit(1)
            );
    }

    public function headings(): array
    {
        return [
            'Employee No.',
            'Employee Name',
            'Department',
            'Year',
            'Month',
            'Days Present',
            'Days Absent',
            'Days Leave',
            'Days Holiday',
            'Days Rest Day',
            'Late (min)',
            'Undertime (min)',
        ];
    }

    /** @param  AttendanceSummary  $summary */
    public function map($summary): array
    {
        $emp = $summary->employee;

        return [
            $emp?->employee_number ?? '',
            $emp ? "{$emp->last_name}, {$emp->first_name}" : '',
            $emp?->department?->name ?? '',
            $summary->year,
            $summary->month,
            $summary->days_present,
            $summary->days_absent,
            $summary->days_leave,
            $summary->days_holiday,
            $summary->days_rest_day,
            $summary->total_late_minutes,
            $summary->total_undertime_minutes,
        ];
    }

    public function title(): string
    {
        return 'Attendance Summary';
    }
}
