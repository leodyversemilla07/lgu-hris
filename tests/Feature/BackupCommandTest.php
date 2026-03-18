<?php

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Process;

afterEach(function () {
    Process::fake();

    $backupDirectory = storage_path('app/private/backups');
    $privateDocumentsDirectory = storage_path('app/private/employee-documents');
    $sqlitePath = database_path('backup-command.sqlite');

    if (File::isDirectory($backupDirectory)) {
        File::deleteDirectory($backupDirectory);
    }

    if (File::isDirectory($privateDocumentsDirectory)) {
        File::deleteDirectory($privateDocumentsDirectory);
    }

    if (File::exists($sqlitePath)) {
        File::delete($sqlitePath);
    }
});

test('backup command creates an archive for sqlite and private files', function () {
    $sqlitePath = database_path('backup-command.sqlite');

    File::put($sqlitePath, 'sqlite-backup-content');
    File::ensureDirectoryExists(storage_path('app/private/employee-documents/1'));
    File::put(storage_path('app/private/employee-documents/1/sample.txt'), 'employee document');

    Config::set('database.default', 'sqlite');
    Config::set('database.connections.sqlite.database', $sqlitePath);

    $this->artisan('hris:backup', ['--keep' => 7])
        ->expectsOutputToContain('Backup archive created:')
        ->expectsOutputToContain('Included database: yes')
        ->expectsOutputToContain('Included files: yes')
        ->assertSuccessful();

    $archives = File::files(storage_path('app/private/backups'));

    expect($archives)->toHaveCount(1);

    $zip = new ZipArchive;
    $zip->open($archives[0]->getPathname());

    expect($zip->locateName('manifest.json'))->not->toBe(false);
    expect($zip->locateName('database/database.sqlite'))->not->toBe(false);
    expect($zip->locateName('private/employee-documents/1/sample.txt'))->not->toBe(false);

    $manifest = json_decode($zip->getFromName('manifest.json'), true, flags: JSON_THROW_ON_ERROR);

    expect($manifest['includes']['database']['driver'])->toBe('sqlite')
        ->and($manifest['includes']['files']['file_count'])->toBe(1);

    $zip->close();
});

test('backup command prunes old archives', function () {
    File::ensureDirectoryExists(storage_path('app/private/backups'));
    File::put(storage_path('app/private/backups/old-backup.zip'), 'old');
    touch(storage_path('app/private/backups/old-backup.zip'), now()->subDays(30)->getTimestamp());

    $sqlitePath = database_path('backup-command.sqlite');
    File::put($sqlitePath, 'sqlite-backup-content');

    Config::set('database.default', 'sqlite');
    Config::set('database.connections.sqlite.database', $sqlitePath);

    $this->artisan('hris:backup', ['--skip-files' => true, '--keep' => 7])
        ->expectsOutputToContain('Pruned archives: 1')
        ->assertSuccessful();

    expect(File::exists(storage_path('app/private/backups/old-backup.zip')))->toBeFalse();
    expect(File::files(storage_path('app/private/backups')))->toHaveCount(1);
});
