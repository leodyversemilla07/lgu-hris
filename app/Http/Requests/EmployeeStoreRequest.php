<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('employees.manage') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employee_number' => ['required', 'string', 'max:50', 'unique:employees,employee_number'],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255', 'unique:employees,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'hired_at' => ['required', 'date'],
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'position_id' => ['required', 'integer', Rule::exists('positions', 'id')],
            'employment_type_id' => ['required', 'integer', Rule::exists('employment_types', 'id')],
            'employment_status_id' => ['required', 'integer', Rule::exists('employment_statuses', 'id')],
            'is_active' => ['required', 'boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employee_number.required' => 'Provide the employee ID or plantilla number.',
            'employee_number.unique' => 'This employee number is already assigned.',
            'first_name.required' => 'Enter the employee first name.',
            'last_name.required' => 'Enter the employee last name.',
            'hired_at.required' => 'Select the employee appointment or start date.',
            'department_id.required' => 'Select the assigned department.',
            'position_id.required' => 'Select the assigned position.',
            'employment_type_id.required' => 'Select the employment type.',
            'employment_status_id.required' => 'Select the employment status.',
        ];
    }
}
