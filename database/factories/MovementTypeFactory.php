<?php

namespace Database\Factories;

use App\Models\MovementType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<MovementType>
 */
class MovementTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->unique()->lexify('???')),
            'name' => fake()->words(2, true),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
