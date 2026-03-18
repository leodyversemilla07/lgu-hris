<?php

namespace App\Imports;

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class EmployeeImport implements ToCollection, WithHeadingRow, WithValidation
{
    public array $errors = [];

    public int $imported = 0;

    public int $skipped = 0;

    private Collection $departments;

    private Collection $positions;

    private Collection $empTypes;

    private Collection $empStatuses;

    public function __construct()
    {
        $this->departments = Department::where('is_active', true)->get(['id', 'name']);
        $this->positions = Position::where('is_active', true)->get(['id', 'name', 'department_id']);
        $this->empTypes = EmploymentType::where('is_active', true)->get(['id', 'name']);
        $this->empStatuses = EmploymentStatus::where('is_active', true)->get(['id', 'name']);
    }

    public function collection(Collection $rows): void
    {
        foreach ($rows as $index => $row) {
            $rowNum = $index + 2;

            try {
                $deptId = $this->resolveId($this->departments, $row['department'] ?? '');
                $posId = $this->resolveId($this->positions, $row['position'] ?? '');
                $typeId = $this->resolveId($this->empTypes, $row['employment_type'] ?? '');
                $statusId = $this->resolveId($this->empStatuses, $row['employment_status'] ?? '');

                if (! $deptId || ! $posId || ! $typeId || ! $statusId) {
                    $this->errors[] = "Row {$rowNum}: Unresolved reference (check dept/position/type/status).";
                    $this->skipped++;

                    continue;
                }

                $employeeNumber = trim((string) ($row['employee_number'] ?? ''));
                if (empty($employeeNumber)) {
                    $this->errors[] = "Row {$rowNum}: employee_number is required.";
                    $this->skipped++;

                    continue;
                }

                Employee::updateOrCreate(
                    ['employee_number' => $employeeNumber],
                    [
                        'first_name' => trim($row['first_name'] ?? ''),
                        'middle_name' => trim($row['middle_name'] ?? '') ?: null,
                        'last_name' => trim($row['last_name'] ?? ''),
                        'suffix' => trim($row['suffix'] ?? '') ?: null,
                        'sex' => trim($row['sex'] ?? '') ?: null,
                        'civil_status' => trim($row['civil_status'] ?? '') ?: null,
                        'email' => trim($row['email'] ?? '') ?: null,
                        'phone' => trim($row['phone'] ?? '') ?: null,
                        'birth_date' => $row['birth_date'] ? Carbon::parse($row['birth_date'])->toDateString() : null,
                        'address_street' => trim($row['address_street'] ?? '') ?: null,
                        'address_city' => trim($row['address_city'] ?? '') ?: null,
                        'address_province' => trim($row['address_province'] ?? '') ?: null,
                        'address_zip' => trim($row['address_zip'] ?? '') ?: null,
                        'tin' => trim($row['tin'] ?? '') ?: null,
                        'gsis_number' => trim($row['gsis_number'] ?? '') ?: null,
                        'philhealth_number' => trim($row['philhealth_number'] ?? '') ?: null,
                        'pagibig_number' => trim($row['pagibig_number'] ?? '') ?: null,
                        'sss_number' => trim($row['sss_number'] ?? '') ?: null,
                        'emergency_contact_name' => trim($row['emergency_contact_name'] ?? '') ?: null,
                        'emergency_contact_relationship' => trim($row['emergency_contact_relationship'] ?? '') ?: null,
                        'emergency_contact_phone' => trim($row['emergency_contact_phone'] ?? '') ?: null,
                        'hired_at' => $row['hired_at'] ? Carbon::parse($row['hired_at'])->toDateString() : null,
                        'department_id' => $deptId,
                        'position_id' => $posId,
                        'employment_type_id' => $typeId,
                        'employment_status_id' => $statusId,
                        'is_active' => true,
                    ],
                );

                $this->imported++;
            } catch (\Throwable $e) {
                $this->errors[] = "Row {$rowNum}: {$e->getMessage()}";
                $this->skipped++;
            }
        }
    }

    public function rules(): array
    {
        return [];
    }

    private function resolveId(Collection $items, string $name): ?int
    {
        $normalised = Str::lower(trim($name));
        if ($normalised === '') {
            return null;
        }

        return $items->first(fn ($item) => Str::lower($item->name) === $normalised
            || Str::lower($item->name ?? '') === $normalised
        )?->id;
    }
}
