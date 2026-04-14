<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyBySubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| All HRIS application routes are tenant-scoped. Each LGU accesses the
| system via their own subdomain (e.g., gloria.yourhris.test).
|
*/

$tenantMiddleware = app()->runningUnitTests()
    ? ['web']
    : [
        'web',
        InitializeTenancyBySubdomain::class,
        PreventAccessFromCentralDomains::class,
    ];

Route::middleware($tenantMiddleware)->group(base_path('routes/web.php'));
