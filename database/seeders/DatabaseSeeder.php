<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call(RoleAndPermissionSeeder::class);
        $this->call(HrReferenceSeeder::class);
        $this->call(DocumentTypeSeeder::class);
        $this->call(LeaveTypeSeeder::class);
        $this->call(MovementTypeSeeder::class);
        $this->call(SalaryGradeSeeder::class);
        $this->call(WorkScheduleSeeder::class);
    }
}
