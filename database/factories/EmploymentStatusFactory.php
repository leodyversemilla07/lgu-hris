<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmploymentStatus>
 */
class EmploymentStatusFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('STAT-##'),
            'name' => fake()->unique()->randomElement(['Active', 'On Leave', 'Separated', 'Retired']),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
