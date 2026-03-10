<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmploymentType>
 */
class EmploymentTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('TYPE-##'),
            'name' => fake()->unique()->randomElement(['Permanent', 'Casual', 'Contract of Service', 'Job Order']),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
