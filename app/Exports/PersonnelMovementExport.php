<?php

namespace App\Exports;

use App\Models\PersonnelMovement;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class PersonnelMovementExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    public function __construct(
        private readonly ?string $dateFrom = null,
        private readonly ?string $dateTo = null,
        private readonly ?int $departmentId = null,
        private readonly ?int $employeeId = null,
    ) {}

    public function query()
    {
        return PersonnelMovement::query()
            ->with([
                'employee',
                'movementType',
                'fromDepartment',
                'toDepartment',
                'fromPosition',
                'toPosition',
                'fromEmploymentStatus',
                'toEmploymentStatus',
            ])
            ->when($this->dateFrom, fn ($q) => $q->where('effective_date', '>=', $this->dateFrom))
            ->when($this->dateTo, fn ($q) => $q->where('effective_date', '<=', $this->dateTo))
            ->when($this->departmentId, fn ($q) => $q->whereHas('employee', fn ($eq) => $eq->where('department_id', $this->departmentId)))
            ->when($this->employeeId, fn ($q) => $q->where('employee_id', $this->employeeId))
            ->orderBy('effective_date', 'desc');
    }

    public function headings(): array
    {
        return [
            'Employee No.',
            'Employee Name',
            'Movement Type',
            'Effective Date',
            'Order No.',
            'From Department',
            'To Department',
            'From Position',
            'To Position',
            'From Status',
            'To Status',
            'Remarks',
        ];
    }

    /** @param  PersonnelMovement  $movement */
    public function map($movement): array
    {
        $emp = $movement->employee;

        return [
            $emp?->employee_number ?? '',
            $emp ? "{$emp->last_name}, {$emp->first_name}" : '',
            $movement->movementType?->name ?? '',
            $movement->effective_date?->format('Y-m-d') ?? '',
            $movement->order_number ?? '',
            $movement->fromDepartment?->name ?? '',
            $movement->toDepartment?->name ?? '',
            $movement->fromPosition?->name ?? '',
            $movement->toPosition?->name ?? '',
            $movement->fromEmploymentStatus?->name ?? '',
            $movement->toEmploymentStatus?->name ?? '',
            $movement->remarks ?? '',
        ];
    }

    public function title(): string
    {
        return 'Personnel Movements';
    }
}
