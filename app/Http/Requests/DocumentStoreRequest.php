<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('documents.manage') ?? false;
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'employee_id' => ['required', 'integer', Rule::exists('employees', 'id')],
            'document_type_id' => ['required', 'integer', Rule::exists('document_types', 'id')],
            'file' => ['required', 'file', 'max:10240', 'mimes:pdf,jpg,jpeg,png,doc,docx'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_confidential' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'employee_id.required' => 'Select the employee this document belongs to.',
            'employee_id.exists' => 'The selected employee does not exist.',
            'document_type_id.required' => 'Select the document type.',
            'document_type_id.exists' => 'The selected document type does not exist.',
            'file.required' => 'Please attach a file to upload.',
            'file.max' => 'The file may not be larger than 10 MB.',
            'file.mimes' => 'Only PDF, Word documents, and image files are accepted.',
        ];
    }
}
