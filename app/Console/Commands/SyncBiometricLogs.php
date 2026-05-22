<?php

namespace App\Console\Commands;

use App\Models\BiometricDevice;
use App\Services\BiometricIntegrationService;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('hris:sync-biometrics {--device= : Sync only a specific device by ID}')]
#[Description('Pull attendance logs from all configured biometric devices')]
class SyncBiometricLogs extends Command
{
    protected $description = 'Pull attendance logs from biometric devices';

    public function handle(BiometricIntegrationService $service): int
    {
        $query = BiometricDevice::query()->where('is_active', true);

        if ($deviceId = $this->option('device')) {
            $query->whereKey($deviceId);
        }

        $devices = $query->get();

        if ($devices->isEmpty()) {
            $this->warn('No active biometric devices found.');

            return Command::SUCCESS;
        }

        $totalLogs = 0;

        foreach ($devices as $device) {
            $this->line("Syncing <info>{$device->name}</info> ({$device->ip_address}:{$device->port})...");

            try {
                $count = $service->syncDevice($device);
                $totalLogs += $count;

                $this->line("  → {$count} new log(s) imported.");

                if ($count > 0) {
                    $this->line("  ✓ Last sync: {$device->fresh()->last_sync_at}");
                }
            } catch (\Exception $e) {
                $this->error("  ✗ Failed: {$e->getMessage()}");
            }
        }

        $this->newLine();
        $this->info("Sync complete. {$totalLogs} total log(s) imported.");

        return Command::SUCCESS;
    }
}
