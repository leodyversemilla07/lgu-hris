<?php

namespace Database\Factories;

use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveType>
 */
class LeaveTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('??')),
            'name' => fake()->words(3, true),
            'max_days_per_year' => fake()->randomElement([5, 10, 15, 30, null]),
            'requires_approval' => true,
            'is_active' => true,
        ];
    }
}
