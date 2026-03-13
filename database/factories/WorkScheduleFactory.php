<?php

namespace Database\Factories;

use App\Models\WorkSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WorkSchedule>
 */
class WorkScheduleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid' => fake()->uuid(),
            'name' => $this->faker->randomElement([
                'Regular 8-5',
                'Regular 7-4',
                'Shifting Morning',
                'Shifting Evening',
            ]),
            'time_in' => '08:00:00',
            'time_out' => '17:00:00',
            'break_minutes' => 60,
            'work_hours_per_day' => 8.00,
            'is_active' => true,
        ];
    }
}
