<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\PersonnelMovement;

class EmployeeService
{
    /**
     * Map employee for list view.
     *
     * @return array<string, mixed>
     */
    public function mapEmployeeForList(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'uuid' => $employee->uuid,
            'employee_number' => $employee->employee_number,
            'full_name' => trim(collect([
                $employee->first_name,
                $employee->middle_name,
                $employee->last_name,
                $employee->suffix,
            ])->filter()->join(' ')),
            'email' => $employee->email,
            'phone' => $employee->phone,
            'department' => $employee->department->name,
            'position' => $employee->position->name,
            'employment_type' => $employee->employmentType->name,
            'employment_status' => $employee->employmentStatus->name,
            'hired_at' => $employee->hired_at?->format('M d, Y'),
            'is_active' => $employee->is_active,
        ];
    }

    /**
     * Map employee for detailed view.
     *
     * @return array<string, mixed>
     */
    public function mapEmployeeDetail(Employee $employee): array
    {
        return [
            'id' => $employee->id,
            'uuid' => $employee->uuid,
            'user_id' => $employee->user_id,
            'employee_number' => $employee->employee_number,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'suffix' => $employee->suffix,
            'sex' => $employee->sex,
            'civil_status' => $employee->civil_status,
            'full_name' => trim(collect([
                $employee->first_name,
                $employee->middle_name,
                $employee->last_name,
                $employee->suffix,
            ])->filter()->join(' ')),
            'email' => $employee->email,
            'phone' => $employee->phone,
            'birth_date' => $employee->birth_date?->format('Y-m-d'),
            'birth_date_formatted' => $employee->birth_date?->format('M d, Y'),
            'address_street' => $employee->address_street,
            'address_city' => $employee->address_city,
            'address_province' => $employee->address_province,
            'address_zip' => $employee->address_zip,
            'tin' => $employee->tin,
            'gsis_number' => $employee->gsis_number,
            'philhealth_number' => $employee->philhealth_number,
            'pagibig_number' => $employee->pagibig_number,
            'sss_number' => $employee->sss_number,
            'emergency_contact_name' => $employee->emergency_contact_name,
            'emergency_contact_relationship' => $employee->emergency_contact_relationship,
            'emergency_contact_phone' => $employee->emergency_contact_phone,
            'hired_at' => $employee->hired_at?->format('Y-m-d'),
            'hired_at_formatted' => $employee->hired_at?->format('M d, Y'),
            'department_id' => (string) $employee->department_id,
            'department' => $employee->department->name,
            'position_id' => (string) $employee->position_id,
            'position' => $employee->position->name,
            'employment_type_id' => (string) $employee->employment_type_id,
            'employment_type' => $employee->employmentType->name,
            'employment_status_id' => (string) $employee->employment_status_id,
            'employment_status' => $employee->employmentStatus->name,
            'work_schedule_id' => $employee->work_schedule_id ? (string) $employee->work_schedule_id : '',
            'work_schedule' => $employee->workSchedule?->name,
            'is_active' => $employee->is_active,
            'archived_at' => $employee->archived_at?->format('M d, Y'),
        ];
    }

    /**
     * Map history for view.
     *
     * @return array<string, mixed>
     */
    public function mapHistory(EmployeeHistory $history): array
    {
        $beforeValues = $history->before_values ?? [];
        $afterValues = $history->after_values ?? [];
        $labels = [
            'department' => 'Department',
            'position' => 'Position',
            'employment_type' => 'Employment type',
            'employment_status' => 'Employment status',
            'work_schedule' => 'Work schedule',
            'hired_at' => 'Appointment date',
            'is_active' => 'Registry status',
        ];

        $changes = collect(array_unique([
            ...array_keys($beforeValues),
            ...array_keys($afterValues),
        ]))
            ->filter(fn (string $key): bool => array_key_exists($key, $labels))
            ->map(fn (string $key): array => [
                'label' => $labels[$key],
                'from' => $beforeValues[$key] ?? null,
                'to' => $afterValues[$key] ?? null,
            ])
            ->values()
            ->all();

        return [
            'id' => $history->id,
            'event_type' => $history->event_type,
            'title' => $history->title,
            'description' => $history->description,
            'effective_date' => $history->effective_date?->format('M d, Y'),
            'recorded_by' => $history->recordedBy?->name,
            'recorded_at' => $history->created_at->format('M d, Y g:i A'),
            'changes' => $changes,
            'source_url' => $history->source_type === PersonnelMovement::class && $history->source_id !== null
                ? $this->movementUrl((int) $history->source_id)
                : null,
        ];
    }

    private function movementUrl(int $movementId): ?string
    {
        $uuid = PersonnelMovement::query()->whereKey($movementId)->value('uuid');

        return $uuid === null ? null : route('personnel-movements.show', $uuid);
    }

    /**
     * Format file size to human readable format.
     */
    public function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes.' B';
        }

        if ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }
}
