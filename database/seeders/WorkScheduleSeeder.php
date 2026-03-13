<?php

namespace Database\Seeders;

use App\Models\WorkSchedule;
use Illuminate\Database\Seeder;

class WorkScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $schedules = [
            [
                'name' => 'Regular 8:00 AM – 5:00 PM',
                'time_in' => '08:00:00',
                'time_out' => '17:00:00',
                'break_minutes' => 60,
                'work_hours_per_day' => 8.00,
                'is_active' => true,
            ],
            [
                'name' => 'Regular 7:00 AM – 4:00 PM',
                'time_in' => '07:00:00',
                'time_out' => '16:00:00',
                'break_minutes' => 60,
                'work_hours_per_day' => 8.00,
                'is_active' => true,
            ],
            [
                'name' => 'Flexible 8:00 AM – 5:00 PM (No Lunch Break)',
                'time_in' => '08:00:00',
                'time_out' => '16:00:00',
                'break_minutes' => 0,
                'work_hours_per_day' => 8.00,
                'is_active' => true,
            ],
        ];

        foreach ($schedules as $schedule) {
            WorkSchedule::updateOrCreate(
                ['name' => $schedule['name']],
                $schedule,
            );
        }
    }
}
