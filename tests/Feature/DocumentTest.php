<?php

use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\User;
use Database\Seeders\DocumentTypeSeeder;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    Storage::fake('private');
});

test('hr staff can view the documents index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents')
            ->has('employees')
            ->has('documentTypes')
        );
});

test('users without documents.view cannot access the documents index', function () {
    $this->seed(RoleAndPermissionSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertForbidden();
});

test('guests are redirected from the documents index', function () {
    $this->get(route('documents.index'))
        ->assertRedirect(route('login'));
});

test('hr staff can upload a document', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();

    $file = UploadedFile::fake()->create('pds.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'employee_id' => $employee->id,
            'document_type_id' => $documentType->id,
            'file' => $file,
            'notes' => 'Test upload',
            'is_confidential' => false,
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('employee_documents', [
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'pds.pdf',
        'uploaded_by' => $user->id,
    ]);

    Storage::disk('private')->assertExists(
        EmployeeDocument::query()->latest()->first()->file_path,
    );
});

test('uploaded document is stored in the private disk', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'SR')->first();

    $file = UploadedFile::fake()->create('service_record.pdf', 50, 'application/pdf');

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'employee_id' => $employee->id,
            'document_type_id' => $documentType->id,
            'file' => $file,
            'notes' => '',
            'is_confidential' => false,
        ]);

    $document = EmployeeDocument::query()->latest()->first();
    Storage::disk('private')->assertExists($document->file_path);
    expect($document->file_path)->toContain("employee-documents/{$employee->id}/{$documentType->code}");
});

test('hr staff can download a document', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();

    $path = "employee-documents/{$employee->id}/PDS/pds.pdf";
    Storage::disk('private')->put($path, 'dummy content');

    $document = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_path' => $path,
        'file_name' => 'pds.pdf',
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('documents.download', $document))
        ->assertOk()
        ->assertDownload('pds.pdf');
});

test('hr staff can delete a document and file is removed from disk', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();

    $path = "employee-documents/{$employee->id}/PDS/pds.pdf";
    Storage::disk('private')->put($path, 'dummy content');

    $document = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_path' => $path,
        'file_name' => 'pds.pdf',
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete(route('documents.destroy', $document))
        ->assertRedirect();

    $this->assertDatabaseMissing('employee_documents', ['id' => $document->id]);
    Storage::disk('private')->assertMissing($path);
});

test('users without documents.manage cannot upload', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();
    $file = UploadedFile::fake()->create('pds.pdf', 100, 'application/pdf');

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'employee_id' => $employee->id,
            'document_type_id' => $documentType->id,
            'file' => $file,
        ])
        ->assertForbidden();
});

test('users without documents.manage cannot delete', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('Employee');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();

    $path = "employee-documents/{$employee->id}/PDS/pds.pdf";
    Storage::disk('private')->put($path, 'dummy content');

    $document = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_path' => $path,
        'file_name' => 'pds.pdf',
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->delete(route('documents.destroy', $document))
        ->assertForbidden();
});
