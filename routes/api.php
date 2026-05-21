<?php

use App\Http\Controllers\Api\BiometricWebhookController;
use Illuminate\Support\Facades\Route;

// Biometric Device Integration Endpoints
// No Auth/CSRF required for hardware compatibility
Route::any('biometrics/zkteco', [BiometricWebhookController::class, 'zkteco']);
Route::post('biometrics/hikvision', [BiometricWebhookController::class, 'hikvision']);
