<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeCompensationUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'salary_grade_id' => ['sometimes', 'required', 'integer', 'exists:salary_grades,id'],
            'effective_date' => ['sometimes', 'required', 'date'],
            'allowances' => ['sometimes', 'numeric', 'min:0'],
            'deductions' => ['sometimes', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
