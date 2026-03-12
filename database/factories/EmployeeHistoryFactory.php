<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\PersonnelMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployeeHistory>
 */
class EmployeeHistoryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'event_type' => 'profile_updated',
            'title' => 'Employment profile updated',
            'description' => fake()->sentence(),
            'effective_date' => fake()->dateTimeBetween('-1 year', 'now')->format('Y-m-d'),
            'before_values' => [
                'department' => 'Finance Office',
            ],
            'after_values' => [
                'department' => 'Human Resource Office',
            ],
            'source_type' => PersonnelMovement::class,
            'source_id' => fake()->numberBetween(1, 9999),
            'recorded_by' => User::factory(),
        ];
    }
}
