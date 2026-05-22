<?php

namespace Database\Factories;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'uuid' => fake()->uuid(),
            'user_id' => User::factory(),
            'event' => fake()->randomElement(['created', 'updated', 'deleted', 'login', 'logout']),
            'auditable_type' => fake()->randomElement(['App\Models\Employee', 'App\Models\LeaveRequest']),
            'auditable_id' => fake()->randomNumber(),
            'description' => fake()->sentence(),
            'old_values' => null,
            'new_values' => null,
            'ip_address' => fake()->ipv4(),
            'created_at' => now(),
        ];
    }
}
