<?php

namespace Database\Factories;

use App\Models\EmploymentType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmploymentType>
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
