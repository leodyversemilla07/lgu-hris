<?php

namespace App\Exports;

use App\Models\Employee;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class PersonnelMasterlistExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    public function __construct(
        private readonly ?int $departmentId = null,
        private readonly ?string $statusFilter = null,
    ) {}

    public function query()
    {
        return Employee::query()
            ->with(['department', 'position', 'employmentType', 'employmentStatus'])
            ->when($this->departmentId, fn ($q) => $q->where('department_id', $this->departmentId))
            ->when($this->statusFilter === 'active', fn ($q) => $q->where('is_active', true))
            ->when($this->statusFilter === 'inactive', fn ($q) => $q->where('is_active', false))
            ->orderBy('last_name')
            ->orderBy('first_name');
    }

    public function headings(): array
    {
        return [
            'Employee No.',
            'Last Name',
            'First Name',
            'Middle Name',
            'Suffix',
            'Department',
            'Position',
            'Employment Type',
            'Employment Status',
            'Date Hired',
            'Email',
            'Phone',
            'Active',
        ];
    }

    /** @param  Employee  $employee */
    public function map($employee): array
    {
        return [
            $employee->employee_number,
            $employee->last_name,
            $employee->first_name,
            $employee->middle_name ?? '',
            $employee->suffix ?? '',
            $employee->department?->name ?? '',
            $employee->position?->name ?? '',
            $employee->employmentType?->name ?? '',
            $employee->employmentStatus?->name ?? '',
            $employee->hired_at?->format('Y-m-d') ?? '',
            $employee->email ?? '',
            $employee->phone ?? '',
            $employee->is_active ? 'Yes' : 'No',
        ];
    }

    public function title(): string
    {
        return 'Personnel Masterlist';
    }
}
