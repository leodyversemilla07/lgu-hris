<?php

use App\Models\BiometricDevice;
use App\Models\Employee;

test('zkteco handshake returns OK', function () {
    BiometricDevice::factory()->create([
        'serial_number' => 'ZK-12345',
        'brand' => 'zkteco',
    ]);

    $this->get('/api/biometrics/zkteco?sn=ZK-12345')
        ->assertOk()
        ->assertSee('OK');
});

test('zkteco returns 404 for unknown device', function () {
    $this->get('/api/biometrics/zkteco?sn=UNKNOWN')
        ->assertStatus(404);
});

test('zkteco can process ATTLOG push', function () {
    $device = BiometricDevice::factory()->create([
        'serial_number' => 'ZK-12345',
        'brand' => 'zkteco',
        'name' => 'Main Entrance',
    ]);

    $employee = Employee::factory()->create([
        'employee_number' => '1001',
    ]);

    $content = "1001\t2025-05-20 08:30:00\t0\t1\t0\t0\n";

    $this->call('POST', '/api/biometrics/zkteco?sn=ZK-12345&table=ATTLOG', [], [], [], [], $content)
        ->assertOk()
        ->assertSee('OK');

    $this->assertDatabaseHas('biometric_raw_logs', [
        'biometric_device_id' => $device->id,
        'employee_external_id' => '1001',
        'is_processed' => true,
    ]);

    $this->assertDatabaseHas('attendance_logs', [
        'employee_id' => $employee->id,
        'time_in' => '08:30',
        'source' => 'biometric',
    ]);
});

test('hikvision can process access event webhook', function () {
    $device = BiometricDevice::factory()->create([
        'serial_number' => 'HIK-67890',
        'name' => 'Back Door',
    ]);

    $employee = Employee::factory()->create([
        'employee_number' => '2002',
    ]);

    $payload = [
        'serialNo' => 'HIK-67890',
        'AccessEvent' => [
            'employeeNoString' => '2002',
            'dateTime' => '2025-05-20T17:45:00+08:00',
            'attendanceStatus' => 'checkOut',
        ],
    ];

    $this->postJson('/api/biometrics/hikvision', $payload)
        ->assertOk()
        ->assertJson(['status' => 'success']);

    $this->assertDatabaseHas('biometric_raw_logs', [
        'biometric_device_id' => $device->id,
        'employee_external_id' => '2002',
    ]);
});
