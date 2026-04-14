<?php

use App\Http\Controllers\Api\BiometricWebhookController;
use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

// Biometric Device Integration Endpoints
// No Auth/CSRF required for hardware compatibility
Route::middleware([
    InitializeTenancyBySubdomain::class,
    PreventAccessFromCentralDomains::class,
])->prefix('biometrics')->group(function (): void {
    Route::match(['GET', 'POST'], 'zkteco', [BiometricWebhookController::class, 'zkteco']);
    Route::post('hikvision', [BiometricWebhookController::class, 'hikvision']);
});
