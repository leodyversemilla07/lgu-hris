<?php

namespace Database\Factories;

use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\EmployeeDocument>
 */
class EmployeeDocumentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'uuid' => fake()->uuid(),
            'employee_id' => Employee::factory(),
            'document_type_id' => DocumentType::factory(),
            'root_document_id' => null,
            'previous_version_id' => null,
            'version_number' => 1,
            'file_name' => fake()->slug(3).'.pdf',
            'file_path' => 'employee-documents/'.fake()->numerify('##').'/'.fake()->slug(3).'.pdf',
            'file_size' => fake()->numberBetween(50000, 5000000),
            'mime_type' => 'application/pdf',
            'uploaded_by' => User::factory(),
            'notes' => fake()->boolean(40) ? fake()->sentence() : null,
            'is_confidential' => false,
            'is_current_version' => true,
            'replaced_at' => null,
        ];
    }
}
