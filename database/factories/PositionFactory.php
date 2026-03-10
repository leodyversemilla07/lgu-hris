<?php

namespace Database\Factories;

use App\Models\Department;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Position>
 */
class PositionFactory extends Factory
{
    public function definition(): array
    {
        return [
            'department_id' => Department::factory(),
            'code' => fake()->unique()->bothify('POS-###'),
            'name' => fake()->unique()->jobTitle(),
            'salary_grade' => 'SG-'.fake()->numberBetween(1, 24),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
