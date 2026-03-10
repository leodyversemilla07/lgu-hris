<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentStoreRequest;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DocumentController extends Controller
{
    public function index(): InertiaResponse
    {
        $documents = EmployeeDocument::query()
            ->with(['employee', 'documentType', 'uploader'])
            ->latest()
            ->get()
            ->map(fn (EmployeeDocument $document): array => $this->mapDocument($document));

        $employees = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get(['id', 'first_name', 'middle_name', 'last_name', 'employee_number'])
            ->map(fn (Employee $employee): array => [
                'value' => (string) $employee->id,
                'label' => trim("{$employee->last_name}, {$employee->first_name}".($employee->middle_name ? " {$employee->middle_name}" : '')),
                'employee_number' => $employee->employee_number,
            ]);

        $documentTypes = DocumentType::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'is_confidential'])
            ->map(fn (DocumentType $documentType): array => [
                'value' => (string) $documentType->id,
                'label' => $documentType->name,
                'is_confidential' => $documentType->is_confidential,
            ]);

        return Inertia::render('documents/index', [
            'documents' => $documents,
            'employees' => $employees,
            'documentTypes' => $documentTypes,
        ]);
    }

    public function store(DocumentStoreRequest $request): RedirectResponse
    {
        $file = $request->file('file');
        $employee = Employee::query()->findOrFail($request->integer('employee_id'));
        $documentType = DocumentType::query()->findOrFail($request->integer('document_type_id'));

        $storagePath = "employee-documents/{$employee->id}/{$documentType->code}";
        $filePath = $file->store($storagePath, 'private');

        EmployeeDocument::query()->create([
            'employee_id' => $employee->id,
            'document_type_id' => $documentType->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $filePath,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType(),
            'uploaded_by' => $request->user()->id,
            'notes' => $request->string('notes')->trim()->value() ?: null,
            'is_confidential' => $request->boolean('is_confidential') || $documentType->is_confidential,
        ]);

        return redirect()->back();
    }

    public function download(EmployeeDocument $document): BinaryFileResponse
    {
        abort_unless(Storage::disk('private')->exists($document->file_path), 404);

        return response()->download(
            Storage::disk('private')->path($document->file_path),
            $document->file_name,
            ['Content-Type' => $document->mime_type],
        );
    }

    public function destroy(EmployeeDocument $document): RedirectResponse
    {
        Storage::disk('private')->delete($document->file_path);
        $document->delete();

        return redirect()->back();
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapDocument(EmployeeDocument $document): array
    {
        return [
            'id' => $document->id,
            'employee_id' => $document->employee_id,
            'employee_name' => trim(collect([
                $document->employee->first_name,
                $document->employee->middle_name,
                $document->employee->last_name,
            ])->filter()->join(' ')),
            'employee_number' => $document->employee->employee_number,
            'document_type' => $document->documentType->name,
            'file_name' => $document->file_name,
            'file_size' => $document->file_size,
            'file_size_formatted' => $this->formatFileSize($document->file_size),
            'mime_type' => $document->mime_type,
            'is_confidential' => $document->is_confidential,
            'notes' => $document->notes,
            'uploaded_by' => $document->uploader->name,
            'uploaded_at' => $document->created_at->format('M d, Y'),
        ];
    }

    protected function formatFileSize(int $bytes): string
    {
        if ($bytes < 1024) {
            return $bytes.' B';
        }

        if ($bytes < 1048576) {
            return round($bytes / 1024, 1).' KB';
        }

        return round($bytes / 1048576, 1).' MB';
    }
}
