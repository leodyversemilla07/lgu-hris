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
        $query = PersonnelMovement::query()
            ->with(['employee', 'movementType'])
            ->orderByDesc('effective_date')
            ->orderByDesc('id');

        if ($employeeId = $request->query('employee_id')) {
            $query->where('employee_id', $employeeId);
        }

        if ($typeId = $request->query('movement_type_id')) {
            $query->where('movement_type_id', $typeId);
        }

        $movements = $query->get()->map(
            fn (PersonnelMovement $m): array => $this->mapMovement($m),
        );

        $employees = Employee::query()
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name'])
            ->map(fn (Employee $e): array => [
                'value' => (string) $e->id,
                'label' => "{$e->last_name}, {$e->first_name}",
            ]);

        $movementTypes = MovementType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name'])
            ->map(fn (MovementType $mt): array => [
                'value' => (string) $mt->id,
                'label' => $mt->name,
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
                ->map(fn (Employee $e): array => [
                    'value' => (string) $e->id,
                    'label' => "{$e->last_name}, {$e->first_name}",
                    'employee_number' => $e->employee_number,
                    'department_id' => (string) $e->department_id,
                    'position_id' => (string) $e->position_id,
                    'employment_status_id' => (string) $e->employment_status_id,
                ]),
            'movementTypes' => MovementType::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (MovementType $mt): array => [
                    'value' => (string) $mt->id,
                    'label' => $mt->name,
                ]),
            'departments' => Department::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Department $d): array => [
                    'value' => (string) $d->id,
                    'label' => $d->name,
                ]),
            'positions' => Position::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (Position $p): array => [
                    'value' => (string) $p->id,
                    'label' => $p->name,
                ]),
            'employmentStatuses' => EmploymentStatus::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name'])
                ->map(fn (EmploymentStatus $es): array => [
                    'value' => (string) $es->id,
                    'label' => $es->name,
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

    public function show(PersonnelMovement $personnelMovement): Response
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

        return Inertia::render('personnel-movements/show', [
            'movement' => $this->mapMovementDetail($personnelMovement),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapMovement(PersonnelMovement $m): array
    {
        return [
            'id' => $m->id,
            'employee_id' => $m->employee_id,
            'employee_name' => "{$m->employee->last_name}, {$m->employee->first_name}",
            'employee_number' => $m->employee->employee_number,
            'movement_type' => $m->movementType->name,
            'effective_date' => $m->effective_date->format('M d, Y'),
            'order_number' => $m->order_number,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapMovementDetail(PersonnelMovement $m): array
    {
        return array_merge($this->mapMovement($m), [
            'movement_type_id' => (string) $m->movement_type_id,
            'from_department' => $m->fromDepartment?->name,
            'to_department' => $m->toDepartment?->name,
            'from_position' => $m->fromPosition?->name,
            'to_position' => $m->toPosition?->name,
            'from_employment_status' => $m->fromEmploymentStatus?->name,
            'to_employment_status' => $m->toEmploymentStatus?->name,
            'remarks' => $m->remarks,
            'recorded_by' => $m->recordedBy?->name,
            'recorded_at' => $m->created_at->format('M d, Y g:i A'),
        ]);
    }
}
