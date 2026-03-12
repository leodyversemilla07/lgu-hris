<?php

namespace App\Services;

use Illuminate\Process\Exceptions\ProcessFailedException;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use ZipArchive;

class BackupService
{
    /**
     * @return array{archive_path: string, deleted_archives: int, includes_database: bool, includes_files: bool}
     */
    public static function create(bool $includeDatabase = true, bool $includeFiles = true, ?int $keepDays = null): array
    {
        if (! $includeDatabase && ! $includeFiles) {
            throw new RuntimeException('At least one backup source must be included.');
        }

        $backupDisk = Storage::disk('local');
        $backupPath = trim((string) config('hris.backup.path', 'backups'), '/');
        $archiveName = 'hris-backup-'.now()->format('Ymd-His').'.zip';
        $archiveRelativePath = "{$backupPath}/{$archiveName}";
        $archiveAbsolutePath = $backupDisk->path($archiveRelativePath);
        $temporaryDirectory = storage_path('app/backup-temp/'.Str::uuid()->toString());

        File::ensureDirectoryExists($temporaryDirectory);
        File::ensureDirectoryExists(dirname($archiveAbsolutePath));

        try {
            $manifest = [
                'app_name' => (string) config('app.name'),
                'environment' => (string) config('app.env'),
                'created_at' => now()->toIso8601String(),
                'includes' => [],
            ];

            if ($includeDatabase) {
                $manifest['includes']['database'] = self::exportDatabase("{$temporaryDirectory}/database");
            }

            if ($includeFiles) {
                $manifest['includes']['files'] = self::copyPrivateFiles(
                    targetDirectory: "{$temporaryDirectory}/private",
                    backupPath: $backupPath,
                );
            }

            File::put(
                "{$temporaryDirectory}/manifest.json",
                json_encode($manifest, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR),
            );

            self::zipDirectory($temporaryDirectory, $archiveAbsolutePath);

            $deletedArchives = self::pruneOldArchives(
                backupDirectory: $backupDisk->path($backupPath),
                keepDays: $keepDays ?? (int) config('hris.backup.retention_days', 14),
            );

            return [
                'archive_path' => $archiveRelativePath,
                'deleted_archives' => $deletedArchives,
                'includes_database' => $includeDatabase,
                'includes_files' => $includeFiles,
            ];
        } finally {
            File::deleteDirectory($temporaryDirectory);
        }
    }

    /**
     * @return array{driver: string, file: string}
     */
    private static function exportDatabase(string $targetDirectory): array
    {
        File::ensureDirectoryExists($targetDirectory);

        $defaultConnection = (string) config('database.default');
        $connection = config("database.connections.{$defaultConnection}");

        if (! is_array($connection)) {
            throw new RuntimeException("Database connection [{$defaultConnection}] is not configured.");
        }

        $driver = (string) ($connection['driver'] ?? $defaultConnection);

        return match ($driver) {
            'sqlite' => self::exportSqliteDatabase($connection, $targetDirectory),
            'mysql', 'mariadb' => self::exportMysqlDatabase($connection, $targetDirectory),
            default => throw new RuntimeException("Database driver [{$driver}] is not supported by hris:backup."),
        };
    }

    /**
     * @param  array<string, mixed>  $connection
     * @return array{driver: string, file: string}
     */
    private static function exportSqliteDatabase(array $connection, string $targetDirectory): array
    {
        $databasePath = $connection['database'] ?? null;

        if (! is_string($databasePath) || $databasePath === '' || $databasePath === ':memory:' || ! File::exists($databasePath)) {
            throw new RuntimeException('SQLite database file does not exist for backup.');
        }

        $targetPath = "{$targetDirectory}/database.sqlite";
        File::copy($databasePath, $targetPath);

        return [
            'driver' => 'sqlite',
            'file' => 'database/database.sqlite',
        ];
    }

