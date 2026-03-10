<?php

namespace Database\Factories;

use App\Models\AttendanceSummary;
use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttendanceSummary>
 */
class AttendanceSummaryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'year' => now()->year,
            'month' => now()->month,
            'days_present' => $this->faker->numberBetween(18, 22),
            'days_absent' => $this->faker->numberBetween(0, 2),
            'days_leave' => $this->faker->numberBetween(0, 2),
            'days_holiday' => $this->faker->numberBetween(0, 2),
            'days_rest_day' => 8,
            'total_late_minutes' => $this->faker->numberBetween(0, 60),
            'total_undertime_minutes' => $this->faker->numberBetween(0, 30),
        ];
    }
}
