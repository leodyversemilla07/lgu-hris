<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->admin = User::factory()->create();
    $this->admin->assignRole('HR Admin');

    $this->dept = Department::factory()->create(['name' => 'Finance', 'is_active' => true]);
    $this->pos = Position::factory()->create(['name' => 'Accountant I', 'department_id' => $this->dept->id, 'is_active' => true]);
    $this->empType = EmploymentType::factory()->create(['name' => 'Permanent', 'is_active' => true]);
    $this->empStatus = EmploymentStatus::factory()->create(['name' => 'Permanent', 'is_active' => true]);
});

test('hr admin can download the employee import template', function () {
    $this->actingAs($this->admin)
        ->get(route('import.employees.template'))
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('employee role cannot access import endpoint', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $file = UploadedFile::fake()->create('employees.csv', 1, 'text/csv');

    $this->actingAs($user)
        ->post(route('import.employees'), ['file' => $file])
        ->assertForbidden();
});

test('import rejects non-csv/xlsx files', function () {
    $file = UploadedFile::fake()->create('employees.pdf', 10, 'application/pdf');

    $this->actingAs($this->admin)
        ->post(route('import.employees'), ['file' => $file])
        ->assertSessionHasErrors('file');
});

test('hr admin can import employees from a valid csv', function () {
    $before = Employee::count();

    $csv = implode("\n", [
        'employee_number,first_name,middle_name,last_name,suffix,email,phone,birth_date,hired_at,department,position,employment_type,employment_status',
        "IMP-001,Maria,Santos,Reyes,,maria@lgu.gov.ph,09170000001,1992-03-10,2021-01-15,{$this->dept->name},{$this->pos->name},{$this->empType->name},{$this->empStatus->name}",
    ]);

    $file = UploadedFile::fake()->createWithContent('employees.csv', $csv);

    $this->actingAs($this->admin)
        ->post(route('import.employees'), ['file' => $file])
        ->assertRedirect(route('employees.index'));

    expect(Employee::count())->toBeGreaterThan($before);
    expect(Employee::where('employee_number', 'IMP-001')->exists())->toBeTrue();
});

test('import updates existing employee on duplicate employee_number', function () {
    $emp = Employee::factory()->create([
        'employee_number' => 'UPD-001',
        'first_name' => 'Original',
        'last_name' => 'TestLast',
        'department_id' => $this->dept->id,
        'position_id' => $this->pos->id,
        'employment_type_id' => $this->empType->id,
        'employment_status_id' => $this->empStatus->id,
    ]);

    $csv = implode("\n", [
        'employee_number,first_name,middle_name,last_name,suffix,email,phone,birth_date,hired_at,department,position,employment_type,employment_status',
        "UPD-001,Updated,,TestLast,,,,1990-01-01,2020-06-01,{$this->dept->name},{$this->pos->name},{$this->empType->name},{$this->empStatus->name}",
    ]);

    $file = UploadedFile::fake()->createWithContent('employees.csv', $csv);

    $this->actingAs($this->admin)
        ->post(route('import.employees'), ['file' => $file])
        ->assertRedirect(route('employees.index'));

    expect($emp->fresh()->first_name)->toBe('Updated');
});

test('import skips rows with unresolvable references', function () {
    $before = Employee::count();

    $csv = implode("\n", [
        'employee_number,first_name,middle_name,last_name,suffix,email,phone,birth_date,hired_at,department,position,employment_type,employment_status',
        'BAD-001,Test,,User,,,,,, NonExistentDept,NonExistentPos,Permanent,Permanent',
    ]);

    $file = UploadedFile::fake()->createWithContent('employees.csv', $csv);

    $this->actingAs($this->admin)
        ->post(route('import.employees'), ['file' => $file])
        ->assertRedirect(route('employees.index'));

    expect(Employee::count())->toBe($before);
});
