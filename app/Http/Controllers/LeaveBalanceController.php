<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LeaveBalanceController extends Controller
{
    public function index(): Response
    {
        $year = now()->year;

        $employees = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'employee_number']);

        $leaveTypes = LeaveType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'max_days_per_year']);

        $existingBalances = LeaveBalance::query()
            ->where('year', $year)
            ->get()
            ->keyBy(fn (LeaveBalance $b) => "{$b->employee_id}_{$b->leave_type_id}");

        $rows = [];
        foreach ($employees as $employee) {
            foreach ($leaveTypes as $leaveType) {
                $key = "{$employee->id}_{$leaveType->id}";
                $balance = $existingBalances->get($key);
                $rows[] = [
                    'employee_id' => (string) $employee->id,
                    'employee_name' => "{$employee->last_name}, {$employee->first_name}",
                    'employee_number' => $employee->employee_number,
                    'leave_type_id' => (string) $leaveType->id,
                    'leave_type' => $leaveType->name,
                    'max_days_per_year' => $leaveType->max_days_per_year,
                    'total_days' => $balance ? (float) $balance->total_days : 0.0,
                    'used_days' => $balance ? (float) $balance->used_days : 0.0,
                    'remaining_days' => $balance ? $balance->remainingDays() : 0.0,
                    'balance_id' => $balance?->id,
                ];
            }
        }

        return Inertia::render('leave/balances', [
            'rows' => $rows,
            'year' => $year,
            'leaveTypes' => $leaveTypes->map(fn (LeaveType $lt): array => [
                'value' => (string) $lt->id,
                'label' => $lt->name,
            ]),
        ]);
    }

    public function upsert(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'leave_type_id' => ['required', 'integer', 'exists:leave_types,id'],
            'year' => ['required', 'integer', 'min:2000', 'max:2100'],
            'total_days' => ['required', 'numeric', 'min:0', 'max:365'],
        ]);

        LeaveBalance::query()->updateOrCreate(
            [
                'employee_id' => $validated['employee_id'],
                'leave_type_id' => $validated['leave_type_id'],
                'year' => $validated['year'],
            ],
            ['total_days' => $validated['total_days']],
        );

        return redirect()->back();
    }
}
