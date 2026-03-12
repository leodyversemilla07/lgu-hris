<?php

namespace App\Exports;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Builder;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class PayrollSupportExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    public function __construct(
        private readonly ?int $departmentId = null,
        private readonly ?int $employeeId = null,
    ) {}

    public function query()
    {
        return Employee::query()
            ->with([
                'department',
                'position',
                'employmentStatus',
                'compensations' => fn ($query) => $query
                    ->with('salaryGrade')
                    ->orderByDesc('effective_date')
                    ->limit(1),
            ])
            ->where('is_active', true)
            ->when($this->departmentId, fn (Builder $query) => $query->where('department_id', $this->departmentId))
            ->when($this->employeeId, fn (Builder $query) => $query->whereKey($this->employeeId))
            ->orderBy('last_name')
            ->orderBy('first_name');
    }

    public function headings(): array
    {
        return [
            'Employee No.',
            'Employee Name',
            'Department',
            'Position',
            'Employment Status',
            'TIN',
            'GSIS No.',
            'PhilHealth No.',
            'Pag-IBIG No.',
            'SSS No.',
            'Salary Grade',
            'Step',
            'Monthly Salary',
            'Allowances',
            'Deductions',
            'Effective Date',
        ];
    }

    /** @param  Employee  $employee */
    public function map($employee): array
    {
        $compensation = $employee->compensations->first();
        $salaryGrade = $compensation?->salaryGrade;

        return [
            $employee->employee_number,
            "{$employee->last_name}, {$employee->first_name}",
            $employee->department?->name ?? '',
            $employee->position?->name ?? '',
            $employee->employmentStatus?->name ?? '',
            $employee->tin ?? '',
            $employee->gsis_number ?? '',
            $employee->philhealth_number ?? '',
            $employee->pagibig_number ?? '',
            $employee->sss_number ?? '',
            $salaryGrade?->grade ?? '',
            $salaryGrade?->step ?? '',
            $salaryGrade?->monthly_salary !== null ? number_format((float) $salaryGrade->monthly_salary, 2, '.', '') : '',
            $compensation?->allowances !== null ? number_format((float) $compensation->allowances, 2, '.', '') : '',
            $compensation?->deductions !== null ? number_format((float) $compensation->deductions, 2, '.', '') : '',
            $compensation?->effective_date?->format('Y-m-d') ?? '',
        ];
    }

    public function title(): string
    {
        return 'Payroll Support';
    }
}
