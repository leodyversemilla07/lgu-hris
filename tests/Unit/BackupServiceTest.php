<?php

use App\Services\BackupService;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;
use Tests\TestCase;

uses(TestCase::class);

afterEach(function () {
    Process::fake();

    $backupDirectory = storage_path('app/private/backups');

    if (File::isDirectory($backupDirectory)) {
        File::deleteDirectory($backupDirectory);
    }
});

test('backup service uses mysqldump for mysql connections', function () {
    Process::fake([
        '*' => function ($process) {
            preg_match('/--result-file="([^"]+)"/', $process->command, $matches);

            if (isset($matches[1])) {
                File::ensureDirectoryExists(dirname($matches[1]));
                File::put($matches[1], '-- mysql dump --');
            }

            return Process::result('', '', 0);
        },
    ]);

    Config::set('database.default', 'mysql');
    Config::set('database.connections.mysql', [
        'driver' => 'mysql',
        'host' => '127.0.0.1',
        'port' => '3306',
        'database' => 'lgu_hris',
        'username' => 'root',
        'password' => 'secret',
        'unix_socket' => '',
    ]);

    $result = BackupService::create(includeDatabase: true, includeFiles: false, keepDays: 7);

    expect($result['includes_database'])->toBeTrue()
        ->and($result['includes_files'])->toBeFalse();

    Process::assertRan(fn ($process, $result) => str_contains($process->command, 'mysqldump') && str_contains($process->command, '"lgu_hris"'));
});
