<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentStoreRequest;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class DocumentController extends Controller
{
    public function index(Request $request): InertiaResponse
    {
        $this->authorize('viewAny', EmployeeDocument::class);

        $user = $request->user();
        $documentQuery = EmployeeDocument::query()
            ->with(['employee', 'documentType', 'uploader', 'versionHistory.uploader'])
            ->where('is_current_version', true)
            ->latest();
        $employeeQuery = Employee::query()
            ->where('is_active', true)
            ->orderBy('last_name')
            ->orderBy('first_name');

        if ($user->hasRole('Department Head')) {
            $departmentId = $user->managed_department_id;

            if ($departmentId !== null) {
                $documentQuery->whereHas('employee', fn ($query) => $query->where('department_id', $departmentId))
                    ->where('is_confidential', false);
                $employeeQuery->where('department_id', $departmentId);
            } else {
                $documentQuery->whereRaw('1 = 0');
                $employeeQuery->whereRaw('1 = 0');
            }
        }

        $documents = $documentQuery
            ->get()
            ->map(fn (EmployeeDocument $document): array => $this->mapDocument($document, $user));

        $employees = $employeeQuery
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
        $this->authorize('create', EmployeeDocument::class);

        $file = $request->file('file');
        $employee = Employee::query()->findOrFail($request->integer('employee_id'));
        $documentType = DocumentType::query()->findOrFail($request->integer('document_type_id'));

        $storagePath = "employee-documents/{$employee->id}/{$documentType->code}";
        $filePath = $file->store($storagePath, 'private');

        try {
            DB::transaction(function () use ($request, $employee, $documentType, $file, $filePath): void {
                $currentDocument = EmployeeDocument::query()
                    ->where('employee_id', $employee->id)
                    ->where('document_type_id', $documentType->id)
                    ->where('is_current_version', true)
                    ->lockForUpdate()
                    ->first();

                $document = EmployeeDocument::query()->create([
                    'employee_id' => $employee->id,
                    'document_type_id' => $documentType->id,
                    'root_document_id' => $currentDocument?->root_document_id ?? $currentDocument?->id,
                    'previous_version_id' => $currentDocument?->id,
                    'version_number' => ($currentDocument?->version_number ?? 0) + 1,
                    'file_name' => $file->getClientOriginalName(),
                    'file_path' => $filePath,
                    'file_size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'uploaded_by' => $request->user()->id,
                    'notes' => $request->string('notes')->trim()->value() ?: null,
                    'is_confidential' => $request->boolean('is_confidential') || $documentType->is_confidential,
                    'is_current_version' => true,
                    'replaced_at' => null,
                ]);

                if ($currentDocument) {
                    $currentDocument->update([
                        'is_current_version' => false,
                        'replaced_at' => now(),
                    ]);
                } else {
                    $document->update([
                        'root_document_id' => $document->id,
                    ]);
                }
            });
        } catch (Throwable $exception) {
            Storage::disk('private')->delete($filePath);

            throw $exception;
        }

        return redirect()->back();
    }

    public function download(EmployeeDocument $document): BinaryFileResponse
    {
        $this->authorize('view', $document);

        abort_unless(Storage::disk('private')->exists($document->file_path), 404);

        return response()->download(
            Storage::disk('private')->path($document->file_path),
            $document->file_name,
            ['Content-Type' => $document->mime_type],
        );
    }

    public function preview(EmployeeDocument $document): BinaryFileResponse
    {
        $this->authorize('view', $document);

        abort_unless($this->isPreviewableMimeType($document->mime_type), Response::HTTP_UNSUPPORTED_MEDIA_TYPE);
        abort_unless(Storage::disk('private')->exists($document->file_path), 404);

        return response()->file(
            Storage::disk('private')->path($document->file_path),
            [
                'Content-Type' => $document->mime_type,
                'Content-Disposition' => 'inline; filename="'.$document->file_name.'"',
            ],
        );
    }

    public function destroy(EmployeeDocument $document): RedirectResponse
    {
        $this->authorize('delete', $document);

        $filePath = $document->file_path;

        DB::transaction(function () use ($document): void {
            $document->load(['previousVersion', 'nextVersions']);
            $nextVersion = $document->nextVersions->sortBy('version_number')->first();

            if ($nextVersion) {
                $nextVersion->update([
                    'previous_version_id' => $document->previous_version_id,
                ]);
            }

            if ($document->root_document_id === $document->id && $nextVersion) {
                EmployeeDocument::query()
                    ->where('root_document_id', $document->id)
                    ->update(['root_document_id' => $nextVersion->id]);
            }

            if ($document->is_current_version && $document->previousVersion) {
                $document->previousVersion->update([
                    'is_current_version' => true,
                    'replaced_at' => null,
                ]);
            }

            $document->delete();
        });

        Storage::disk('private')->delete($filePath);

        return redirect()->back();
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapDocument(EmployeeDocument $document, User $user): array
    {
        $visibleHistory = $document->versionHistory
            ->filter(fn (EmployeeDocument $version): bool => $version->id !== $document->id)
            ->when(
                $user->hasRole('Department Head'),
                fn ($versions) => $versions->where('is_confidential', false),
            )
            ->sortByDesc('version_number')
            ->values()
            ->map(fn (EmployeeDocument $version): array => $this->mapDocumentVersion($version))
            ->all();

        return [
            'id' => $document->id,
            'uuid' => $document->uuid,
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
            'is_current_version' => $document->is_current_version,
            'version_number' => $document->version_number,
            'version_count' => count($visibleHistory) + 1,
            'version_history' => $visibleHistory,
            'notes' => $document->notes,
            'uploaded_by' => $document->uploader->name,
            'uploaded_at' => $document->created_at->format('M d, Y'),
            'is_previewable' => $this->isPreviewableMimeType($document->mime_type),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    protected function mapDocumentVersion(EmployeeDocument $document): array
    {
        return [
            'id' => $document->id,
            'uuid' => $document->uuid,
            'file_name' => $document->file_name,
            'file_size_formatted' => $this->formatFileSize($document->file_size),
            'is_confidential' => $document->is_confidential,
            'notes' => $document->notes,
            'uploaded_by' => $document->uploader->name,
            'uploaded_at' => $document->created_at->format('M d, Y'),
            'version_number' => $document->version_number,
            'mime_type' => $document->mime_type,
            'is_previewable' => $this->isPreviewableMimeType($document->mime_type),
        ];
    }

    protected function isPreviewableMimeType(?string $mimeType): bool
    {
        if ($mimeType === null) {
            return false;
        }

        return str_starts_with($mimeType, 'image/')
            || $mimeType === 'application/pdf'
            || str_starts_with($mimeType, 'text/');
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
