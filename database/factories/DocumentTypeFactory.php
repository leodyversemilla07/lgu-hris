<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\DocumentType>
 */
class DocumentTypeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->bothify('DOCTYPE-##'),
            'name' => fake()->unique()->randomElement([
                'Appointment Paper',
                'Personal Data Sheet',
                'Service Record',
                'Medical Certificate',
                'Government ID',
                'Certificate of Employment',
                'Performance Evaluation',
                'Training Certificate',
            ]),
            'description' => fake()->sentence(),
            'is_confidential' => fake()->boolean(20),
            'is_active' => true,
        ];
    }
}
