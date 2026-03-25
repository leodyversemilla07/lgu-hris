<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\PersonnelMovement;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Collection;

class ServiceRecordReportService
{
    /**
     * Generate the official Service Record PDF
     * 
     * @param Employee $employee
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateServiceRecord(Employee $employee)
    {
        $employee->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
            'histories.recordedBy',
            'movements.movementType',
            'movements.fromDepartment',
            'movements.toDepartment',
            'movements.fromPosition',
            'movements.toPosition',
        ]);

        $careerHistory = $this->getCareerHistory($employee);

        $data = [
            'employee' => $employee,
            'careerHistory' => $careerHistory,
            'certifiedBy' => 'MUNICIPAL MAYOR', // Typical LGU authority
            'hrmoName' => 'HRM OFFICER',
        ];

        return Pdf::loadView('reports.service-record', $data)
            ->setPaper('legal', 'portrait'); // Official records are usually on Legal paper
    }

    /**
     * Combine movements and histories into a chronological career timeline
     */
    private function getCareerHistory(Employee $employee): Collection
    {
        $history = collect();

        // 1. Initial Appointment (Hired At)
        $history->push([
            'date_from' => $employee->hired_at,
            'date_to' => null, // Will be updated by next movement
            'position' => $employee->position?->name ?? 'Initial Assignment',
            'status' => $employee->employmentType?->name ?? 'N/A',
            'salary' => 'N/A', // We can pull from compensation if exists
            'station' => $employee->department?->name ?? 'LGU',
            'remarks' => 'Original Appointment',
        ]);

        // 2. Add all recorded Personnel Movements
        foreach ($employee->movements as $movement) {
            $history->push([
                'date_from' => $movement->effective_date,
                'date_to' => null,
                'position' => $movement->toPosition?->name ?? 'N/A',
                'status' => $movement->toEmploymentStatus?->name ?? 'N/A',
                'salary' => 'N/A',
                'station' => $movement->toDepartment?->name ?? 'LGU',
                'remarks' => $movement->movementType?->name ?? 'Personnel Movement',
            ]);
        }

        // 3. Sort chronologically and fix "Date To" values
        $sorted = $history->sortBy('date_from')->values();

        for ($i = 0; $i < $sorted->count() - 1; $i++) {
            $sorted[$i]['date_to'] = $sorted[$i + 1]['date_from']->copy()->subDay();
        }

        // Last entry is "Present"
        $sorted->last()['date_to'] = 'Present';

        return $sorted;
    }
}
