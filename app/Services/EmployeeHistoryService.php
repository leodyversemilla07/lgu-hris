<?php

namespace App\Services;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeHistory;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\WorkSchedule;
use Carbon\CarbonInterface;

class EmployeeHistoryService
{
    /**
     * @var array<string, string>
     */
    protected const TRACKED_ATTRIBUTE_MAP = [
        'department_id' => 'department',
        'position_id' => 'position',
        'employment_type_id' => 'employment_type',
        'employment_status_id' => 'employment_status',
        'work_schedule_id' => 'work_schedule',
        'hired_at' => 'hired_at',
        'is_active' => 'is_active',
    ];

    public static function recordCreated(Employee $employee): void
    {
        $employee->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
            'workSchedule',
        ]);

        self::createHistory(
            employee: $employee,
            eventType: 'hired',
            title: 'Employee added to registry',
            description: 'Initial employment assignment was recorded for this employee.',
            effectiveDate: $employee->hired_at,
            afterValues: self::snapshotFromEmployee($employee),
        );
    }

    public static function recordUpdated(Employee $employee): void
    {
        $changes = array_intersect_key(
            $employee->getChanges(),
            self::TRACKED_ATTRIBUTE_MAP,
        );

        if ($changes === []) {
            return;
        }

        $changedSnapshotKeys = array_values(array_intersect_key(
            self::TRACKED_ATTRIBUTE_MAP,
            $changes,
        ));

        $beforeValues = self::snapshotFromPreviousAttributes(
            $employee->getPrevious(),
            $changedSnapshotKeys,
        );

        $employee->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
            'workSchedule',
        ]);

        $afterValues = self::snapshotFromEmployee($employee, $changedSnapshotKeys);

        if ($beforeValues === $afterValues) {
            return;
        }

        $eventType = 'profile_updated';
        $title = 'Employment profile updated';
        $description = 'Tracked employment assignment details were updated on the employee profile.';

        if (count($afterValues) === 1 && array_key_exists('is_active', $afterValues)) {
            $isActive = $afterValues['is_active'] === 'Active';
            $eventType = $isActive ? 'restored' : 'archived';
            $title = $isActive
                ? 'Employee restored to active registry'
                : 'Employee archived from active registry';
            $description = $isActive
                ? 'The employee record was restored and marked active again.'
                : 'The employee record was archived and removed from the active registry.';
        }

        self::createHistory(
            employee: $employee,
            eventType: $eventType,
            title: $title,
            description: $description,
            effectiveDate: now(),
            beforeValues: $beforeValues,
            afterValues: $afterValues,
        );
    }

    public static function recordMovement(PersonnelMovement $movement): void
    {
        $movement->load([
            'employee',
            'movementType',
            'fromDepartment',
            'toDepartment',
            'fromPosition',
            'toPosition',
            'fromEmploymentStatus',
            'toEmploymentStatus',
        ]);

        $beforeValues = array_filter([
            'department' => $movement->fromDepartment?->name,
            'position' => $movement->fromPosition?->name,
            'employment_status' => $movement->fromEmploymentStatus?->name,
        ], fn (?string $value): bool => $value !== null && $value !== '');

        $afterValues = array_filter([
            'department' => $movement->toDepartment?->name,
            'position' => $movement->toPosition?->name,
            'employment_status' => $movement->toEmploymentStatus?->name,
        ], fn (?string $value): bool => $value !== null && $value !== '');

        $description = collect([
            $movement->order_number ? "Order No. {$movement->order_number}" : null,
            $movement->remarks,
        ])->filter()->implode(' | ');

        self::createHistory(
            employee: $movement->employee,
            eventType: 'personnel_movement',
            title: $movement->movementType?->name ?? 'Personnel movement recorded',
            description: $description !== '' ? $description : 'Personnel action recorded on the employee file.',
            effectiveDate: $movement->effective_date,
            beforeValues: $beforeValues,
            afterValues: $afterValues,
            sourceType: PersonnelMovement::class,
            sourceId: $movement->id,
            recordedBy: $movement->recorded_by,
        );
    }

    /**
     * @param  array<string, mixed>  $previous
     * @param  array<int, string>|null  $keys
     * @return array<string, string|null>
     */
    protected static function snapshotFromPreviousAttributes(array $previous, ?array $keys = null): array
    {
        $snapshot = [
            'department' => self::resolveDepartmentName($previous['department_id'] ?? null),
            'position' => self::resolvePositionName($previous['position_id'] ?? null),
            'employment_type' => self::resolveEmploymentTypeName($previous['employment_type_id'] ?? null),
            'employment_status' => self::resolveEmploymentStatusName($previous['employment_status_id'] ?? null),
            'work_schedule' => self::resolveWorkScheduleName($previous['work_schedule_id'] ?? null),
            'hired_at' => self::formatDate($previous['hired_at'] ?? null),
            'is_active' => array_key_exists('is_active', $previous)
                ? self::formatActiveStatus($previous['is_active'])
                : null,
        ];

        return self::filterSnapshot($snapshot, $keys);
    }

    /**
     * @param  array<int, string>|null  $keys
     * @return array<string, string|null>
     */
    protected static function snapshotFromEmployee(Employee $employee, ?array $keys = null): array
    {
        $snapshot = [
            'department' => $employee->department?->name,
            'position' => $employee->position?->name,
            'employment_type' => $employee->employmentType?->name,
            'employment_status' => $employee->employmentStatus?->name,
            'work_schedule' => $employee->workSchedule?->name,
            'hired_at' => $employee->hired_at?->format('M d, Y'),
            'is_active' => self::formatActiveStatus($employee->is_active),
        ];

        return self::filterSnapshot($snapshot, $keys);
    }

    /**
     * @param  array<string, string|null>  $snapshot
     * @param  array<int, string>|null  $keys
     * @return array<string, string|null>
     */
    protected static function filterSnapshot(array $snapshot, ?array $keys = null): array
    {
        if ($keys === null) {
            return $snapshot;
        }

        return collect($keys)
            ->filter(fn (string $key): bool => array_key_exists($key, $snapshot))
            ->mapWithKeys(fn (string $key): array => [$key => $snapshot[$key]])
            ->all();
    }

    protected static function resolveDepartmentName(mixed $id): ?string
    {
        if ($id === null || $id === '') {
            return null;
        }

        return Department::query()->find($id)?->name;
    }

    protected static function resolvePositionName(mixed $id): ?string
    {
        if ($id === null || $id === '') {
            return null;
        }

        return Position::query()->find($id)?->name;
    }

    protected static function resolveEmploymentTypeName(mixed $id): ?string
    {
        if ($id === null || $id === '') {
            return null;
        }

        return EmploymentType::query()->find($id)?->name;
    }

    protected static function resolveEmploymentStatusName(mixed $id): ?string
    {
        if ($id === null || $id === '') {
            return null;
        }

        return EmploymentStatus::query()->find($id)?->name;
    }

    protected static function resolveWorkScheduleName(mixed $id): ?string
    {
        if ($id === null || $id === '') {
            return null;
        }

        return WorkSchedule::query()->find($id)?->name;
    }

    protected static function formatDate(mixed $value): ?string
    {
        if ($value instanceof CarbonInterface) {
            return $value->format('M d, Y');
        }

        if ($value === null || $value === '') {
            return null;
        }

        return now()->parse($value)->format('M d, Y');
    }

    protected static function formatActiveStatus(mixed $value): string
    {
        return (bool) $value ? 'Active' : 'Archived';
    }

    /**
     * @param  array<string, string|null>  $beforeValues
     * @param  array<string, string|null>  $afterValues
     */
    protected static function createHistory(
        Employee $employee,
        string $eventType,
        string $title,
        ?string $description,
        mixed $effectiveDate = null,
        array $beforeValues = [],
        array $afterValues = [],
        ?string $sourceType = null,
        ?int $sourceId = null,
        ?int $recordedBy = null,
    ): void {
        EmployeeHistory::query()->create([
            'employee_id' => $employee->id,
            'event_type' => $eventType,
            'title' => $title,
            'description' => $description,
            'effective_date' => $effectiveDate,
            'before_values' => $beforeValues === [] ? null : $beforeValues,
            'after_values' => $afterValues === [] ? null : $afterValues,
            'source_type' => $sourceType,
            'source_id' => $sourceId,
            'recorded_by' => $recordedBy ?? auth()->id(),
        ]);
    }
}
