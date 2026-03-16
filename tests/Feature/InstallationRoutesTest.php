<?php

use Illuminate\Support\Facades\File;
use Inertia\Testing\AssertableInertia as Assert;

test('installation step pages are accessible via get routes', function () {
    File::delete(storage_path('framework/install.lock'));

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
            ->has('requirements')
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
