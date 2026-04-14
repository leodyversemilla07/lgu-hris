<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

uses(RefreshDatabase::class);

test('deployment preflight passes for a production-ready configuration', function () {
    $databasePath = database_path('preflight-test.sqlite');

    if (File::exists($databasePath)) {
        File::delete($databasePath);
    }

    File::put($databasePath, '');

    Config::set('app.env', 'production');
    Config::set('app.debug', false);
    Config::set('app.key', 'base64:test-key');
    Config::set('mail.default', 'smtp');
    Config::set('queue.default', 'database');
    Config::set('database.connections.mysql', array_merge(
        config('database.connections.sqlite'),
        ['database' => $databasePath],
    ));

    DB::purge('mysql');

    try {
        $this->artisan('migrate:fresh', [
            '--database' => 'mysql',
            '--force' => true,
        ])->assertSuccessful();

        $this->artisan('migrate', [
            '--database' => 'mysql',
            '--path' => database_path('migrations/tenant'),
            '--realpath' => true,
            '--force' => true,
        ])->assertSuccessful();

        $this->artisan('db:seed', [
            '--class' => DatabaseSeeder::class,
            '--database' => 'mysql',
            '--force' => true,
        ])->assertSuccessful();

        Config::set('database.default', 'mysql');
        DB::purge('mysql');

        User::factory()->create([
            'name' => 'LGU HR Admin',
            'email' => 'admin@lgu.test',
            'password' => 'secure-pass-123',
            'email_verified_at' => now(),
        ])->syncRoles(['HR Admin']);

        $this->artisan('hris:preflight')
            ->expectsOutputToContain('PASS Application key')
            ->expectsOutputToContain('PASS Environment')
            ->expectsOutputToContain('PASS Debug mode')
            ->expectsOutputToContain('PASS Database driver: Database driver is mysql.')
            ->expectsOutputToContain('PASS Mail driver: Mail driver is smtp.')
            ->expectsOutputToContain('PASS Queue driver: Queue driver is database.')
            ->expectsOutputToContain('PASS Reference seed data')
            ->expectsOutputToContain('PASS Initial HR admin')
            ->expectsOutputToContain('Preflight completed with 0 failure(s)')
            ->assertSuccessful();
    } finally {
        Config::set('database.default', 'sqlite');
        DB::disconnect('mysql');
        DB::purge('mysql');

        if (File::exists($databasePath)) {
            File::delete($databasePath);
        }
    }
});

test('deployment preflight fails for unsafe deployment configuration', function () {
    $this->seed(DatabaseSeeder::class);

    Config::set('app.env', 'local');
    Config::set('app.debug', true);
    Config::set('app.key', null);
    Config::set('mail.default', 'log');
    Config::set('queue.default', 'sync');

    $this->artisan('hris:preflight')
        ->expectsOutputToContain('FAIL Application key')
        ->expectsOutputToContain('FAIL Environment')
        ->expectsOutputToContain('FAIL Debug mode')
        ->expectsOutputToContain('FAIL Database driver')
        ->expectsOutputToContain('FAIL Mail driver')
        ->expectsOutputToContain('FAIL Queue driver')
        ->expectsOutputToContain('FAIL Initial HR admin')
        ->expectsOutputToContain('Preflight completed with')
        ->assertFailed();
});
