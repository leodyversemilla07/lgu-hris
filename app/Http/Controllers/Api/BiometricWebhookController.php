<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AttendanceLog;
use App\Models\BiometricDevice;
use App\Models\BiometricRawLog;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;

class BiometricWebhookController extends Controller
{
    /**
     * Handle ZKTeco ADMS Push Protocol.
     */
    public function zkteco(Request $request): Response
    {
        $sn = $request->query('sn');
        $table = $request->query('table');

        if (! $sn) {
            return response('No SN provided', 400);
        }

        $device = BiometricDevice::query()->where('serial_number', $sn)->first();

        if (! $device) {
            return response('Unknown Device', 404);
        }

        // Handshake / Initial Request
        if ($request->isMethod('GET')) {
            return response('OK', 200)->header('Content-Type', 'text/plain');
        }

        // Processing Logs (POST)
        if ($request->isMethod('POST')) {
            $content = $request->getContent();

            if ($table === 'ATTLOG') {
                $this->processZkAttendanceLogs($device, $content);
            }

            return response('OK', 200)->header('Content-Type', 'text/plain');
        }

        return response('OK', 200);
    }

    /**
     * Handle Hikvision ISAPI webhooks.
     */
    public function hikvision(Request $request): JsonResponse
    {
        $payload = $request->all();
        $sn = $payload['serialNo'] ?? null;

        if (! $sn) {
            return response()->json(['status' => 'error', 'message' => 'No Serial Number'], 400);
        }

        $device = BiometricDevice::query()->where('serial_number', $sn)->first();

        if (! $device) {
            return response()->json(['status' => 'error', 'message' => 'Unknown Device'], 404);
        }

        // Hikvision event structure
        $event = $payload['AccessEvent'] ?? null;
        if ($event) {
            $this->saveRawLog(
                device: $device,
                externalId: $event['employeeNoString'],
                timestamp: Carbon::parse($event['dateTime']),
                punchType: $event['attendanceStatus'] === 'checkIn' ? '0' : '1',
                verifyMode: 'Face',
                payload: $payload,
            );
        }

        return response()->json(['status' => 'success']);
    }

    private function processZkAttendanceLogs(BiometricDevice $device, string $content): void
    {
        // ZKTeco ATTLOG format is usually:
        // ID\tTIMESTAMP\tSTATUS\tVERIFY\t0\t0\n
        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            $data = explode("\t", trim($line));

            if (count($data) < 2) {
                continue;
            }

            $this->saveRawLog(
                device: $device,
                externalId: $data[0],
                timestamp: Carbon::parse($data[1]),
                punchType: $data[2] ?? '0',
                verifyMode: $data[3] ?? null,
                payload: ['raw_line' => $line],
            );
        }
    }

    private function saveRawLog(BiometricDevice $device, string $externalId, Carbon $timestamp, string $punchType, ?string $verifyMode, array $payload): void
    {
        // Save to raw logs first for auditing
        $rawLog = BiometricRawLog::query()->create([
            'biometric_device_id' => $device->id,
            'employee_external_id' => $externalId,
            'timestamp' => $timestamp,
            'punch_type' => $punchType,
            'verify_mode' => $verifyMode,
            'raw_payload' => $payload,
        ]);

        // Find employee and sync to real AttendanceLog
        $employee = Employee::query()->where('employee_number', $externalId)->first();

        if ($employee) {
            $this->upsertAttendanceFromPunch($employee, $timestamp, $punchType, $device->name);
            $rawLog->update(['is_processed' => true]);
        }
    }

    private function upsertAttendanceFromPunch(Employee $employee, Carbon $timestamp, string $punchType, string $deviceName): void
    {
        $date = $timestamp->toDateString();
        $time = $timestamp->format('H:i');
        $normalizedPunchType = strtolower(trim($punchType));
        $isTimeIn = in_array($normalizedPunchType, ['0', 'in', 'checkin', 'check_in'], true);

        $attendance = AttendanceLog::query()->firstOrNew([
            'employee_id' => $employee->id,
            'log_date' => $date,
        ]);

        if ($isTimeIn) {
            $attendance->time_in = $attendance->time_in === null
                ? $time
                : min($attendance->time_in, $time);
        } else {
            $attendance->time_out = $attendance->time_out === null
                ? $time
                : max($attendance->time_out, $time);
        }

        $attendance->status = $attendance->time_in !== null && $attendance->time_out !== null
            ? 'present'
            : 'half_day';
        $attendance->minutes_late = 0;
        $attendance->minutes_undertime = 0;
        $attendance->source = 'biometric';
        $attendance->remarks = "Pushed from {$deviceName}";

        if (! $attendance->exists && empty($attendance->uuid)) {
            $attendance->uuid = (string) Str::uuid();
        }

        $attendance->save();
    }
}
