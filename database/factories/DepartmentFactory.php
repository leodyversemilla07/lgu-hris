<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Department>
 */
class DepartmentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('DEPT-##'),
            'name' => fake()->unique()->company().' Department',
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