    /**
     * @param  array<string, mixed>  $connection
     * @return array{driver: string, file: string}
     */
    private static function exportMysqlDatabase(array $connection, string $targetDirectory): array
    {
        $targetPath = "{$targetDirectory}/database.sql";
        $dumpBinary = (string) config('hris.backup.mysql_dump_binary', 'mysqldump');

        $commandParts = [
            self::quoteArgument($dumpBinary),
            '--single-transaction',
            '--skip-lock-tables',
            '--host='.self::quoteArgument((string) ($connection['host'] ?? '127.0.0.1')),
            '--port='.self::quoteArgument((string) ($connection['port'] ?? '3306')),
            '--user='.self::quoteArgument((string) ($connection['username'] ?? 'root')),
            '--result-file='.self::quoteArgument($targetPath),
        ];

        $socket = (string) ($connection['unix_socket'] ?? '');

        if ($socket !== '') {
            $commandParts[] = '--socket='.self::quoteArgument($socket);
        }

        $databaseName = (string) ($connection['database'] ?? '');

        if ($databaseName === '') {
            throw new RuntimeException('MySQL backup requires a configured database name.');
        }

        $commandParts[] = self::quoteArgument($databaseName);

        try {
            Process::timeout(300)
                ->env(array_filter([
                    'MYSQL_PWD' => (string) ($connection['password'] ?? ''),
                ], fn (string $value): bool => $value !== ''))
                ->run(implode(' ', $commandParts))
                ->throw();
        } catch (ProcessFailedException $exception) {
            throw new RuntimeException('MySQL dump failed: '.$exception->result->errorOutput(), previous: $exception);
        }

        if (! File::exists($targetPath)) {
            throw new RuntimeException('MySQL dump completed without producing a backup file.');
        }

        return [
            'driver' => 'mysql',
            'file' => 'database/database.sql',
        ];
    }

    /**
     * @return array{root: string, file_count: int}
     */
    private static function copyPrivateFiles(string $targetDirectory, string $backupPath): array
    {
        $privateRoot = Storage::disk('local')->path('');
        $normalizedBackupPath = trim(str_replace('\\', '/', $backupPath), '/');
        $fileCount = 0;

        if (! File::isDirectory($privateRoot)) {
            return [
                'root' => 'private',
                'file_count' => 0,
            ];
        }

        foreach (File::allFiles($privateRoot) as $file) {
            $relativePath = str_replace('\\', '/', ltrim(Str::after($file->getPathname(), $privateRoot), '\\/'));

            if ($relativePath === '') {
                continue;
            }

            if ($normalizedBackupPath !== '' && ($relativePath === $normalizedBackupPath || str_starts_with($relativePath, "{$normalizedBackupPath}/"))) {
                continue;
            }

            $destinationPath = "{$targetDirectory}/{$relativePath}";

            File::ensureDirectoryExists(dirname($destinationPath));
            File::copy($file->getPathname(), $destinationPath);
            $fileCount++;
        }

        return [
            'root' => 'private',
            'file_count' => $fileCount,
        ];
    }

    private static function zipDirectory(string $sourceDirectory, string $archivePath): void
    {
        $archive = new ZipArchive;

        if ($archive->open($archivePath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('Unable to create backup archive.');
        }

        try {
            foreach (File::allFiles($sourceDirectory) as $file) {
                $relativePath = str_replace('\\', '/', ltrim(Str::after($file->getPathname(), $sourceDirectory), '\\/'));

                $archive->addFile($file->getPathname(), $relativePath);
            }
        } finally {
            $archive->close();
        }
    }

    private static function pruneOldArchives(string $backupDirectory, int $keepDays): int
    {
        if ($keepDays <= 0 || ! File::isDirectory($backupDirectory)) {
            return 0;
        }

        $deletedArchives = 0;
        $cutoff = now()->subDays($keepDays);

        foreach (File::files($backupDirectory) as $file) {
            if ($file->getExtension() !== 'zip') {
                continue;
            }

            if ($file->getMTime() >= $cutoff->getTimestamp()) {
                continue;
            }

            File::delete($file->getPathname());
            $deletedArchives++;
        }

        return $deletedArchives;
    }

    private static function quoteArgument(string $value): string
    {
        return '"'.str_replace('"', '\"', $value).'"';
    }
}
