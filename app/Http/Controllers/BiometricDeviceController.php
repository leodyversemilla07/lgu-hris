<?php

namespace App\Http\Controllers;

use App\Models\BiometricDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BiometricDeviceController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', BiometricDevice::class);

        return Inertia::render('settings/biometrics/index', [
            'devices' => BiometricDevice::query()
                ->orderBy('name')
                ->get()
                ->map(fn ($device) => [
                    'id' => $device->id,
                    'name' => $device->name,
                    'brand' => ucfirst($device->brand),
                    'serial_number' => $device->serial_number,
                    'ip_address' => $device->ip_address,
                    'protocol' => strtoupper($device->protocol),
                    'location' => $device->location,
                    'is_active' => $device->is_active,
                    'last_sync_at' => $device->last_sync_at?->diffForHumans() ?? 'Never',
                ]),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorize('create', BiometricDevice::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'in:zkteco,hikvision,other'],
            'serial_number' => ['required', 'string', 'unique:biometric_devices,serial_number'],
            'ip_address' => ['nullable', 'ip'],
            'port' => ['required', 'integer'],
            'protocol' => ['required', 'string', 'in:push,poll'],
            'location' => ['nullable', 'string', 'max:255'],
        ]);

        BiometricDevice::create($validated);

        return back()->with('success', 'Device added successfully.');
    }

    public function update(Request $request, BiometricDevice $device): RedirectResponse
    {
        $this->authorize('update', $device);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['required', 'string', 'in:zkteco,hikvision,other'],
            'serial_number' => ['required', 'string', "unique:biometric_devices,serial_number,{$device->id}"],
            'ip_address' => ['nullable', 'ip'],
            'port' => ['required', 'integer'],
            'protocol' => ['required', 'string', 'in:push,poll'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $device->update($validated);

        return back()->with('success', 'Device updated successfully.');
    }

    public function destroy(BiometricDevice $device): RedirectResponse
    {
        $this->authorize('delete', $device);

        $device->delete();

        return back()->with('success', 'Device deleted successfully.');
    }
}
