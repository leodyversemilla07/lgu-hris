<?php

namespace App\Exports;

use App\Models\Position;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;

class PlantillaExport implements FromQuery, ShouldAutoSize, WithHeadings, WithMapping, WithTitle
{
    public function __construct(
        private readonly ?int $departmentId = null,
    ) {}

    public function query()
    {
        return Position::query()
            ->with([
                'department',
                'employees' => fn ($q) => $q
                    ->where('is_active', true)
                    ->with(['employmentStatus'])
                    ->orderBy('last_name'),
            ])
            ->when($this->departmentId, fn ($q) => $q->where('department_id', $this->departmentId))
            ->where('is_active', true)
            ->orderBy('salary_grade')
            ->orderBy('name');
    }

    public function headings(): array
    {
        return [
            'Position Code',
            'Position Title',
            'Salary Grade',
            'Department',
            'Incumbent',
            'Status',
        ];
    }

    /** @param  Position  $position */
    public function map($position): array
    {
        $incumbent = $position->employees->first();

        return [
            $position->code ?? '',
            $position->name,
            $position->salary_grade ?? '',
            $position->department?->name ?? '',
            $incumbent
                ? "{$incumbent->last_name}, {$incumbent->first_name}"
                : '',
            $incumbent ? 'Filled' : 'Vacant',
        ];
    }

    public function title(): string
    {
        return 'Plantilla of Personnel';
    }
}
