<?php

namespace Database\Seeders;

use App\Models\User;
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

        $employeeUser = User::query()->firstOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'HR Staff User',
            'email' => 'test@example.com',
            'password' => 'password',
            'email_verified_at' => now(),
        ]);

        $employeeUser->syncRoles(['HR Staff']);
    }
}
