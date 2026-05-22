<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LeaveRequestUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'required', 'integer', 'exists:employees,id'],
            'leave_type_id' => ['sometimes', 'required', 'integer', 'exists:leave_types,id'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['sometimes', 'required', 'date', 'gte:start_date'],
            'days_requested' => ['sometimes', 'required', 'numeric', 'min:0.5', 'max:365'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'end_date.gte' => 'The end date must be after or equal to the start date.',
        ];
    }
}
