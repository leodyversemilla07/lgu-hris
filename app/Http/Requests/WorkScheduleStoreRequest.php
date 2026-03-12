<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WorkScheduleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('attendance.manage') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255', Rule::unique('work_schedules', 'name')],
            'time_in' => ['required', 'date_format:H:i'],
            'time_out' => ['required', 'date_format:H:i'],
            'break_minutes' => ['required', 'integer', 'min:0', 'max:240'],
            'work_hours_per_day' => ['required', 'numeric', 'min:0.5', 'max:24'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Provide a schedule name.',
            'name.unique' => 'That work schedule name is already in use.',
            'time_in.required' => 'Set the schedule start time.',
            'time_out.required' => 'Set the schedule end time.',
            'break_minutes.required' => 'Set the break duration in minutes.',
            'work_hours_per_day.required' => 'Set the work hours per day.',
        ];
    }
}
