<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\MovementType;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PersonnelMovement>
 */
class PersonnelMovementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'movement_type_id' => MovementType::factory(),
            'effective_date' => fake()->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'from_department_id' => null,
            'to_department_id' => null,
            'from_position_id' => null,
            'to_position_id' => null,
            'from_employment_status_id' => null,
            'to_employment_status_id' => null,
            'order_number' => fake()->boolean(60) ? strtoupper(fake()->bothify('CSC-####-##')) : null,
            'remarks' => fake()->boolean(50) ? fake()->sentence() : null,
            'recorded_by' => User::factory(),
        ];
    }
}
