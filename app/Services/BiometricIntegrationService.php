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
     * ZKTeco command codes (simplified subset)
     */
    private const CMD_CONNECT = 1000;

    private const CMD_DISCONNECT = 1001;

    private const CMD_GET_ATT_LOG = 1500;

    private const CMD_ACK_OK = 2000;

    /**
     * Sync attendance logs from a device via TCP
     */
    public function syncDevice(BiometricDevice $device): int
    {
        if ($device->protocol !== 'poll' || ! $device->ip_address) {
            return 0;
        }

        $socket = @fsockopen($device->ip_address, $device->port, $errno, $errstr, 5);

        if (! $socket) {
            Log::error("Biometric sync failed for {$device->name}: {$errstr} ({$errno})");

            return 0;
        }

        $newLogsCount = 0;

        try {
            $this->sendCommand($socket, self::CMD_CONNECT);
            $this->readResponse($socket);

            $this->sendCommand($socket, self::CMD_GET_ATT_LOG);
            $rawData = $this->readResponse($socket);

            $logs = $this->parseAttendanceLogs($rawData);

            foreach ($logs as $log) {
                try {
                    $timestamp = Carbon::parse($log['timestamp']);

                    $this->processLog(
                        device: $device,
                        externalId: $log['uid'],
                        timestamp: $timestamp,
                        punchType: $log['type'],
                        verifyMode: $log['verify_mode'] ?? null,
                        payload: $log,
                    );

                    $newLogsCount++;
                } catch (\Exception $e) {
                    Log::warning("Failed to process log entry: {$e->getMessage()}");
                }
            }

            $this->sendCommand($socket, self::CMD_DISCONNECT);
        } catch (\Exception $e) {
            Log::error("Biometric sync error for {$device->name}: {$e->getMessage()}");
        } finally {
            $device->update(['last_sync_at' => now()]);
            fclose($socket);
        }

        return $newLogsCount;
    }

    /**
     * Parse ZKTeco attendance log binary data into structured records.
     *
     * Each record is 40 bytes:
     *   - 4 bytes: UID (employee ID number on the device)
     *   - 4 bytes: Verify mode
     *   - 4 bytes: IO mode (0=check-in, 1=check-out, etc.)
     *   - 4 bytes: Work code
     *   - 4 bytes: Reserved
     *   - 16 bytes: Timestamp (YYYYMMDDHHMMSS format in ASCII)
     *   - 4 bytes: Reserved
     */
    private function parseAttendanceLogs(string $rawData): array
    {
        $logs = [];
        $recordSize = 40;
        $length = strlen($rawData);

        for ($offset = 0; $offset + $recordSize <= $length; $offset += $recordSize) {
            $record = substr($rawData, $offset, $recordSize);

            $uid = unpack('V', substr($record, 0, 4))[1];
            $verifyMode = unpack('V', substr($record, 4, 4))[1];
            $ioMode = unpack('V', substr($record, 8, 4))[1];
            $timestampRaw = trim(substr($record, 16, 16));

            if ($uid === 0 || empty($timestampRaw) || $timestampRaw === '0') {
                continue;
            }

            try {
                $timestamp = Carbon::createFromFormat('YmdHis', $timestampRaw);
            } catch (\Exception) {
                continue;
            }

            $logs[] = [
                'uid' => (string) $uid,
                'verify_mode' => (string) $verifyMode,
                'type' => $ioMode === 0 ? '0' : '1',
                'timestamp' => $timestamp->format('Y-m-d H:i:s'),
            ];
        }

        return $logs;
    }

    /**
     * Send a command packet (ZKTeco standard header + command code)
     */
    private function sendCommand($socket, int $command): void
    {
        $buf = pack('V*', 0, 0, 0, 0, 0, 0, 0, 0, 0, $command, 0, 0, 0, 0, 0, 0, 0);
        fwrite($socket, $buf);
    }

    /**
     * Read response from the device, returning the payload portion
     */
    private function readResponse($socket): string
    {
        $header = fread($socket, 8);

        if ($header === false || strlen($header) < 8) {
            return '';
        }

        $headerData = unpack('Vsize/Vcommand', $header);

        $payloadSize = max(0, ($headerData['size'] ?? 0) - 8);

        if ($payloadSize > 0) {
            return fread($socket, $payloadSize) ?: '';
        }

        return '';
    }

    /**
     * Process a single attendance log record
     */
    public function processLog(BiometricDevice $device, string $externalId, Carbon $timestamp, string $punchType, ?string $verifyMode = null, array $payload = []): void
    {
        $exists = BiometricRawLog::query()->where('biometric_device_id', $device->id)
            ->where('employee_external_id', $externalId)
            ->where('timestamp', $timestamp)
            ->exists();

        if ($exists) {
            return;
        }

        $rawLog = BiometricRawLog::query()->create([
            'biometric_device_id' => $device->id,
            'employee_external_id' => $externalId,
            'timestamp' => $timestamp,
            'punch_type' => $punchType,
            'verify_mode' => $verifyMode,
            'raw_payload' => $payload,
        ]);

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
