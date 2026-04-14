<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\BiometricDevice;
use App\Models\BiometricRawLog;
use App\Models\Employee;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BiometricIntegrationService
{
    /**
     * Poll a device for new logs via TCP/IP (ZKTeco Protocol)
     *
     * NOTE: This is a simplified implementation of the ZKTeco UDP/TCP protocol.
     * In a full production environment, we'd use a dedicated library or a C++ bridge.
     */
    public function syncDevice(BiometricDevice $device): int
    {
        if ($device->protocol !== 'poll' || ! $device->ip_address) {
            return 0;
        }

        // 1. Connect to device
        $socket = @fsockopen($device->ip_address, $device->port, $errno, $errstr, 5);

        if (! $socket) {
            Log::error("Biometric sync failed for {$device->name}: {$errstr} ({$errno})");

            return 0;
        }

        // 2. Send 'Get Logs' command (ZKTeco binary packet)
        // This is a placeholder for the binary handshake and data retrieval
        // Real implementation would involve pack('v*', ...) and checksums

        // For the sake of this implementation, we assume we've received $logs
        $newLogsCount = 0;

        // 3. Process logs (Mocking the data retrieval loop)
        /*
        foreach ($logs as $log) {
            $this->processLog($device, $log['uid'], $log['timestamp'], $log['type']);
            $newLogsCount++;
        }
        */

        $device->update(['last_sync_at' => now()]);
        fclose($socket);

        return $newLogsCount;
    }

    /**
     * Standard processing logic for both Push and Poll
     */
    public function processLog(BiometricDevice $device, string $externalId, Carbon $timestamp, string $punchType, ?string $verifyMode = null, array $payload = []): void
    {
        // 1. Check if we already have this log to prevent duplicates
        $exists = BiometricRawLog::query()->where('biometric_device_id', $device->id)
            ->where('employee_external_id', $externalId)
            ->where('timestamp', $timestamp)
            ->exists();

        if ($exists) {
            return;
        }

        // 2. Save Raw Log
        $rawLog = BiometricRawLog::query()->create([
            'biometric_device_id' => $device->id,
            'employee_external_id' => $externalId,
            'timestamp' => $timestamp,
            'punch_type' => $punchType,
            'verify_mode' => $verifyMode,
            'raw_payload' => $payload,
        ]);

        // 3. Sync to Attendance System
        $employee = Employee::query()->where('employee_number', $externalId)->first();

        if ($employee) {
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
            $attendance->remarks = "Biometric Sync: {$device->name}";

            if (! $attendance->exists && empty($attendance->uuid)) {
                $attendance->uuid = (string) Str::uuid();
            }

            $attendance->save();

            $rawLog->update(['is_processed' => true]);
        }
    }
}
