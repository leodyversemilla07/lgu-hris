<?php

namespace Database\Factories;

use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttendanceLog>
 */
class AttendanceLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'log_date' => $this->faker->dateTimeBetween('-3 months', 'now')->format('Y-m-d'),
            'time_in' => '08:00:00',
            'time_out' => '17:00:00',
            'status' => 'present',
            'minutes_late' => 0,
            'minutes_undertime' => 0,
            'remarks' => null,
            'source' => 'manual',
            'recorded_by' => User::factory(),
        ];
    }
}
