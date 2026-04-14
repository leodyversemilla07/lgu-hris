<?php

use App\Models\CentralUser;
use Inertia\Testing\AssertableInertia as Assert;

test('central tenants index loads for authenticated central user', function () {
    $user = CentralUser::query()->create([
        'name' => 'Central Admin',
        'email' => 'admin@yourhris.test',
        'password' => bcrypt('password123'),
        'email_verified_at' => now(),
    ]);

    $this->actingAs($user, 'central')
        ->get(route('central.tenants.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Central/Tenants/Index')
            ->where('auth.user.email', 'admin@yourhris.test')
            ->where('notifications.unread_count', 0)
            ->where('auth.user.primary_role', 'Central Admin')
        );
});
