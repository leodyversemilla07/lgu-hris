<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeeCompensationUpdateRequest;
use App\Http\Requests\EmployeeCompensationUpsertRequest;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\SalaryGrade;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeCompensationController extends Controller
{
    public function create(Employee $employee): Response
    {
        $this->authorize('update', $employee);

        $salaryGrades = SalaryGrade::query()
            ->orderBy('grade')
            ->orderBy('step')
            ->get()
            ->groupBy('grade')
            ->map(fn ($steps, $grade) => [
                'grade' => $grade,
                'steps' => $steps->map(fn (SalaryGrade $salaryGrade): array => [
                    'value' => (string) $salaryGrade->id,
                    'step' => $salaryGrade->step,
                    'monthly_salary' => number_format((float) $salaryGrade->monthly_salary, 2),
                    'monthly_salary_raw' => (float) $salaryGrade->monthly_salary,
                ])->values(),
            ])
            ->values();

        $current = $employee->compensations()
            ->with('salaryGrade')
            ->latest('effective_date')
            ->first();

        return Inertia::render('employees/compensation', [
            'employee' => [
                'id' => $employee->id,
                'uuid' => $employee->uuid,
                'full_name' => "{$employee->last_name}, {$employee->first_name}",
                'employee_number' => $employee->employee_number,
            ],
            'salaryGrades' => $salaryGrades,
            'current' => $current ? [
                'id' => $current->id,
                'salary_grade_id' => (string) $current->salary_grade_id,
                'grade' => $current->salaryGrade->grade,
                'step' => $current->salaryGrade->step,
                'monthly_salary' => number_format((float) $current->salaryGrade->monthly_salary, 2),
                'effective_date' => $current->effective_date->format('Y-m-d'),
                'allowances' => $current->allowances,
                'deductions' => $current->deductions,
                'notes' => $current->notes,
            ] : null,
        ]);
    }

    public function store(EmployeeCompensationUpsertRequest $request, Employee $employee): RedirectResponse
    {
        $this->authorize('update', $employee);

        EmployeeCompensation::query()->create([
            'employee_id' => $employee->id,
            'salary_grade_id' => $request->integer('salary_grade_id'),
            'effective_date' => $request->date('effective_date'),
            'allowances' => $request->input('allowances', 0),
            'deductions' => $request->input('deductions', 0),
            'notes' => $request->string('notes')->trim()->value() ?: null,
            'recorded_by' => $request->user()->id,
        ]);

        return to_route('employees.show', $employee);
    }

    public function edit(Employee $employee, EmployeeCompensation $compensation): Response
    {
        $this->authorize('update', $employee);

        $salaryGrades = SalaryGrade::query()
            ->orderBy('grade')
            ->orderBy('step')
            ->get()
            ->groupBy('grade')
            ->map(fn ($steps, $grade) => [
                'grade' => $grade,
                'steps' => $steps->map(fn (SalaryGrade $salaryGrade): array => [
                    'value' => (string) $salaryGrade->id,
                    'step' => $salaryGrade->step,
                    'monthly_salary' => number_format((float) $salaryGrade->monthly_salary, 2),
                    'monthly_salary_raw' => (float) $salaryGrade->monthly_salary,
                ])->values(),
            ])
            ->values();

        $compensation->load('salaryGrade');

        return Inertia::render('employees/compensation-edit', [
            'employee' => [
                'id' => $employee->id,
                'uuid' => $employee->uuid,
                'full_name' => "{$employee->last_name}, {$employee->first_name}",
                'employee_number' => $employee->employee_number,
            ],
            'salaryGrades' => $salaryGrades,
            'compensation' => [
                'id' => $compensation->id,
                'salary_grade_id' => (string) $compensation->salary_grade_id,
                'grade' => $compensation->salaryGrade->grade,
                'step' => $compensation->salaryGrade->step,
                'monthly_salary' => number_format((float) $compensation->salaryGrade->monthly_salary, 2),
                'effective_date' => $compensation->effective_date->format('Y-m-d'),
                'allowances' => $compensation->allowances,
                'deductions' => $compensation->deductions,
                'notes' => $compensation->notes,
            ],
        ]);
    }

    public function update(EmployeeCompensationUpdateRequest $request, Employee $employee, EmployeeCompensation $compensation): RedirectResponse
    {
        $this->authorize('update', $employee);

        $compensation->update(
            $request->validated(),
        );

        return to_route('employees.show', $employee);
    }

    public function destroy(Employee $employee, EmployeeCompensation $compensation): RedirectResponse
    {
        $this->authorize('update', $employee);

        $compensation->delete();

        return to_route('employees.show', $employee);
    }
}
