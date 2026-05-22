<?php

namespace Database\Factories;

use App\Models\BiometricDevice;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BiometricDevice>
 */
class BiometricDeviceFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company().' Scanner',
            'brand' => fake()->randomElement(['zkteco', 'hikvision']),
            'model_number' => fake()->bothify('Model-####'),
            'serial_number' => fake()->unique()->bothify('SN-########'),
            'ip_address' => fake()->ipv4(),
            'port' => fake()->randomElement([4370, 80, 8080]),
            'protocol' => fake()->randomElement(['push', 'poll']),
            'location' => fake()->randomElement(['Main Lobby', 'HR Office', 'Staff Entrance']),
            'is_active' => true,
            'last_sync_at' => null,
        ];
    }
}
