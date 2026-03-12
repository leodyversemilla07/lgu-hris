<?php

namespace App\Services;

use App\Models\ReportExport;
use App\Models\User;

class ReportExportService
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public static function record(
        User $user,
        string $reportKey,
        string $reportName,
        string $format,
        string $fileName,
        array $filters = [],
        ?int $departmentId = null,
        ?int $employeeId = null,
    ): void {
        $normalizedFilters = collect($filters)
            ->reject(fn (mixed $value): bool => $value === null || $value === '' || $value === 'all')
            ->all();

        ReportExport::query()->create([
            'user_id' => $user->id,
            'report_key' => $reportKey,
            'report_name' => $reportName,
            'export_format' => strtolower($format),
            'file_name' => $fileName,
            'department_id' => $departmentId,
            'employee_id' => $employeeId,
            'filters' => $normalizedFilters === [] ? null : $normalizedFilters,
            'exported_at' => now(),
        ]);
    }
}
