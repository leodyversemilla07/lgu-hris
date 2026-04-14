<?php

use App\Http\Controllers\Central\AuthController;
use App\Http\Controllers\Central\TenantController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Central Routes
|--------------------------------------------------------------------------
|
| These routes are only accessible from the central domain (e.g., yourhris.test).
| They are used by the super-admin to manage LGU tenants.
|
*/

Route::middleware('web')->group(function () {
    Route::middleware('guest:central')->group(function () {
        Route::get('/central/login', [AuthController::class, 'showLogin'])->name('central.login');
        Route::post('/central/login', [AuthController::class, 'login'])->name('central.login.post');
    });

    Route::middleware('auth:central')->group(function () {
        Route::inertia('/', 'Central/Welcome')->name('central.home');
        Route::post('/central/logout', [AuthController::class, 'logout'])->name('central.logout');

        Route::prefix('tenants')->group(function () {
            Route::get('/', [TenantController::class, 'index'])->name('central.tenants.index');
            Route::get('/create', [TenantController::class, 'create'])->name('central.tenants.create');
            Route::post('/', [TenantController::class, 'store'])->name('central.tenants.store');
            Route::get('/{tenant}', [TenantController::class, 'show'])->name('central.tenants.show');
            Route::get('/{tenant}/edit', [TenantController::class, 'edit'])->name('central.tenants.edit');
            Route::put('/{tenant}', [TenantController::class, 'update'])->name('central.tenants.update');
            Route::patch('/{tenant}/toggle', [TenantController::class, 'toggle'])->name('central.tenants.toggle');
            Route::delete('/{tenant}', [TenantController::class, 'destroy'])->name('central.tenants.destroy');
        });
    });
});
