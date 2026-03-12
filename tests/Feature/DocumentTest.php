<?php

use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeDocument;
use App\Models\Position;
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
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();

    EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'pds.pdf',
        'uploaded_by' => $user->id,
        'is_confidential' => true,
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents', 1)
            ->has('employees')
            ->has('documentTypes')
            ->where('documents.0.file_name', 'pds.pdf')
            ->where('documents.0.document_type', $documentType->name)
            ->where('documents.0.is_confidential', true)
            ->where('documents.0.is_previewable', true)
            ->where('employees.0.value', (string) $employee->id)
        );
});

test('documents index returns multiple records for frontend pagination', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->first();

    EmployeeDocument::factory()->count(12)->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents', 12)
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

test('hr staff can preview a document inline', function () {
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
        'mime_type' => 'application/pdf',
        'uploaded_by' => $user->id,
    ]);

    $this->actingAs($user)
        ->get(route('documents.preview', $document))
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf')
        ->assertHeader('content-disposition', 'inline; filename="pds.pdf"');
});

test('department head cannot download a confidential document from their department', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $department = Department::factory()->create();
    $position = Position::factory()->create(['department_id' => $department->id]);

    $user = User::factory()->create([
        'managed_department_id' => $department->id,
    ]);
    $user->assignRole('Department Head');

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);
    $documentType = DocumentType::where('code', 'PDS')->first();

    $path = "employee-documents/{$employee->id}/PDS/pds.pdf";
    Storage::disk('private')->put($path, 'dummy content');

    $document = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_path' => $path,
        'file_name' => 'pds.pdf',
        'uploaded_by' => User::factory()->create()->id,
        'is_confidential' => true,
    ]);

    $this->actingAs($user)
        ->get(route('documents.download', $document))
        ->assertForbidden();
});

test('department head cannot preview a confidential document from their department', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $department = Department::factory()->create();
    $position = Position::factory()->create(['department_id' => $department->id]);

    $user = User::factory()->create([
        'managed_department_id' => $department->id,
    ]);
    $user->assignRole('Department Head');

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);
    $documentType = DocumentType::where('code', 'PDS')->first();

    $path = "employee-documents/{$employee->id}/PDS/pds.pdf";
    Storage::disk('private')->put($path, 'dummy content');

    $document = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_path' => $path,
        'file_name' => 'pds.pdf',
        'mime_type' => 'application/pdf',
        'uploaded_by' => User::factory()->create()->id,
        'is_confidential' => true,
    ]);

    $this->actingAs($user)
        ->get(route('documents.preview', $document))
        ->assertForbidden();
});

test('department head can only see non-confidential documents from their managed department', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $managedDepartment = Department::factory()->create(['name' => 'Finance']);
    $otherDepartment = Department::factory()->create(['name' => 'Engineering']);
    $managedPosition = Position::factory()->create(['department_id' => $managedDepartment->id]);
    $otherPosition = Position::factory()->create(['department_id' => $otherDepartment->id]);

    $user = User::factory()->create([
        'managed_department_id' => $managedDepartment->id,
    ]);
    $user->assignRole('Department Head');

    $managedEmployee = Employee::factory()->create([
        'department_id' => $managedDepartment->id,
        'position_id' => $managedPosition->id,
    ]);
    $otherEmployee = Employee::factory()->create([
        'department_id' => $otherDepartment->id,
        'position_id' => $otherPosition->id,
    ]);

    $documentType = DocumentType::where('code', 'PDS')->first();

    EmployeeDocument::factory()->create([
        'employee_id' => $managedEmployee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'visible.pdf',
        'uploaded_by' => User::factory()->create()->id,
        'is_confidential' => false,
    ]);
    EmployeeDocument::factory()->create([
        'employee_id' => $managedEmployee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'hidden-confidential.pdf',
        'uploaded_by' => User::factory()->create()->id,
        'is_confidential' => true,
    ]);
    EmployeeDocument::factory()->create([
        'employee_id' => $otherEmployee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'hidden-outside.pdf',
        'uploaded_by' => User::factory()->create()->id,
        'is_confidential' => false,
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->has('documents', 1)
            ->where('documents.0.file_name', 'visible.pdf')
            ->has('employees', 1)
            ->where('employees.0.value', (string) $managedEmployee->id)
        );
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

test('uploading the same employee document type creates a new version', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->firstOrFail();

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'employee_id' => $employee->id,
            'document_type_id' => $documentType->id,
            'file' => UploadedFile::fake()->create('pds-v1.pdf', 100, 'application/pdf'),
            'notes' => 'Original file',
            'is_confidential' => false,
        ])
        ->assertRedirect();

    $firstVersion = EmployeeDocument::query()->latest('id')->firstOrFail();

    $this->actingAs($user)
        ->post(route('documents.store'), [
            'employee_id' => $employee->id,
            'document_type_id' => $documentType->id,
            'file' => UploadedFile::fake()->create('pds-v2.pdf', 120, 'application/pdf'),
            'notes' => 'Updated file',
            'is_confidential' => false,
        ])
        ->assertRedirect();

    $latestVersion = EmployeeDocument::query()->latest('id')->firstOrFail();

    expect($latestVersion->version_number)->toBe(2);
    expect($latestVersion->previous_version_id)->toBe($firstVersion->id);
    expect($latestVersion->root_document_id)->toBe($firstVersion->id);
    expect($latestVersion->is_current_version)->toBeTrue();

    expect($firstVersion->fresh()->version_number)->toBe(1);
    expect($firstVersion->fresh()->root_document_id)->toBe($firstVersion->id);
    expect($firstVersion->fresh()->is_current_version)->toBeFalse();
    expect($firstVersion->fresh()->replaced_at)->not->toBeNull();
});

