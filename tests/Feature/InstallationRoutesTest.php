<?php

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia as Assert;

test('installation step pages are accessible via get routes', function () {
    // Temporarily remove APP_INSTALLED so the installation wizard is accessible
    $envPath = base_path('.env');
    $original = File::get($envPath);
    $modified = str_replace("\nAPP_INSTALLED=true", '', $original);
    $modified = str_replace('APP_INSTALLED=true', '', $modified);
    File::put($envPath, $modified);

    $this->beforeApplicationDestroyed(function () use ($envPath, $original) {
        File::put($envPath, $original);
    });

    $this->get(route('install.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('installation/index')
            ->where('currentStep', 1)
            ->has('steps', 6)
        );

    $this->get(route('install.requirements'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('installation/requirements')
            ->has('results')
            ->has('passed')
        );

    $this->get(route('install.database'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('installation/database'));

    $this->get(route('install.environment'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('installation/environment'));

    $this->get(route('install.migrations'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('installation/migrations'));

    $this->get(route('install.admin'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('installation/admin'));

    $this->get(route('install.complete'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('installation/complete'));
});

test('installation admin creation assigns the hr admin role', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $envPath = base_path('.env');
    $original = File::get($envPath);
    $modified = str_replace("\nAPP_INSTALLED=true", '', $original);
    $modified = str_replace('APP_INSTALLED=true', '', $modified);
    File::put($envPath, $modified);

    $this->beforeApplicationDestroyed(function () use ($envPath, $original): void {
        File::put($envPath, $original);
    });

    $this->post(route('install.admin.create'), [
        'name' => 'LGU HR Admin',
        'email' => 'admin@example.gov.ph',
        'password' => 'secure-password',
        'password_confirmation' => 'secure-password',
    ])->assertRedirect(route('install.complete'));

    $user = User::query()->where('email', 'admin@example.gov.ph')->firstOrFail();

    expect($user->hasRole('HR Admin'))->toBeTrue()
        ->and($user->email_verified_at)->not->toBeNull();
});
