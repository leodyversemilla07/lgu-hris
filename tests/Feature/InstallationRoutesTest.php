<?php

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
