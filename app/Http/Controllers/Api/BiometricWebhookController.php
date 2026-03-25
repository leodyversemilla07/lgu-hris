<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BiometricDevice;
use App\Models\BiometricRawLog;
use App\Models\Employee;
use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class BiometricWebhookController extends Controller
{
    /**
     * Handle ZKTeco ADMS Push Protocol
     * 
     * @param Request $request
     * @return \Illuminate\Http\Response
     */
    public function zkteco(Request $request)
    {
        $sn = $request->query('sn');
        $table = $request->query('table');

        if (!$sn) {
            return response('No SN provided', 400);
        }

        $device = BiometricDevice::where('serial_number', $sn)->first();

        if (!$device) {
            // Log this as a new device attempt if needed, or just return 404
            return response('Unknown Device', 404);
        }

        // Handshake / Initial Request
        if ($request->isMethod('GET')) {
            return response("OK", 200)->header('Content-Type', 'text/plain');
        }

        // Processing Logs (POST)
        if ($request->isMethod('POST')) {
            $content = $request->getContent();
            
            if ($table === 'ATTLOG') {
                $this->processZkAttendanceLogs($device, $content);
            }

            return response("OK", 200)->header('Content-Type', 'text/plain');
        }

        return response("OK", 200);
    }

    /**
     * Handle Hikvision ISAPI Webhooks
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function hikvision(Request $request)
    {
        $payload = $request->all();
        $sn = $payload['serialNo'] ?? null;

        if (!$sn) {
            return response()->json(['status' => 'error', 'message' => 'No Serial Number'], 400);
        }

        $device = BiometricDevice::where('serial_number', $sn)->first();

        if (!$device) {
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
                payload: $payload
            );
        }

        return response()->json(['status' => 'success']);
    }

    private function processZkAttendanceLogs(BiometricDevice $device, string $content)
    {
        // ZKTeco ATTLOG format is usually:
        // ID\tTIMESTAMP\tSTATUS\tVERIFY\t0\t0\n
        $lines = explode("\n", trim($content));

        foreach ($lines as $line) {
            $data = explode("\t", trim($line));
            if (count($data) < 2) continue;

            $this->saveRawLog(
                device: $device,
                externalId: $data[0],
                timestamp: Carbon::parse($data[1]),
                punchType: $data[2] ?? '0',
                verifyMode: $data[3] ?? null,
                payload: ['raw_line' => $line]
            );
        }
    }

    private function saveRawLog(BiometricDevice $device, string $externalId, Carbon $timestamp, string $punchType, ?string $verifyMode, array $payload)
    {
        // Save to raw logs first for auditing
        $rawLog = BiometricRawLog::create([
            'biometric_device_id' => $device->id,
            'employee_external_id' => $externalId,
            'timestamp' => $timestamp,
            'punch_type' => $punchType,
            'verify_mode' => $verifyMode,
            'raw_payload' => $payload,
        ]);

        // Find employee and sync to real AttendanceLog
        $employee = Employee::where('employee_number', $externalId)->first();

        if ($employee) {
            AttendanceLog::create([
                'employee_id' => $employee->id,
                'log_time' => $timestamp,
                'type' => $punchType === '0' ? 'in' : 'out', // Basic mapping
                'source' => 'biometric',
                'remarks' => "Pushed from {$device->name} ({$device->serial_number})",
            ]);

            $rawLog->update(['is_processed' => true]);
        }
    }
}
