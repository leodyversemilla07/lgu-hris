<?php

namespace App\Http\Requests;

use App\Models\AttendanceLog;
use Illuminate\Foundation\Http\FormRequest;

class AttendanceLogUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_id' => ['sometimes', 'required', 'integer', 'exists:employees,id'],
            'log_date' => [
                'sometimes',
                'required',
                'date',
                function ($attr, $value, $fail) {
                    $employeeId = $this->input('employee_id', $this->route('log'));
                    $logUuid = (string) $this->route('log');

                    $exists = AttendanceLog::query()
                        ->where('employee_id', $employeeId)
                        ->whereDate('log_date', $value)
                        ->where('uuid', '!=', $logUuid)
                        ->exists();

                    if ($exists) {
                        $fail('An attendance log for this employee on this date already exists.');
                    }
                },
            ],
            'time_in' => ['nullable', 'date_format:H:i'],
            'time_out' => ['nullable', 'date_format:H:i', 'after:time_in'],
            'status' => ['sometimes', 'required', 'in:present,absent,leave,holiday,rest_day,half_day'],
            'minutes_late' => ['nullable', 'integer', 'min:0', 'max:480'],
            'minutes_undertime' => ['nullable', 'integer', 'min:0', 'max:480'],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
