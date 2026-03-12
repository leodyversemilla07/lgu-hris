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
        $user = $request->user();
        $year = (int) $request->query('year', now()->year);
        $month = (int) $request->query('month', now()->month);
        $employeeId = $request->query('employee_id');

        $query = AttendanceSummary::query()
            ->with('employee')
            ->where('year', $year)
            ->where('month', $month)
            ->orderByDesc('updated_at');

        $employeeQuery = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name');

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

        if ($employeeId) {
            $query->where('employee_id', $employeeId);
        }

        $summaries = $query->get()->map(
            fn (AttendanceSummary $summary): array => $this->mapSummary($summary),
        );

        $employees = $employeeQuery
            ->get(['id', 'first_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $employee): array => [
                'value' => (string) $employee->id,
                'label' => "{$employee->last_name}, {$employee->first_name}",
                'employee_number' => $employee->employee_number,
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
            ->with('workSchedule:id,name,time_in,time_out')
            ->where('is_active', true)
            ->orderBy('last_name')
            ->get(['id', 'first_name', 'last_name', 'employee_number', 'work_schedule_id'])
            ->map(fn (Employee $employee): array => [
                'value' => (string) $employee->id,
                'label' => "{$employee->last_name}, {$employee->first_name} ({$employee->employee_number})",
                'work_schedule' => $employee->workSchedule ? [
                    'name' => $employee->workSchedule->name,
                    'time_in' => substr($employee->workSchedule->time_in, 0, 5),
                    'time_out' => substr($employee->workSchedule->time_out, 0, 5),
                ] : null,
            ]);

        return Inertia::render('attendance/log', [
            'employees' => $employees,
            'prefillEmployeeId' => $request->query('employee_id', ''),
            'prefillDate' => $request->query('date', now()->format('Y-m-d')),
        ]);
    }

    public function store(AttendanceLogStoreRequest $request): RedirectResponse
    {
        $employee = Employee::query()
            ->with('workSchedule:id,time_in,time_out')
            ->findOrFail($request->integer('employee_id'));

        $status = $request->string('status')->value();
        $timeIn = $this->normalizedTimeValue($request->input('time_in'), $status);
        $timeOut = $this->normalizedTimeValue($request->input('time_out'), $status);
        $metrics = $this->resolveAttendanceMetrics(
            $employee,
            $status,
            $timeIn,
            $timeOut,
            $request->input('minutes_late'),
            $request->input('minutes_undertime'),
        );

        $log = AttendanceLog::query()->create([
            'employee_id' => $employee->id,
            'log_date' => $request->date('log_date'),
            'time_in' => $timeIn,
            'time_out' => $timeOut,
            'status' => $status,
            'minutes_late' => $metrics['minutes_late'],
            'minutes_undertime' => $metrics['minutes_undertime'],
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
            'rows.*.minutes_late' => ['nullable', 'integer', 'min:0'],
            'rows.*.minutes_undertime' => ['nullable', 'integer', 'min:0'],
            'rows.*.remarks' => ['nullable', 'string', 'max:500'],
        ]);

        $employees = Employee::query()
            ->with('workSchedule:id,time_in,time_out')
            ->whereIn('id', collect($validated['rows'])->pluck('employee_id')->unique())
            ->get()
            ->keyBy('id');

        $affected = [];

        foreach ($validated['rows'] as $row) {
            $employee = $employees->get($row['employee_id']);
            $status = $row['status'];
            $timeIn = $this->normalizedTimeValue($row['time_in'] ?? null, $status);
            $timeOut = $this->normalizedTimeValue($row['time_out'] ?? null, $status);
            $metrics = $this->resolveAttendanceMetrics(
                $employee,
                $status,
                $timeIn,
                $timeOut,
                $row['minutes_late'] ?? null,
                $row['minutes_undertime'] ?? null,
            );

            AttendanceLog::query()->updateOrCreate(
                [
                    'employee_id' => $row['employee_id'],
                    'log_date' => $row['log_date'],
                ],
                [
                    'time_in' => $timeIn,
                    'time_out' => $timeOut,
                    'status' => $status,
                    'minutes_late' => $metrics['minutes_late'],
                    'minutes_undertime' => $metrics['minutes_undertime'],
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

        foreach ($affected as $employeeId => $periods) {
            foreach ($periods as $period) {
                $this->recomputeSummary($employeeId, $period['year'], $period['month']);
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
     * @return array{minutes_late: int, minutes_undertime: int}
     */
    private function resolveAttendanceMetrics(
        Employee $employee,
        string $status,
        ?string $timeIn,
        ?string $timeOut,
        mixed $minutesLateInput,
        mixed $minutesUndertimeInput,
    ): array {
        $manualLate = $this->manualMinutesValue($minutesLateInput);
        $manualUndertime = $this->manualMinutesValue($minutesUndertimeInput);

        if (! in_array($status, ['present', 'half_day'], true)) {
            return [
                'minutes_late' => $manualLate ?? 0,
                'minutes_undertime' => $manualUndertime ?? 0,
            ];
        }

        if ($manualLate !== null || $manualUndertime !== null) {
            return [
                'minutes_late' => $manualLate ?? 0,
                'minutes_undertime' => $manualUndertime ?? 0,
            ];
        }

        if (! $employee->relationLoaded('workSchedule')) {
            $employee->load('workSchedule:id,time_in,time_out');
        }

        $scheduledTimeIn = $this->timeToMinutes($employee->workSchedule?->time_in);
        $scheduledTimeOut = $this->timeToMinutes($employee->workSchedule?->time_out);
        $actualTimeIn = $this->timeToMinutes($timeIn);
        $actualTimeOut = $this->timeToMinutes($timeOut);

        if ($scheduledTimeIn === null || $scheduledTimeOut === null) {
            return [
                'minutes_late' => 0,
                'minutes_undertime' => 0,
            ];
        }

        return [
            'minutes_late' => $actualTimeIn !== null ? max($actualTimeIn - $scheduledTimeIn, 0) : 0,
            'minutes_undertime' => $actualTimeOut !== null ? max($scheduledTimeOut - $actualTimeOut, 0) : 0,
        ];
    }

    private function normalizedTimeValue(mixed $value, string $status): ?string
    {
        if (! in_array($status, ['present', 'half_day'], true)) {
            return null;
        }

        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }

    private function manualMinutesValue(mixed $value): ?int
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value) && trim($value) === '') {
            return null;
        }

        return max((int) $value, 0);
    }

    private function timeToMinutes(?string $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }

        [$hours, $minutes] = array_pad(explode(':', $value), 2, '0');

        return ((int) $hours * 60) + (int) $minutes;
    }

    /**
     * @return array<string, mixed>
     */
    private function mapSummary(AttendanceSummary $summary): array
    {
        return [
            'id' => $summary->id,
            'employee_id' => $summary->employee_id,
            'employee_name' => "{$summary->employee->last_name}, {$summary->employee->first_name}",
            'employee_number' => $summary->employee->employee_number,
            'year' => $summary->year,
            'month' => $summary->month,
            'days_present' => $summary->days_present,
            'days_absent' => $summary->days_absent,
            'days_leave' => $summary->days_leave,
            'days_holiday' => $summary->days_holiday,
            'days_rest_day' => $summary->days_rest_day,
            'total_late_minutes' => $summary->total_late_minutes,
            'total_undertime_minutes' => $summary->total_undertime_minutes,
        ];
    }
}
