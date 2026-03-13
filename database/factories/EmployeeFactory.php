<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\WorkSchedule;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Employee>
 */
class EmployeeFactory extends Factory
{
    public function definition(): array
    {
        $department = Department::factory();

        return [
            'uuid' => fake()->uuid(),
            'employee_number' => 'EMP-'.fake()->unique()->numerify('####'),
            'first_name' => fake()->firstName(),
            'middle_name' => fake()->boolean(60) ? fake()->firstName() : null,
            'last_name' => fake()->lastName(),
            'suffix' => fake()->boolean(15) ? fake()->randomElement(['Jr.', 'Sr.', 'III']) : null,
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
            'birth_date' => fake()->dateTimeBetween('-55 years', '-21 years')->format('Y-m-d'),
            'hired_at' => fake()->dateTimeBetween('-15 years', 'now')->format('Y-m-d'),
            'department_id' => $department,
            'position_id' => Position::factory()->for($department),
            'employment_type_id' => EmploymentType::factory(),
            'employment_status_id' => EmploymentStatus::factory(),
            'work_schedule_id' => WorkSchedule::factory(),
            'is_active' => true,
            'archived_at' => null,
        ];
    }
}
