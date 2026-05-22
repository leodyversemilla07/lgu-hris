<?php

namespace Database\Factories;

use App\Models\BiometricDevice;
use App\Models\BiometricRawLog;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BiometricRawLog>
 */
class BiometricRawLogFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'biometric_device_id' => BiometricDevice::factory(),
            'employee_external_id' => 'EMP-'.fake()->numerify('####'),
            'timestamp' => fake()->dateTimeBetween('-1 month', 'now'),
            'punch_type' => fake()->randomElement(['0', '1', '4', '5']), // 0:In, 1:Out, etc.
            'verify_mode' => fake()->randomElement(['Finger', 'Face', 'Card', 'Password']),
            'raw_payload' => null,
            'is_processed' => false,
        ];
    }
}
