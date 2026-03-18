<?php

namespace Database\Factories;

use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveRequest>
 */
class LeaveRequestFactory extends Factory
{
    public function definition(): array
    {
        $start = fake()->dateTimeBetween('first day of this year', '+3 months');
        $end = (clone $start)->modify('+'.fake()->numberBetween(0, 4).' days');

        return [
            'uuid' => fake()->uuid(),
            'employee_id' => Employee::factory(),
            'leave_type_id' => LeaveType::factory(),
            'start_date' => $start->format('Y-m-d'),
            'end_date' => $end->format('Y-m-d'),
            'days_requested' => fake()->randomElement([1, 2, 3, 5]),
            'reason' => fake()->sentence(),
            'status' => 'submitted',
            'submitted_at' => now(),
            'actioned_by' => null,
            'actioned_at' => null,
            'remarks' => null,
        ];
    }
}
