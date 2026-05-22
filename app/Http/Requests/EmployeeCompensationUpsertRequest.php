<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EmployeeCompensationUpsertRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'salary_grade_id' => ['required', 'integer', 'exists:salary_grades,id'],
            'effective_date' => ['required', 'date'],
            'allowances' => ['numeric', 'min:0'],
            'deductions' => ['numeric', 'min:0'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
