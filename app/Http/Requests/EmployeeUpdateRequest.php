<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class EmployeeUpdateRequest extends FormRequest
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
        $employeeId = $this->route('employee')?->id;

        return [
            'employee_number' => ['required', 'string', 'max:50', Rule::unique('employees', 'employee_number')->ignore($employeeId)],
            'first_name' => ['required', 'string', 'max:255'],
            'middle_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'suffix' => ['nullable', 'string', 'max:50'],
            'sex' => ['nullable', Rule::in(['male', 'female'])],
            'civil_status' => ['nullable', Rule::in(['single', 'married', 'widowed', 'separated', 'divorced'])],
            'email' => ['nullable', 'email', 'max:255', Rule::unique('employees', 'email')->ignore($employeeId)],
            'phone' => ['nullable', 'string', 'max:50'],
            'birth_date' => ['nullable', 'date', 'before:today'],
            'address_street' => ['nullable', 'string', 'max:255'],
            'address_city' => ['nullable', 'string', 'max:100'],
            'address_province' => ['nullable', 'string', 'max:100'],
            'address_zip' => ['nullable', 'string', 'max:20'],
            'tin' => ['nullable', 'string', 'max:50'],
            'gsis_number' => ['nullable', 'string', 'max:50'],
            'philhealth_number' => ['nullable', 'string', 'max:50'],
            'pagibig_number' => ['nullable', 'string', 'max:50'],
            'sss_number' => ['nullable', 'string', 'max:50'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_relationship' => ['nullable', 'string', 'max:100'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
            'hired_at' => ['required', 'date'],
            'department_id' => ['required', 'integer', Rule::exists('departments', 'id')],
            'position_id' => ['required', 'integer', Rule::exists('positions', 'id')],
            'employment_type_id' => ['required', 'integer', Rule::exists('employment_types', 'id')],
            'employment_status_id' => ['required', 'integer', Rule::exists('employment_statuses', 'id')],
            'work_schedule_id' => ['nullable', 'integer', Rule::exists('work_schedules', 'id')],
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
