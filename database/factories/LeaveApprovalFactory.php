<?php

namespace Database\Factories;

use App\Models\LeaveRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\LeaveApproval>
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
