<?php

namespace Database\Factories;

use App\Models\LeaveApproval;
use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<LeaveApproval>
 */
class LeaveApprovalFactory extends Factory
{
    public function definition(): array
    {
        return [
            'leave_request_id' => LeaveRequest::factory(),
            'action' => fake()->randomElement(['submitted', 'approved', 'rejected', 'cancelled']),
            'remarks' => fake()->boolean() ? fake()->sentence() : null,
            'acted_by' => User::factory(),
            'acted_at' => now(),
        ];
    }
}
