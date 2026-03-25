<?php

namespace App\Services;

use App\Models\BiometricDevice;
use App\Models\BiometricRawLog;
use App\Models\Employee;
use App\Models\AttendanceLog;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

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
        if ($device->protocol !== 'poll' || !$device->ip_address) {
            return 0;
        }

        // 1. Connect to device
        $socket = @fsockopen($device->ip_address, $device->port, $errno, $errstr, 5);
        
        if (!$socket) {
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
    public function processLog(BiometricDevice $device, string $externalId, Carbon $timestamp, string $punchType, ?string $verifyMode = null, array $payload = [])
    {
        // 1. Check if we already have this log to prevent duplicates
        $exists = BiometricRawLog::where('biometric_device_id', $device->id)
            ->where('employee_external_id', $externalId)
            ->where('timestamp', $timestamp)
            ->exists();

        if ($exists) {
            return;
        }

        // 2. Save Raw Log
        $rawLog = BiometricRawLog::create([
            'biometric_device_id' => $device->id,
            'employee_external_id' => $externalId,
            'timestamp' => $timestamp,
            'punch_type' => $punchType,
            'verify_mode' => $verifyMode,
            'raw_payload' => $payload,
        ]);

        // 3. Sync to Attendance System
        $employee = Employee::where('employee_number', $externalId)->first();

        if ($employee) {
            // Determine if it's 'in' or 'out'
            // Senior Logic: If punchType is 0 (checkIn) or 1 (checkOut), use it.
            // If unknown, we can look at the employee's work schedule.
            $type = ($punchType === '0' || strtolower($punchType) === 'in') ? 'in' : 'out';

            AttendanceLog::create([
                'employee_id' => $employee->id,
                'log_time' => $timestamp,
                'type' => $type,
                'source' => 'biometric',
                'remarks' => "Biometric Sync: {$device->name}",
            ]);

            $rawLog->update(['is_processed' => true]);
        }
    }
}
