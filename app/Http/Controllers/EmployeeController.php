<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeStoreRequest;
use App\Http\Requests\EmployeeUpdateRequest;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    public function index(): Response
    {
        $employees = Employee::query()
            ->with(['department', 'position', 'employmentType', 'employmentStatus'])
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get()
            ->map(fn (Employee $employee): array => $this->mapEmployee($employee));

        return Inertia::render('employees/index', [
            'employees' => $employees,
        ]);
    }

    public function create(): Response
    {
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
        ]);
    }

    public function store(EmployeeStoreRequest $request): RedirectResponse
    {
        Employee::query()->create([
            ...$request->validated(),
            'email' => $request->string('email')->trim()->value() ?: null,
            'phone' => $request->string('phone')->trim()->value() ?: null,
            'middle_name' => $request->string('middle_name')->trim()->value() ?: null,
            'suffix' => $request->string('suffix')->trim()->value() ?: null,
        ]);

        return to_route('employees.index');
    }

    public function show(Employee $employee): Response
    {
        $employee->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
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
            'documents' => $employee->documents
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
                ->map(fn (PersonnelMovement $m): array => [
                    'id' => $m->id,
                    'movement_type' => $m->movementType->name,
                    'effective_date' => $m->effective_date->format('M d, Y'),
                    'order_number' => $m->order_number,
                    'from_department' => $m->fromDepartment?->name,
                    'to_department' => $m->toDepartment?->name,
                    'from_position' => $m->fromPosition?->name,
                    'to_position' => $m->toPosition?->name,
                    'from_employment_status' => $m->fromEmploymentStatus?->name,
                    'to_employment_status' => $m->toEmploymentStatus?->name,
                    'recorded_by' => $m->recordedBy?->name,
                ]),
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
        $employee->load(['department', 'position', 'employmentType', 'employmentStatus']);

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
        ]);
    }

    public function update(EmployeeUpdateRequest $request, Employee $employee): RedirectResponse
    {
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
        $employee->update([
            'is_active' => false,
            'archived_at' => now(),
        ]);

        return to_route('employees.show', $employee);
    }

    public function restore(Employee $employee): RedirectResponse
    {
        $employee->update([
            'is_active' => true,
            'archived_at' => null,
        ]);

        return to_route('employees.show', $employee);
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
            'employee_number' => $employee->employee_number,
            'first_name' => $employee->first_name,
            'middle_name' => $employee->middle_name,
            'last_name' => $employee->last_name,
            'suffix' => $employee->suffix,
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
}
