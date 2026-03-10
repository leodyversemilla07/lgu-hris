<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PersonnelMovementStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $optionalFk = fn (string $table) => [
            'nullable',
            function ($attr, $value, $fail) use ($table) {
                if ($value === 'none' || $value === null || $value === '') {
                    return;
                }
                if (! is_numeric($value) || ! \DB::table($table)->where('id', $value)->exists()) {
                    $fail("The selected {$attr} is invalid.");
                }
            },
        ];

        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'movement_type_id' => ['required', 'integer', 'exists:movement_types,id'],
            'effective_date' => ['required', 'date'],
            'from_department_id' => $optionalFk('departments'),
            'to_department_id' => $optionalFk('departments'),
            'from_position_id' => $optionalFk('positions'),
            'to_position_id' => $optionalFk('positions'),
            'from_employment_status_id' => $optionalFk('employment_statuses'),
            'to_employment_status_id' => $optionalFk('employment_statuses'),
            'order_number' => ['nullable', 'string', 'max:100'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
