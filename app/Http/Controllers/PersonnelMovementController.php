<?php

namespace App\Http\Controllers;

use App\Http\Requests\PersonnelMovementStoreRequest;
use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PersonnelMovementController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = PersonnelMovement::query()
            ->with(['employee', 'movementType'])
            ->orderByDesc('effective_date')
            ->orderByDesc('id');

        $employeeQuery = Employee::query()
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($user->hasRole('Department Head')) {
            $departmentId = $user->managed_department_id;

            if ($departmentId !== null) {
                $query->whereHas('employee', fn ($builder) => $builder->where('department_id', $departmentId));
                $employeeQuery->where('department_id', $departmentId);
            } else {
                $query->whereRaw('1 = 0');
                $employeeQuery->whereRaw('1 = 0');
            }
        }

        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        if ($typeId = $request->query('movement_type_id')) {
            $query->where('movement_type_id', $typeId);
        }

        $movements = $query->get()->map(
            fn (PersonnelMovement $movement): array => $this->mapMovement($movement),
        );

        $employees = $employeeQuery
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (Employee $employee): array => [
                'value' => (string) $employee->id,
                'label' => "{$employee->last_name}, {$employee->first_name}",
            ]);

        $movementTypes = MovementType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (MovementType $movementType): array => [
                'value' => (string) $movementType->id,
                'label' => $movementType->name,
            ]);

        return Inertia::render('personnel-movements/index', [
            'movements' => $movements,
            'employees' => $employees,
            'movementTypes' => $movementTypes,
            'filters' => $request->only(['employee_id', 'movement_type_id']),
        ]);
    }

    public function create(Request $request): Response
    {
        return Inertia::render('personnel-movements/create', [
            'employees' => Employee::query()
                ->where('is_active', true)
                ->orderBy('last_name')
                ->get(['id', 'first_name', 'last_name', 'employee_number',
                    'department_id', 'position_id', 'employment_status_id'])
                ->map(fn (Employee $employee): array => [
                    'value' => (string) $employee->id,
                    'label' => "{$employee->last_name}, {$employee->first_name}",
                    'employee_number' => $employee->employee_number,
                    'department_id' => (string) $employee->department_id,
                    'position_id' => (string) $employee->position_id,
                    'employment_status_id' => (string) $employee->employment_status_id,
                ]),
            'movementTypes' => MovementType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (MovementType $movementType): array => [
                    'value' => (string) $movementType->id,
                    'label' => $movementType->name,
                ]),
            'departments' => Department::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Department $department): array => [
                    'value' => (string) $department->id,
                    'label' => $department->name,
                ]),
            'positions' => Position::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Position $position): array => [
                    'value' => (string) $position->id,
                    'label' => $position->name,
                ]),
            'employmentStatuses' => EmploymentStatus::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (EmploymentStatus $employmentStatus): array => [
                    'value' => (string) $employmentStatus->id,
                    'label' => $employmentStatus->name,
                ]),
            'prefillEmployeeId' => $request->query('employee_id', ''),
        ]);
    }

    public function store(PersonnelMovementStoreRequest $request): RedirectResponse
    {
        $nullable = fn (string $key): ?int => $request->filled($key) && $request->input($key) !== 'none'
            ? $request->integer($key)
            : null;

        $movement = PersonnelMovement::query()->create([
            'employee_id' => $request->integer('employee_id'),
            'movement_type_id' => $request->integer('movement_type_id'),
            'effective_date' => $request->date('effective_date'),
            'from_department_id' => $nullable('from_department_id'),
            'to_department_id' => $nullable('to_department_id'),
            'from_position_id' => $nullable('from_position_id'),
            'to_position_id' => $nullable('to_position_id'),
            'from_employment_status_id' => $nullable('from_employment_status_id'),
            'to_employment_status_id' => $nullable('to_employment_status_id'),
            'order_number' => $request->string('order_number')->trim()->value() ?: null,
            'remarks' => $request->string('remarks')->trim()->value() ?: null,
            'recorded_by' => $request->user()->id,
        ]);

        return to_route('personnel-movements.show', $movement);
    }

    public function show(Request $request, PersonnelMovement $personnelMovement): Response
    {
        $personnelMovement->load([
            'employee',
            'movementType',
            'fromDepartment',
            'toDepartment',
            'fromPosition',
            'toPosition',
            'fromEmploymentStatus',
            'toEmploymentStatus',
            'recordedBy',
        ]);

        if ($request->user()->hasRole('Department Head')) {
            abort_unless(
                $request->user()->managed_department_id !== null
                && $personnelMovement->employee?->department_id === $request->user()->managed_department_id,
                403,
            );
        }

        return Inertia::render('personnel-movements/show', [
            'movement' => $this->mapMovementDetail($personnelMovement),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapMovement(PersonnelMovement $movement): array
    {
        return [
            'id' => $movement->id,
            'employee_id' => $movement->employee_id,
            'employee_name' => "{$movement->employee->last_name}, {$movement->employee->first_name}",
            'employee_number' => $movement->employee->employee_number,
            'movement_type' => $movement->movementType->name,
            'effective_date' => $movement->effective_date->format('M d, Y'),
            'order_number' => $movement->order_number,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapMovementDetail(PersonnelMovement $movement): array
    {
        return array_merge($this->mapMovement($movement), [
            'movement_type_id' => (string) $movement->movement_type_id,
            'from_department' => $movement->fromDepartment?->name,
            'to_department' => $movement->toDepartment?->name,
            'from_position' => $movement->fromPosition?->name,
            'to_position' => $movement->toPosition?->name,
            'from_employment_status' => $movement->fromEmploymentStatus?->name,
            'to_employment_status' => $movement->toEmploymentStatus?->name,
            'remarks' => $movement->remarks,
            'recorded_by' => $movement->recordedBy?->name,
            'recorded_at' => $movement->created_at->format('M d, Y g:i A'),
        ]);
    }
}
