<?php

namespace Database\Factories;

use App\Models\SalaryGrade;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SalaryGrade>
 */
class SalaryGradeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'grade' => $this->faker->numberBetween(1, 33),
            'step' => $this->faker->numberBetween(1, 8),
            'monthly_salary' => $this->faker->randomFloat(2, 13000, 182000),
        ];
    }
}
