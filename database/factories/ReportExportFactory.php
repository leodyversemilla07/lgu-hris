<?php

namespace Database\Factories;

use App\Models\ReportExport;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ReportExport>
 */
class ReportExportFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'report_key' => 'personnel_masterlist',
            'report_name' => 'Personnel Masterlist',
            'export_format' => 'excel',
            'file_name' => 'personnel-masterlist.xlsx',
            'department_id' => null,
            'employee_id' => null,
            'filters' => [
                'status' => 'active',
            ],
            'exported_at' => now(),
        ];
    }
}
