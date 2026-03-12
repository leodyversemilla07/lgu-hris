<?php

namespace App\Console\Commands;

use App\Services\BackupService;
use Illuminate\Console\Command;
use RuntimeException;

class CreateBackupCommand extends Command
{
    protected $signature = 'hris:backup
                            {--skip-database : Skip the database backup step}
                            {--skip-files : Skip the private file backup step}
                            {--keep= : Override backup retention days for this run}';

    protected $description = 'Create an application backup archive for database and private HR files';

    public function handle(): int
    {
        $includeDatabase = ! $this->option('skip-database');
        $includeFiles = ! $this->option('skip-files');
        $keepDays = $this->option('keep');

        if (! $includeDatabase && ! $includeFiles) {
            $this->error('At least one backup source must be included.');

            return self::FAILURE;
        }

        try {
            $result = BackupService::create(
                includeDatabase: $includeDatabase,
                includeFiles: $includeFiles,
                keepDays: is_numeric($keepDays) ? (int) $keepDays : null,
            );
        } catch (RuntimeException $exception) {
            $this->error($exception->getMessage());

            return self::FAILURE;
        }

        $this->info("Backup archive created: {$result['archive_path']}");
        $this->line('Included database: '.($result['includes_database'] ? 'yes' : 'no'));
        $this->line('Included files: '.($result['includes_files'] ? 'yes' : 'no'));
        $this->line("Pruned archives: {$result['deleted_archives']}");

        return self::SUCCESS;
    }
}
