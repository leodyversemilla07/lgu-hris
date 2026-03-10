<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\SalaryGrade;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<EmployeeCompensation>
 */
class EmployeeCompensationFactory extends Factory
{
    public function definition(): array
    {
        return [
            'employee_id' => Employee::factory(),
            'salary_grade_id' => SalaryGrade::factory(),
            'effective_date' => $this->faker->dateTimeBetween('-2 years', 'now')->format('Y-m-d'),
            'allowances' => 0.00,
            'deductions' => 0.00,
            'notes' => null,
            'recorded_by' => User::factory(),
        ];
    }
}
