<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceLogStoreRequest;
use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AttendanceController extends Controller
{
    public function index(Request $request): Response
    {
        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);
        $employeeId = $request->query('employee_id');

        $query = AttendanceSummary::query()
            ->with('employee')
            ->where('year', $year)
            ->where('month', $month)
            ->orderByDesc('updated_at');

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $summaries = $query->get()->map(
            fn (AttendanceSummary $s): array => $this->mapSummary($s),
        );

        $employees = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $e): array => [
                'value' => (string) $e->id,
                'label' => "{$e->last_name}, {$e->first_name}",
                'employee_number' => $e->employee_number,
            ]);

        return Inertia::render('attendance/index', [
            'summaries' => $summaries,
            'employees' => $employees,
            'filters' => [
                'year' => $year,
                'month' => $month,
                'employee_id' => $employeeId ?? '',
            ],
        ]);
    }

    public function create(Request $request): Response
    {
        $employees = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $e): array => [
                'value' => (string) $e->id,
                'label' => "{$e->last_name}, {$e->first_name} ({$e->employee_number})",
            ]);

        return Inertia::render('attendance/log', [
            'employees' => $employees,
            'prefillEmployeeId' => $request->query('employee_id', ''),
            'prefillDate' => $request->query('date', now()->format('Y-m-d')),
        ]);
    }

    public function store(AttendanceLogStoreRequest $request): RedirectResponse
    {
        $log = AttendanceLog::query()->create([
            'employee_id' => $request->integer('employee_id'),
            'log_date' => $request->date('log_date'),
            'time_in' => $request->input('time_in') ?: null,
            'time_out' => $request->input('time_out') ?: null,
            'status' => $request->input('status'),
            'minutes_late' => $request->integer('minutes_late', 0),
            'minutes_undertime' => $request->integer('minutes_undertime', 0),
            'remarks' => $request->string('remarks')->trim()->value() ?: null,
            'source' => 'manual',
            'recorded_by' => $request->user()->id,
        ]);

        $this->recomputeSummary($log->employee_id, $log->log_date->year, $log->log_date->month);

        return to_route('attendance.index');
    }

    public function bulkStore(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'rows' => ['required', 'array', 'min:1', 'max:100'],
            'rows.*.employee_id' => ['required', 'integer', 'exists:employees,id'],
            'rows.*.log_date' => ['required', 'date'],
            'rows.*.status' => ['required', 'in:present,absent,leave,holiday,rest_day,half_day'],
            'rows.*.time_in' => ['nullable', 'date_format:H:i'],
            'rows.*.time_out' => ['nullable', 'date_format:H:i'],
            'rows.*.minutes_late' => ['integer', 'min:0'],
            'rows.*.minutes_undertime' => ['integer', 'min:0'],
            'rows.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $affected = [];

        foreach ($validated['rows'] as $row) {
            AttendanceLog::query()->updateOrCreate(
                [
                    'employee_id' => $row['employee_id'],
                    'log_date' => $row['log_date'],
                ],
                [
                    'time_in' => $row['time_in'] ?? null,
                    'time_out' => $row['time_out'] ?? null,
                    'status' => $row['status'],
                    'minutes_late' => $row['minutes_late'] ?? 0,
                    'minutes_undertime' => $row['minutes_undertime'] ?? 0,
                    'remarks' => isset($row['remarks']) && $row['remarks'] !== '' ? $row['remarks'] : null,
                    'source' => 'import',
                    'recorded_by' => $request->user()->id,
                ],
            );

            $date = \Carbon\Carbon::parse($row['log_date']);
            $affected[$row['employee_id']][$date->year.'-'.$date->month] = [
                'year' => $date->year,
                'month' => $date->month,
            ];
        }

        foreach ($affected as $empId => $periods) {
            foreach ($periods as $period) {
                $this->recomputeSummary($empId, $period['year'], $period['month']);
            }
        }

        return to_route('attendance.index');
    }

    private function recomputeSummary(int $employeeId, int $year, int $month): void
    {
        $logs = AttendanceLog::query()
            ->where('employee_id', $employeeId)
            ->whereYear('log_date', $year)
            ->whereMonth('log_date', $month)
            ->get();

        AttendanceSummary::query()->updateOrCreate(
            ['employee_id' => $employeeId, 'year' => $year, 'month' => $month],
            [
                'days_present' => $logs->whereIn('status', ['present', 'half_day'])->count(),
                'days_absent' => $logs->where('status', 'absent')->count(),
                'days_leave' => $logs->where('status', 'leave')->count(),
                'days_holiday' => $logs->where('status', 'holiday')->count(),
                'days_rest_day' => $logs->where('status', 'rest_day')->count(),
                'total_late_minutes' => $logs->sum('minutes_late'),
                'total_undertime_minutes' => $logs->sum('minutes_undertime'),
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSummary(AttendanceSummary $s): array
    {
        return [
            'id' => $s->id,
            'employee_id' => $s->employee_id,
            'employee_name' => "{$s->employee->last_name}, {$s->employee->first_name}",
            'employee_number' => $s->employee->employee_number,
            'year' => $s->year,
            'month' => $s->month,
            'days_present' => $s->days_present,
            'days_absent' => $s->days_absent,
            'days_leave' => $s->days_leave,
            'days_holiday' => $s->days_holiday,
            'days_rest_day' => $s->days_rest_day,
            'total_late_minutes' => $s->total_late_minutes,
            'total_undertime_minutes' => $s->total_undertime_minutes,
        ];
    }
}
