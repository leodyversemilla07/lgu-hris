<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EmployeeHistory;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\User;
use App\Models\WorkSchedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Employee::class);

        $user = auth()->user();
        $query = Employee::query()
            ->with(['department', 'position', 'employmentType', 'employmentStatus', 'workSchedule'])
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($user->hasRole('Department Head') && $user->managed_department_id) {
            $query->where('department_id', $user->managed_department_id);
        }

        $employees = $query->get()
            ->map(fn (Employee $employee): array => $this->mapEmployee($employee));

        return Inertia::render('employees/index', [
            'employees' => $employees,
        ]);
    }

    public function create(): Response
    {
        $this->authorize('create', Employee::class);

        return Inertia::render('employees/create', [
            'departments' => Department::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Department $department): array => [
                    'value' => (string) $department->id,
                    'label' => $department->name,
                ]),
            'positions' => Position::query()
                ->with('department:id,name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'department_id', 'name'])
                ->map(fn (Position $position): array => [
                    'value' => (string) $position->id,
                    'label' => $position->name,
                    'department' => $position->department?->name,
                ]),
            'employmentTypes' => EmploymentType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (EmploymentType $employmentType): array => [
                    'value' => (string) $employmentType->id,
                    'label' => $employmentType->name,
                ]),
            'employmentStatuses' => EmploymentStatus::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (EmploymentStatus $employmentStatus): array => [
                    'value' => (string) $employmentStatus->id,
                    'label' => $employmentStatus->name,
                ]),
            'workSchedules' => WorkSchedule::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'time_in', 'time_out', 'work_hours_per_day'])
                ->map(fn (WorkSchedule $workSchedule): array => [
                    'value' => (string) $workSchedule->id,
                    'label' => $workSchedule->name,
                    'time_in' => substr($workSchedule->time_in, 0, 5),
                    'time_out' => substr($workSchedule->time_out, 0, 5),
                    'work_hours_per_day' => (float) $workSchedule->work_hours_per_day,
                ]),
        ]);
    }

    public function store(EmployeeStoreRequest $request): RedirectResponse
    {
        $this->authorize('create', Employee::class);

        Employee::query()->create([
            ...$request->validated(),
            'email' => $request->string('email')->trim()->value() ?: null,
            'phone' => $request->string('phone')->trim()->value() ?: null,
            'middle_name' => $request->string('middle_name')->trim()->value() ?: null,
            'suffix' => $request->string('suffix')->trim()->value() ?: null,
        ]);

        return to_route('employees.index');
    }

    public function show(Request $request, Employee $employee): Response
    {
        $this->authorize('view', $employee);

        $user = $request->user();

        $employee->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
            'workSchedule',
            'documents.documentType',
            'documents.uploader',
            'movements.movementType',
            'movements.fromDepartment',
            'movements.toDepartment',
            'movements.fromPosition',
            'movements.toPosition',
            'movements.fromEmploymentStatus',
            'movements.toEmploymentStatus',
            'movements.recordedBy',
            'compensations.salaryGrade',
            'histories.recordedBy',
        ]);

        $documentTypes = DocumentType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'is_confidential'])
            ->map(fn (DocumentType $documentType): array => [
                'value' => (string) $documentType->id,
                'label' => $documentType->name,
                'is_confidential' => $documentType->is_confidential,
            ]);

        return Inertia::render('employees/show', [
            'employee' => $this->mapEmployeeDetail($employee),
            'users' => $user->can('linkUser', $employee)
                ? User::orderBy('name')->get(['id', 'name', 'email'])->map(fn (User $linkedUser): array => [
                    'value' => (string) $linkedUser->id,
                    'label' => $linkedUser->name.' ('.$linkedUser->email.')',
                ])
                : [],
            'documents' => $employee->documents
                ->filter(fn (EmployeeDocument $document): bool => $user->can('view', $document))
                ->sortByDesc('created_at')
                ->values()
                ->map(fn (EmployeeDocument $document): array => [
                    'id' => $document->id,
                    'document_type' => $document->documentType->name,
                    'file_name' => $document->file_name,
                    'file_size_formatted' => $this->formatFileSize($document->file_size),
                    'is_confidential' => $document->is_confidential,
                    'notes' => $document->notes,
                    'uploaded_by' => $document->uploader->name,
                    'uploaded_at' => $document->created_at->format('M d, Y'),
                ]),
            'documentTypes' => $documentTypes,
            'movements' => $employee->movements
                ->sortByDesc('effective_date')
                ->values()
                ->map(fn (PersonnelMovement $movement): array => [
                    'id' => $movement->id,
                    'movement_type' => $movement->movementType->name,
                    'effective_date' => $movement->effective_date->format('M d, Y'),
                    'order_number' => $movement->order_number,
                    'from_department' => $movement->fromDepartment?->name,
                    'to_department' => $movement->toDepartment?->name,
                    'from_position' => $movement->fromPosition?->name,
                    'to_position' => $movement->toPosition?->name,
                    'from_employment_status' => $movement->fromEmploymentStatus?->name,
                    'to_employment_status' => $movement->toEmploymentStatus?->name,
                    'recorded_by' => $movement->recordedBy?->name,
                ]),
            'history' => $employee->histories
                ->sortByDesc(fn (EmployeeHistory $history): string => sprintf(
                    '%s-%s',
                    $history->effective_date?->format('Y-m-d') ?? '0000-00-00',
                    $history->created_at->format('Y-m-d H:i:s'),
                ))
                ->values()
                ->map(fn (EmployeeHistory $history): array => $this->mapHistory($history)),
            'compensation' => $employee->compensations
                ->sortByDesc('effective_date')
                ->first() ? [
                    'grade' => $employee->compensations->sortByDesc('effective_date')->first()->salaryGrade->grade,
                    'step' => $employee->compensations->sortByDesc('effective_date')->first()->salaryGrade->step,
                    'monthly_salary' => number_format((float) $employee->compensations->sortByDesc('effective_date')->first()->salaryGrade->monthly_salary, 2),
                    'allowances' => $employee->compensations->sortByDesc('effective_date')->first()->allowances,
                    'deductions' => $employee->compensations->sortByDesc('effective_date')->first()->deductions,
                    'effective_date' => $employee->compensations->sortByDesc('effective_date')->first()->effective_date->format('M d, Y'),
                ] : null,
        ]);
    }

    public function edit(Employee $employee): Response
    {
        $this->authorize('update', $employee);

        $employee->load(['department', 'position', 'employmentType', 'employmentStatus', 'workSchedule']);

        return Inertia::render('employees/edit', [
            'employee' => $this->mapEmployeeDetail($employee),
            'departments' => Department::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Department $department): array => [
                    'value' => (string) $department->id,
                    'label' => $department->name,
                ]),
            'positions' => Position::query()
                ->with('department:id,name')
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'department_id', 'name'])
                ->map(fn (Position $position): array => [
                    'value' => (string) $position->id,
                    'label' => $position->name,
                    'department' => $position->department?->name,
                ]),
            'employmentTypes' => EmploymentType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (EmploymentType $employmentType): array => [
                    'value' => (string) $employmentType->id,
                    'label' => $employmentType->name,
                ]),
            'employmentStatuses' => EmploymentStatus::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (EmploymentStatus $employmentStatus): array => [
                    'value' => (string) $employmentStatus->id,
                    'label' => $employmentStatus->name,
                ]),
            'workSchedules' => WorkSchedule::query()
                ->where(function ($query) use ($employee): void {
                    $query->where('is_active', true);

                    if ($employee->work_schedule_id !== null) {
                        $query->orWhere('id', $employee->work_schedule_id);
                    }
                })
                ->orderBy('name')
                ->get(['id', 'name', 'time_in', 'time_out', 'work_hours_per_day'])
                ->map(fn (WorkSchedule $workSchedule): array => [
                    'value' => (string) $workSchedule->id,
                    'label' => $workSchedule->name,
                    'time_in' => substr($workSchedule->time_in, 0, 5),
                    'time_out' => substr($workSchedule->time_out, 0, 5),
                    'work_hours_per_day' => (float) $workSchedule->work_hours_per_day,
                ]),
        ]);
    }

    public function update(EmployeeUpdateRequest $request, Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        $employee->update([
            ...$request->validated(),
            'email' => $request->string('email')->trim()->value() ?: null,
            'phone' => $request->string('phone')->trim()->value() ?: null,
            'middle_name' => $request->string('middle_name')->trim()->value() ?: null,
            'suffix' => $request->string('suffix')->trim()->value() ?: null,
        ]);

        return to_route('employees.show', $employee);
    }

    public function archive(Employee $employee): RedirectResponse
    {
        $this->authorize('archive', $employee);

        $employee->update([
            'is_active' => false,
            'archived_at' => now(),
        ]);

        return to_route('employees.show', $employee);
    }

    public function restore(Employee $employee): RedirectResponse
    {
        $this->authorize('restore', $employee);

        $employee->update([
            'is_active' => true,
            'archived_at' => null,
        ]);

        return to_route('employees.show', $employee);
    }

    public function linkUser(Employee $employee, Request $request): RedirectResponse
    {
        $this->authorize('linkUser', $employee);

        $request->validate([
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $userId = $request->input('user_id') ?: null;

        if ($userId) {
            $conflict = Employee::where('user_id', $userId)
                ->where('id', '!=', $employee->id)
                ->exists();

            if ($conflict) {
                return back()->with('error', 'This user account is already linked to another employee record.');
            }
        }

        $employee->update(['user_id' => $userId]);

        return back()->with('success', $userId ? 'User account linked successfully.' : 'User account unlinked.');
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapEmployee(Employee $employee): array
    {
        return [
            'id' => $employee->id,
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
     * @return array<string, mixed>
     */
    protected function mapEmployeeDetail(Employee $employee): array
    {
        return [
            'id' => $employee->id,
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

    protected function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes.' B';
        }

        if ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapHistory(EmployeeHistory $history): array
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
                ? route('personnel-movements.show', $history->source_id)
                : null,
        ];
    }
}
