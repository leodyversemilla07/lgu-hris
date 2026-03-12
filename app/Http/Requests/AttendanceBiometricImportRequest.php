<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AttendanceBiometricImportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:5120'],
            'device_name' => ['nullable', 'string', 'max:120'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Upload a biometric export file to continue.',
            'file.mimes' => 'The biometric export must be a CSV or text file.',
            'device_name.max' => 'The device name may not be greater than 120 characters.',
        ];
    }
}
