<?php

use App\Models\BiometricDevice;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('hr staff can view the biometric devices index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    BiometricDevice::factory()->create([
        'name' => 'Main Lobby Scanner',
        'brand' => 'zkteco',
    ]);

    $this->actingAs($user)
        ->get(route('biometrics.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('settings/biometrics/index')
            ->has('devices', 1)
            ->where('devices.0.name', 'Main Lobby Scanner')
        );
});

test('guests are redirected from biometric devices', function () {
    $this->get(route('biometrics.index'))
        ->assertRedirect(route('login'));
});

test('employee role cannot access biometric devices', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('biometrics.index'))
        ->assertForbidden();
});

test('hr staff can create a biometric device', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->post(route('biometrics.store'), [
            'name' => 'HR Office Scanner',
            'brand' => 'zkteco',
            'serial_number' => 'SN-UNIQUE-001',
            'ip_address' => '192.168.1.100',
            'port' => 4370,
            'protocol' => 'push',
            'location' => 'HR Office',
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    $this->assertDatabaseHas('biometric_devices', [
        'name' => 'HR Office Scanner',
        'serial_number' => 'SN-UNIQUE-001',
    ]);
});

test('hr staff can update a biometric device', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $device = BiometricDevice::factory()->create([
        'name' => 'Old Scanner',
        'serial_number' => 'SN-ORIGINAL',
    ]);

    $this->actingAs($user)
        ->put(route('biometrics.update', $device), [
            'name' => 'Updated Scanner',
            'brand' => $device->brand,
            'serial_number' => $device->serial_number,
            'ip_address' => $device->ip_address,
            'port' => $device->port,
            'protocol' => $device->protocol,
            'location' => 'Updated Location',
            'is_active' => true,
        ])
        ->assertRedirect()
        ->assertSessionHas('success');

    expect($device->fresh()->name)->toBe('Updated Scanner');
    expect($device->fresh()->location)->toBe('Updated Location');
});

test('hr staff can delete a biometric device', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $device = BiometricDevice::factory()->create();

    $this->actingAs($user)
        ->delete(route('biometrics.destroy', $device))
        ->assertRedirect()
        ->assertSessionHas('success');

    expect(BiometricDevice::find($device->id))->toBeNull();
});

test('serial number must be unique when creating a device', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    BiometricDevice::factory()->create(['serial_number' => 'SN-DUPLICATE']);

    $this->actingAs($user)
        ->post(route('biometrics.store'), [
            'name' => 'Duplicate',
            'brand' => 'hikvision',
            'serial_number' => 'SN-DUPLICATE',
            'port' => 80,
            'protocol' => 'poll',
        ])
        ->assertSessionHasErrors('serial_number');
});