test('documents index shows the current document version with previous history', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->firstOrFail();

    $firstVersion = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'pds-v1.pdf',
        'uploaded_by' => $user->id,
        'version_number' => 1,
        'is_current_version' => false,
        'replaced_at' => now(),
    ]);
    $firstVersion->update(['root_document_id' => $firstVersion->id]);

    EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'root_document_id' => $firstVersion->id,
        'previous_version_id' => $firstVersion->id,
        'file_name' => 'pds-v2.pdf',
        'uploaded_by' => $user->id,
        'version_number' => 2,
        'is_current_version' => true,
        'replaced_at' => null,
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents', 1)
            ->where('documents.0.file_name', 'pds-v2.pdf')
            ->where('documents.0.version_number', 2)
            ->where('documents.0.version_count', 2)
            ->where('documents.0.is_previewable', true)
            ->has('documents.0.version_history', 1)
            ->where('documents.0.version_history.0.file_name', 'pds-v1.pdf')
            ->where('documents.0.version_history.0.version_number', 1)
            ->where('documents.0.version_history.0.is_previewable', true)
        );
});

test('documents index marks previewable files for current and previous versions', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->firstOrFail();

    $firstVersion = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'pds-v1.pdf',
        'mime_type' => 'application/pdf',
        'uploaded_by' => $user->id,
        'version_number' => 1,
        'is_current_version' => false,
        'replaced_at' => now(),
    ]);
    $firstVersion->update(['root_document_id' => $firstVersion->id]);

    EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'root_document_id' => $firstVersion->id,
        'previous_version_id' => $firstVersion->id,
        'file_name' => 'pds-v2.pdf',
        'mime_type' => 'application/pdf',
        'uploaded_by' => $user->id,
        'version_number' => 2,
        'is_current_version' => true,
        'replaced_at' => null,
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->where('documents.0.is_previewable', true)
            ->where('documents.0.version_history.0.is_previewable', true)
        );
});

test('deleting the current document restores the previous version as current', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $user = User::factory()->create();
    $user->assignRole('HR Staff');

    $employee = Employee::factory()->create();
    $documentType = DocumentType::where('code', 'PDS')->firstOrFail();

    $firstPath = "employee-documents/{$employee->id}/PDS/pds-v1.pdf";
    $secondPath = "employee-documents/{$employee->id}/PDS/pds-v2.pdf";
    Storage::disk('private')->put($firstPath, 'first');
    Storage::disk('private')->put($secondPath, 'second');

    $firstVersion = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_path' => $firstPath,
        'file_name' => 'pds-v1.pdf',
        'uploaded_by' => $user->id,
        'version_number' => 1,
        'is_current_version' => false,
        'replaced_at' => now(),
    ]);
    $firstVersion->update(['root_document_id' => $firstVersion->id]);

    $currentVersion = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'root_document_id' => $firstVersion->id,
        'previous_version_id' => $firstVersion->id,
        'file_path' => $secondPath,
        'file_name' => 'pds-v2.pdf',
        'uploaded_by' => $user->id,
        'version_number' => 2,
        'is_current_version' => true,
        'replaced_at' => null,
    ]);

    $this->actingAs($user)
        ->delete(route('documents.destroy', $currentVersion))
        ->assertRedirect();

    $this->assertDatabaseMissing('employee_documents', ['id' => $currentVersion->id]);
    expect($firstVersion->fresh()->is_current_version)->toBeTrue();
    expect($firstVersion->fresh()->replaced_at)->toBeNull();
    Storage::disk('private')->assertMissing($secondPath);
});

test('department head does not see confidential document history versions', function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->seed(DocumentTypeSeeder::class);

    $department = Department::factory()->create();
    $position = Position::factory()->create(['department_id' => $department->id]);

    $user = User::factory()->create([
        'managed_department_id' => $department->id,
    ]);
    $user->assignRole('Department Head');

    $employee = Employee::factory()->create([
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);
    $documentType = DocumentType::where('code', 'PDS')->firstOrFail();

    $firstVersion = EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'file_name' => 'pds-v1.pdf',
        'uploaded_by' => User::factory()->create()->id,
        'version_number' => 1,
        'is_confidential' => true,
        'is_current_version' => false,
        'replaced_at' => now(),
    ]);
    $firstVersion->update(['root_document_id' => $firstVersion->id]);

    EmployeeDocument::factory()->create([
        'employee_id' => $employee->id,
        'document_type_id' => $documentType->id,
        'root_document_id' => $firstVersion->id,
        'previous_version_id' => $firstVersion->id,
        'file_name' => 'pds-v2.pdf',
        'uploaded_by' => User::factory()->create()->id,
        'version_number' => 2,
        'is_confidential' => false,
        'is_current_version' => true,
        'replaced_at' => null,
    ]);

    $this->actingAs($user)
        ->get(route('documents.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('documents/index')
            ->has('documents', 1)
            ->where('documents.0.file_name', 'pds-v2.pdf')
            ->where('documents.0.version_count', 1)
            ->has('documents.0.version_history', 0)
        );
});
