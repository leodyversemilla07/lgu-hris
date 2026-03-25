<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\BiometricDeviceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EmployeeCompensationController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\InstallationController;
use App\Http\Controllers\LeaveBalanceController;
use App\Http\Controllers\LeaveController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\PersonnelMovementController;
use App\Http\Controllers\ReferenceDataController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WorkScheduleController;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

// App Routes
Route::get('install', [InstallationController::class, 'index'])->name('install.index');
Route::get('install/requirements', [InstallationController::class, 'checkRequirements'])->name('install.requirements');
Route::get('install/database', [InstallationController::class, 'database'])->name('install.database');
Route::post('install/database/check', [InstallationController::class, 'checkDatabase'])->name('install.database.check');
Route::post('install/database', [InstallationController::class, 'storeDatabase'])->name('install.database.store');
Route::get('install/environment', [InstallationController::class, 'environment'])->name('install.environment');
Route::post('install/environment', [InstallationController::class, 'storeEnvironment'])->name('install.environment.store');
Route::get('install/migrations', [InstallationController::class, 'migrations'])->name('install.migrations');
Route::post('install/migrations', [InstallationController::class, 'runMigrations'])->name('install.migrations.run');
Route::get('install/admin', [InstallationController::class, 'admin'])->name('install.admin');
Route::post('install/admin', [InstallationController::class, 'createAdmin'])->name('install.admin.store');
Route::get('install/complete', [InstallationController::class, 'complete'])->name('install.complete');

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
])->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::middleware('permission:settings.manage')->group(function () {
        Route::get('settings/biometrics', [BiometricDeviceController::class, 'index'])->name('biometrics.index');
        Route::post('settings/biometrics', [BiometricDeviceController::class, 'store'])->name('biometrics.store');
        Route::put('settings/biometrics/{device}', [BiometricDeviceController::class, 'update'])->name('biometrics.update');
        Route::delete('settings/biometrics/{device}', [BiometricDeviceController::class, 'destroy'])->name('biometrics.destroy');
    });

    Route::get('employees', [EmployeeController::class, 'index'])
        ->middleware('permission:employees.view')
        ->name('employees.index');
    Route::get('employees/create', [EmployeeController::class, 'create'])
        ->middleware('permission:employees.manage')
        ->name('employees.create');
    Route::post('employees', [EmployeeController::class, 'store'])
        ->middleware('permission:employees.manage')
        ->name('employees.store');
    Route::get('employees/{employee}', [EmployeeController::class, 'show'])
        ->middleware('permission:employees.view')
        ->name('employees.show');
    Route::get('employees/{employee}/edit', [EmployeeController::class, 'edit'])
        ->middleware('permission:employees.manage')
        ->name('employees.edit');
    Route::put('employees/{employee}', [EmployeeController::class, 'update'])
        ->middleware('permission:employees.manage')
        ->name('employees.update');
    Route::patch('employees/{employee}/archive', [EmployeeController::class, 'archive'])
        ->middleware('permission:employees.manage')
        ->name('employees.archive');
    Route::patch('employees/{employee}/restore', [EmployeeController::class, 'restore'])
        ->middleware('permission:employees.manage')
        ->name('employees.restore');
    Route::patch('employees/{employee}/link-user', [EmployeeController::class, 'linkUser'])
        ->middleware('permission:employees.manage')
        ->name('employees.link-user');

    Route::get('documents', [DocumentController::class, 'index'])
        ->middleware('permission:documents.view')
        ->name('documents.index');
    Route::post('documents', [DocumentController::class, 'store'])
        ->middleware('permission:documents.manage')
        ->name('documents.store');
    Route::get('documents/{document}/download', [DocumentController::class, 'download'])
        ->middleware('permission:documents.view')
        ->name('documents.download');
    Route::get('documents/{document}/preview', [DocumentController::class, 'preview'])
        ->middleware('permission:documents.view')
        ->name('documents.preview');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])
        ->middleware('permission:documents.manage')
        ->name('documents.destroy');

    Route::get('leave', [LeaveController::class, 'index'])
        ->middleware('permission:leave.file|leave.approve')
        ->name('leave.index');
    Route::get('leave/create', [LeaveController::class, 'create'])
        ->middleware('permission:leave.file')
        ->name('leave.create');
    Route::post('leave', [LeaveController::class, 'store'])
        ->middleware('permission:leave.file')
        ->name('leave.store');
    Route::post('leave/{leaveRequest}/submit', [LeaveController::class, 'submit'])
        ->middleware('permission:leave.file')
        ->name('leave.submit');
    Route::get('leave/{leaveRequest}', [LeaveController::class, 'show'])
        ->middleware('permission:leave.file|leave.approve')
        ->name('leave.show');
    Route::post('leave/{leaveRequest}/approve', [LeaveController::class, 'approve'])
        ->middleware('permission:leave.approve')
        ->name('leave.approve');
    Route::patch('leave/{leaveRequest}/cancel', [LeaveController::class, 'cancel'])
        ->middleware('permission:leave.file')
        ->name('leave.cancel');

    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead'])
        ->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'markAllAsRead'])
        ->name('notifications.read-all');

    Route::get('leave-balances', [LeaveBalanceController::class, 'index'])
        ->middleware('permission:leave.approve')
        ->name('leave-balances.index');
    Route::post('leave-balances/upsert', [LeaveBalanceController::class, 'upsert'])
        ->middleware('permission:leave.approve')
        ->name('leave-balances.upsert');

    Route::get('personnel-movements', [PersonnelMovementController::class, 'index'])
        ->middleware('permission:movements.view')
        ->name('personnel-movements.index');
    Route::get('personnel-movements/create', [PersonnelMovementController::class, 'create'])
        ->middleware('permission:movements.manage')
        ->name('personnel-movements.create');
    Route::post('personnel-movements', [PersonnelMovementController::class, 'store'])
        ->middleware('permission:movements.manage')
        ->name('personnel-movements.store');
    Route::get('personnel-movements/{personnelMovement}', [PersonnelMovementController::class, 'show'])
        ->middleware('permission:movements.view')
        ->name('personnel-movements.show');

    Route::get('employees/{employee}/compensation', [EmployeeCompensationController::class, 'create'])
        ->middleware('permission:employees.manage')
        ->name('employee-compensation.create');
    Route::post('employees/{employee}/compensation', [EmployeeCompensationController::class, 'store'])
        ->middleware('permission:employees.manage')
        ->name('employee-compensation.store');

    Route::get('attendance', [AttendanceController::class, 'index'])
        ->middleware('permission:attendance.view')
        ->name('attendance.index');
    Route::get('attendance/log', [AttendanceController::class, 'create'])
        ->middleware('permission:attendance.manage')
        ->name('attendance.create');
    Route::post('attendance', [AttendanceController::class, 'store'])
        ->middleware('permission:attendance.manage')
        ->name('attendance.store');
    Route::post('attendance/bulk', [AttendanceController::class, 'bulkStore'])
        ->middleware('permission:attendance.manage')
        ->name('attendance.bulk-store');
    Route::post('attendance/biometric', [AttendanceController::class, 'biometricImport'])
        ->middleware('permission:attendance.manage')
        ->name('attendance.biometric-import');

    Route::get('work-schedules', [WorkScheduleController::class, 'index'])
        ->middleware('permission:attendance.manage')
        ->name('work-schedules.index');
    Route::post('work-schedules', [WorkScheduleController::class, 'store'])
        ->middleware('permission:attendance.manage')
        ->name('work-schedules.store');
    Route::put('work-schedules/{workSchedule}', [WorkScheduleController::class, 'update'])
        ->middleware('permission:attendance.manage')
        ->name('work-schedules.update');
    Route::delete('work-schedules/{workSchedule}', [WorkScheduleController::class, 'destroy'])
        ->middleware('permission:attendance.manage')
        ->name('work-schedules.destroy');

    Route::get('reports', [ReportController::class, 'index'])
        ->middleware('permission:reports.view|reports.export')
        ->name('reports.index');

    Route::middleware('permission:reports.export')->group(function () {
        Route::get('exports/masterlist/excel', [ExportController::class, 'masterlistExcel'])->name('exports.masterlist.excel');
        Route::get('exports/masterlist/csv', [ExportController::class, 'masterlistCsv'])->name('exports.masterlist.csv');
        Route::get('exports/masterlist/pdf', [ExportController::class, 'masterlistPdf'])->name('exports.masterlist.pdf');
        Route::get('exports/plantilla/excel', [ExportController::class, 'plantillaExcel'])->name('exports.plantilla.excel');
        Route::get('exports/plantilla/csv', [ExportController::class, 'plantillaCsv'])->name('exports.plantilla.csv');
        Route::get('exports/plantilla/pdf', [ExportController::class, 'plantillaPdf'])->name('exports.plantilla.pdf');
        Route::get('exports/leave-ledger/excel', [ExportController::class, 'leaveLedgerExcel'])->name('exports.leave-ledger.excel');
        Route::get('exports/leave-ledger/csv', [ExportController::class, 'leaveLedgerCsv'])->name('exports.leave-ledger.csv');
        Route::get('exports/leave-ledger/pdf', [ExportController::class, 'leaveLedgerPdf'])->name('exports.leave-ledger.pdf');
        Route::get('exports/attendance/excel', [ExportController::class, 'attendanceSummaryExcel'])->name('exports.attendance.excel');
        Route::get('exports/attendance/csv', [ExportController::class, 'attendanceSummaryCsv'])->name('exports.attendance.csv');
        Route::get('exports/attendance/pdf', [ExportController::class, 'attendanceSummaryPdf'])->name('exports.attendance.pdf');
        Route::get('exports/movements/excel', [ExportController::class, 'personnelMovementsExcel'])->name('exports.movements.excel');
        Route::get('exports/movements/csv', [ExportController::class, 'personnelMovementsCsv'])->name('exports.movements.csv');
        Route::get('exports/movements/pdf', [ExportController::class, 'personnelMovementsPdf'])->name('exports.movements.pdf');
        Route::get('exports/payroll-support/excel', [ExportController::class, 'payrollSupportExcel'])->name('exports.payroll-support.excel');
        Route::get('exports/payroll-support/csv', [ExportController::class, 'payrollSupportCsv'])->name('exports.payroll-support.csv');
        Route::get('exports/payroll-support/pdf', [ExportController::class, 'payrollSupportPdf'])->name('exports.payroll-support.pdf');
        Route::get('exports/service-record/{employee}/pdf', [ExportController::class, 'serviceRecordPdf'])->name('exports.service-record.pdf');
    });

    Route::get('reference-data', [ReferenceDataController::class, 'index'])
        ->middleware('permission:reference-data.manage')
        ->name('reference-data.index');
    Route::post('reference-data', [ReferenceDataController::class, 'store'])
        ->middleware('permission:reference-data.manage')
        ->name('reference-data.store');
    Route::put('reference-data/{id}', [ReferenceDataController::class, 'update'])
        ->middleware('permission:reference-data.manage')
        ->name('reference-data.update');
    Route::delete('reference-data/{id}', [ReferenceDataController::class, 'destroy'])
        ->middleware('permission:reference-data.manage')
        ->name('reference-data.destroy');

    Route::get('access-control', [UserController::class, 'index'])
        ->middleware('permission:access-control.manage')
        ->name('access-control.index');
    Route::post('access-control/users', [UserController::class, 'store'])
        ->middleware('permission:access-control.manage')
        ->name('access-control.users.store');
    Route::put('access-control/users/{user}', [UserController::class, 'update'])
        ->middleware('permission:access-control.manage')
        ->name('access-control.users.update');
    Route::delete('access-control/users/{user}', [UserController::class, 'destroy'])
        ->middleware('permission:access-control.manage')
        ->name('access-control.users.destroy');

    Route::post('import/employees', [ImportController::class, 'store'])
        ->middleware('permission:employees.manage')
        ->name('import.employees');
    Route::get('import/employees/template', [ImportController::class, 'template'])
        ->middleware('permission:employees.manage')
        ->name('import.employees.template');
});

require __DIR__.'/settings.php';
