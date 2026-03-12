<?php

namespace App\Console\Commands;

use App\Models\Department;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

class RunDeploymentPreflightCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hris:preflight';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run deployment-readiness checks for production installation';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $failures = 0;
        $warnings = 0;

        foreach ($this->checks() as $check) {
            match ($check['status']) {
                'pass' => $this->components->info("PASS {$check['label']}: {$check['message']}"),
                'warn' => $this->components->warn("WARN {$check['label']}: {$check['message']}"),
                default => $this->components->error("FAIL {$check['label']}: {$check['message']}"),
            };

            if ($check['status'] === 'fail') {
                $failures++;
            }

            if ($check['status'] === 'warn') {
                $warnings++;
            }
        }

        $this->newLine();
        $this->line("Preflight completed with {$failures} failure(s) and {$warnings} warning(s).");

        return $failures === 0 ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return list<array{label: string, status: 'pass'|'warn'|'fail', message: string}>
     */
    private function checks(): array
    {
        $databaseConnection = (string) config('database.default');
        $mailDriver = (string) config('mail.default');
        $queueDriver = (string) config('queue.default');
        $storageLinkPath = public_path('storage');
        $manifestPath = public_path('build/manifest.json');

        return [
            $this->result(
                label: 'Application key',
                passing: filled(config('app.key')),
                successMessage: 'APP_KEY is configured.',
                failureMessage: 'APP_KEY is missing.',
            ),
            $this->result(
                label: 'Environment',
                passing: in_array((string) config('app.env'), ['production', 'staging'], true),
                successMessage: 'APP_ENV is suitable for deployment.',
                failureMessage: 'APP_ENV should be production or staging for LGU deployment.',
            ),
            $this->result(
                label: 'Debug mode',
                passing: ! (bool) config('app.debug'),
                successMessage: 'APP_DEBUG is disabled.',
                failureMessage: 'APP_DEBUG must be false in deployment.',
            ),
            $this->result(
                label: 'Database driver',
                passing: in_array($databaseConnection, ['mysql', 'mariadb'], true),
                successMessage: "Database driver is {$databaseConnection}.",
                failureMessage: 'DB_CONNECTION should be mysql or mariadb for LGU deployment.',
            ),
            $this->result(
                label: 'Mail driver',
                passing: ! in_array($mailDriver, ['log', 'array'], true),
                successMessage: "Mail driver is {$mailDriver}.",
                failureMessage: 'MAIL_MAILER must use a real transport such as smtp, ses, or failover.',
            ),
            $this->result(
                label: 'Queue driver',
                passing: ! in_array($queueDriver, ['sync', 'null'], true),
                successMessage: "Queue driver is {$queueDriver}.",
                failureMessage: 'QUEUE_CONNECTION must not be sync or null in deployment.',
            ),
            $this->result(
                label: 'Frontend build',
                passing: file_exists($manifestPath),
                successMessage: 'Frontend build manifest exists.',
                failureMessage: 'Run npm run build before deployment.',
            ),
            $this->result(
                label: 'Reference seed data',
                passing: Role::query()->where('name', 'HR Admin')->exists() && Department::query()->exists(),
                successMessage: 'Roles and HR reference data are seeded.',
                failureMessage: 'Run the production seeders before deployment.',
            ),
            $this->result(
                label: 'Initial HR admin',
                passing: User::query()->whereHas('roles', fn ($query) => $query->where('name', 'HR Admin'))->exists(),
                successMessage: 'At least one HR Admin user exists.',
                failureMessage: 'Create the first HR Admin using php artisan hris:create-admin.',
            ),
            $this->result(
                label: 'Queue tables',
                passing: $queueDriver !== 'database' || (
                    Schema::hasTable('jobs') &&
                    Schema::hasTable('failed_jobs') &&
                    Schema::hasTable('job_batches')
                ),
                successMessage: 'Required queue tables are present.',
                failureMessage: 'Database queue tables are missing. Run migrations before deployment.',
            ),
            $this->warning(
                label: 'Storage link',
                warning: ! file_exists($storageLinkPath),
                warningMessage: 'public/storage is missing. Run php artisan storage:link if public disk assets are required.',
                successMessage: 'public/storage exists.',
            ),
        ];
    }

    /**
     * @return array{label: string, status: 'pass'|'fail', message: string}
     */
    private function result(string $label, bool $passing, string $successMessage, string $failureMessage): array
    {
        return [
            'label' => $label,
            'status' => $passing ? 'pass' : 'fail',
            'message' => $passing ? $successMessage : $failureMessage,
        ];
    }

    /**
     * @return array{label: string, status: 'pass'|'warn', message: string}
     */
    private function warning(string $label, bool $warning, string $warningMessage, string $successMessage): array
    {
        return [
            'label' => $label,
            'status' => $warning ? 'warn' : 'pass',
            'message' => $warning ? $warningMessage : $successMessage,
        ];
    }
}
