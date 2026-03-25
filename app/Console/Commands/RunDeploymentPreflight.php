<?php

namespace App\Console\Commands;

use App\Models\EmploymentType;
use App\Models\LeaveType;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

class RunDeploymentPreflight extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hris:preflight';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Run system checks to ensure the environment is ready for production.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🚀 Running LGU HRIS Deployment Preflight Checks...');
        $this->newLine();

        $checks = [
            'Database Connection' => $this->checkDatabase(),
            'Migrations Status' => $this->checkMigrations(),
            'Critical Reference Data' => $this->checkReferenceData(),
            'Roles and Permissions' => $this->checkRoles(),
            'Storage Permissions' => $this->checkStorage(),
        ];

        $failed = false;

        foreach ($checks as $name => $result) {
            if ($result) {
                $this->info("✅ {$name}: Passed");
            } else {
                $this->error("❌ {$name}: Failed");
                $failed = true;
            }
        }

        $this->newLine();

        if ($failed) {
            $this->error('⚠️  Preflight failed! Please resolve the issues above before proceeding.');
            return self::FAILURE;
        }

        $this->info('🎉 All systems ready for LGU HRIS rollout!');
        return self::SUCCESS;
    }

    private function checkDatabase(): bool
    {
        try {
            DB::connection()->getPdo();
            return true;
        } catch (\Exception $e) {
            $this->warn('Could not connect to the database: ' . $e->getMessage());
            return false;
        }
    }

    private function checkMigrations(): bool
    {
        try {
            return Schema::hasTable('users') && Schema::hasTable('employees');
        } catch (\Exception $e) {
            return false;
        }
    }

    private function checkReferenceData(): bool
    {
        $perm = EmploymentType::where('name', 'Permanent')->exists();
        $vl = LeaveType::where('code', 'VL')->exists();
        $sl = LeaveType::where('code', 'SL')->exists();

        if (!$perm) $this->warn('Missing "Permanent" employment type.');
        if (!$vl || !$sl) $this->warn('Missing VL or SL leave types.');

        return $perm && $vl && $sl;
    }

    private function checkRoles(): bool
    {
        $admin = Role::where('name', 'HR Admin')->exists();
        $hasUser = User::role('HR Admin')->exists();

        if (!$admin) $this->warn('Roles not seeded. Run php artisan db:seed --class=RoleAndPermissionSeeder');
        if (!$hasUser) $this->warn('No HR Admin user found. Run php artisan hris:create-admin');

        return $admin && $hasUser;
    }

    private function checkStorage(): bool
    {
        $paths = [
            storage_path('app/public'),
            storage_path('framework/cache'),
            storage_path('framework/sessions'),
            storage_path('framework/views'),
            storage_path('logs'),
        ];

        foreach ($paths as $path) {
            if (!is_writable($path)) {
                $this->warn("Path not writable: {$path}");
                return false;
            }
        }

        return true;
    }
}
