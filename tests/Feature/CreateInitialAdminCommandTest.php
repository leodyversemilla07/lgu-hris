<?php

use App\Models\User;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('initial admin command creates an hr admin account', function () {
    $this->seed(DatabaseSeeder::class);

    $this->artisan('hris:create-admin', [
        '--name' => 'LGU HR Admin',
        '--email' => 'admin@lgu.test',
        '--password' => 'secure-pass-123',
    ])
        ->expectsOutput('Created HR Admin account for admin@lgu.test.')
        ->assertSuccessful();

    $user = User::query()->where('email', 'admin@lgu.test')->first();

    expect($user)->not->toBeNull()
        ->and($user->name)->toBe('LGU HR Admin')
        ->and($user->email_verified_at)->not->toBeNull()
        ->and($user->hasRole('HR Admin'))->toBeTrue();
});

test('initial admin command rejects duplicate email addresses', function () {
    $this->seed(DatabaseSeeder::class);

    User::query()->create([
        'name' => 'Existing Admin',
        'email' => 'admin@lgu.test',
        'password' => 'secure-pass-123',
        'email_verified_at' => now(),
    ])->syncRoles(['HR Admin']);

    $this->artisan('hris:create-admin', [
        '--name' => 'Second Admin',
        '--email' => 'admin@lgu.test',
        '--password' => 'another-secure-pass',
    ])
        ->expectsOutput('The email has already been taken.')
        ->assertFailed();
});
