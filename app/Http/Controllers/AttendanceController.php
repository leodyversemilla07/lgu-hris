<?php

namespace App\Http\Controllers;

use App\Http\Requests\AttendanceBiometricImportRequest;
use App\Http\Requests\AttendanceLogStoreRequest;
use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
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

    public function biometricImport(AttendanceBiometricImportRequest $request): RedirectResponse
    {
        $rows = $this->parseBiometricRows($request->file('file')->getRealPath());

        if ($rows->isEmpty()) {
            return to_route('attendance.create')
                ->withErrors(['file' => 'The biometric export file does not contain any data rows.']);
        }

        $employees = Employee::query()
            ->with('workSchedule:id,time_in,time_out')
            ->whereIn('employee_number', $rows->pluck('employee_number')->unique()->all())
            ->get()
            ->keyBy('employee_number');

        $imported = 0;
        $errors = [];
        $affected = [];
        $deviceName = $request->string('device_name')->trim()->value();

        foreach ($rows as $index => $row) {
            $employee = $employees->get($row['employee_number']);

            if (! $employee instanceof Employee) {
                $errors[] = 'Row '.($index + 2).": employee number {$row['employee_number']} was not found.";

                continue;
            }

            $logDate = $this->normalizeImportedDate($row['log_date']);

            if ($logDate === null) {
                $errors[] = 'Row '.($index + 2).': log_date is missing or invalid.';

                continue;
            }

            $timeIn = $this->normalizeImportedTime($row['time_in'] ?? null);
            $timeOut = $this->normalizeImportedTime($row['time_out'] ?? null);
            $status = $this->resolveImportedStatus($row['status'] ?? null, $timeIn, $timeOut);

            if ($status === null) {
                $errors[] = 'Row '.($index + 2).': provide a valid status or at least one punch time.';

                continue;
            }

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
                    'employee_id' => $employee->id,
                    'log_date' => $logDate->toDateString(),
                ],
                [
                    'time_in' => $this->normalizedTimeValue($timeIn, $status),
                    'time_out' => $this->normalizedTimeValue($timeOut, $status),
                    'status' => $status,
                    'minutes_late' => $metrics['minutes_late'],
                    'minutes_undertime' => $metrics['minutes_undertime'],
                    'remarks' => $this->buildBiometricRemarks($deviceName, $row['device_name'] ?? null, $row['remarks'] ?? null),
                    'source' => 'biometric',
                    'recorded_by' => $request->user()->id,
                ],
            );

            $affected[$employee->id][$logDate->format('Y-m')] = [
                'year' => $logDate->year,
                'month' => $logDate->month,
            ];
            $imported++;
        }

        foreach ($affected as $employeeId => $periods) {
            foreach ($periods as $period) {
                $this->recomputeSummary($employeeId, $period['year'], $period['month']);
            }
        }

        if ($imported === 0) {
            return to_route('attendance.create')
                ->withErrors(['file' => implode(' ', array_slice($errors, 0, 3))]);
        }

        $message = "Biometric import complete: {$imported} row(s) imported.";

        if (! empty($errors)) {
            $message .= ' Skipped '.count($errors).' row(s): '.implode(' | ', array_slice($errors, 0, 3));
        }

        return to_route('attendance.index')->with('success', $message);
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
     * @return Collection<int, array<string, string|null>>
     */
    private function parseBiometricRows(string $path): Collection
    {
        $handle = fopen($path, 'r');

        if ($handle === false) {
            return collect();
        }

        $headers = fgetcsv($handle);

        if (! is_array($headers)) {
            fclose($handle);

            return collect();
        }

        $normalizedHeaders = collect($headers)
            ->map(fn ($header): string => strtolower(trim((string) $header)))
            ->all();

        $rows = collect();

        while (($values = fgetcsv($handle)) !== false) {
            if ($values === [null] || $values === false) {
                continue;
            }

            $row = [];

            foreach ($normalizedHeaders as $index => $header) {
                $value = $values[$index] ?? null;
                $row[$header] = is_string($value) ? trim($value) : $value;
            }

            if (blank($row['employee_number'] ?? null) && blank($row['log_date'] ?? null)) {
                continue;
            }

            $rows->push($row);
        }

        fclose($handle);

        return $rows;
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

    private function normalizeImportedTime(?string $value): ?string
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $trimmed = trim($value);

        foreach (['H:i', 'H:i:s', 'Y-m-d H:i', 'Y-m-d H:i:s', 'm/d/Y H:i', 'm/d/Y H:i:s'] as $format) {
            try {
                return Carbon::createFromFormat($format, $trimmed)->format('H:i');
            } catch (\Throwable) {
            }
        }

        try {
            return Carbon::parse($trimmed)->format('H:i');
        } catch (\Throwable) {
            return null;
        }
    }

    private function normalizeImportedDate(?string $value): ?Carbon
    {
        if ($value === null || trim($value) === '') {
            return null;
        }

        $trimmed = trim($value);

        foreach (['Y-m-d', 'm/d/Y', 'm-d-Y', 'Y/m/d'] as $format) {
            try {
                return Carbon::createFromFormat($format, $trimmed)->startOfDay();
            } catch (\Throwable) {
            }
        }

        try {
            return Carbon::parse($trimmed)->startOfDay();
        } catch (\Throwable) {
            return null;
        }
    }

    private function resolveImportedStatus(?string $value, ?string $timeIn, ?string $timeOut): ?string
    {
        $normalized = is_string($value) ? strtolower(trim($value)) : null;

        if (in_array($normalized, ['present', 'absent', 'leave', 'holiday', 'rest_day', 'half_day'], true)) {
            return $normalized;
        }

        if ($timeIn !== null && $timeOut !== null) {
            return 'present';
        }

        if ($timeIn !== null || $timeOut !== null) {
            return 'half_day';
        }

        return null;
    }

    private function buildBiometricRemarks(?string $requestDeviceName, ?string $rowDeviceName, ?string $rowRemarks): ?string
    {
        $parts = collect([
            $requestDeviceName ? "Biometric device: {$requestDeviceName}" : null,
            $rowDeviceName ? 'Source device: '.trim($rowDeviceName) : null,
            $rowRemarks ? trim($rowRemarks) : null,
        ])->filter(fn ($value): bool => filled($value));

        return $parts->isEmpty() ? null : $parts->implode(' | ');
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
