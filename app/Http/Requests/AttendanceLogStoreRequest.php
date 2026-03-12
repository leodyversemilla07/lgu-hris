<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceLogStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', 'exists:employees,id'],
            'log_date' => [
                'required',
                'date',
                function ($attr, $value, $fail) {
                    $exists = \App\Models\AttendanceLog::query()
                        ->where('employee_id', $this->input('employee_id'))
                        ->whereDate('log_date', $value)
                        ->exists();

                    if ($exists) {
                        $fail('An attendance log for this employee on this date already exists.');
                    }
                },
            ],
            'time_in' => ['nullable', 'date_format:H:i'],
            'time_out' => ['nullable', 'date_format:H:i', 'after:time_in'],
            'status' => ['required', 'in:present,absent,leave,holiday,rest_day,half_day'],
            'minutes_late' => ['nullable', 'integer', 'min:0', 'max:480'],
            'minutes_undertime' => ['nullable', 'integer', 'min:0', 'max:480'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
