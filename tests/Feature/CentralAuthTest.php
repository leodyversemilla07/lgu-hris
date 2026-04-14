<?php

use App\Models\CentralUser;
use Illuminate\Support\Facades\Hash;

test('central user login redirects to tenant index', function () {
    CentralUser::query()->create([
        'name' => 'Central Admin',
        'email' => 'admin@yourhris.test',
        'password' => Hash::make('password123'),
        'email_verified_at' => now(),
    ]);

    $this->post(route('central.login.post'), [
        'email' => 'admin@yourhris.test',
        'password' => 'password123',
    ])->assertRedirect(route('central.tenants.index'));

    $this->assertAuthenticated('central');
});
