<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\ReportExport;
use App\Models\SalaryGrade;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->hrAdmin = User::factory()->create();
    $this->hrAdmin->assignRole('HR Admin');

    $this->dept = Department::factory()->create(['name' => 'Finance', 'is_active' => true]);
    $this->pos = Position::factory()->create(['department_id' => $this->dept->id, 'is_active' => true]);
    $this->empType = EmploymentType::factory()->create(['is_active' => true]);
    $this->empStatus = EmploymentStatus::factory()->create(['is_active' => true]);
});

function makeReportEmployee(array $attrs = []): Employee
{
    return Employee::factory()->create(array_merge([
        'department_id' => test()->dept->id,
        'position_id' => test()->pos->id,
        'employment_type_id' => test()->empType->id,
        'employment_status_id' => test()->empStatus->id,
        'is_active' => true,
    ], $attrs));
}

// --- Access Control ---

test('unauthenticated users cannot access reports', function () {
    $this->get('/reports')->assertRedirect('/login');
});

test('hr admin can view reports page', function () {
    $this->actingAs($this->hrAdmin)->get('/reports')->assertOk();
});

test('department head reports page is scoped to their managed department', function () {
    $managedDepartment = Department::factory()->create(['name' => 'HR', 'is_active' => true]);
    $otherDepartment = Department::factory()->create(['name' => 'Engineering', 'is_active' => true]);
    $managedPosition = Position::factory()->create(['department_id' => $managedDepartment->id, 'is_active' => true]);
    $otherPosition = Position::factory()->create(['department_id' => $otherDepartment->id, 'is_active' => true]);

    $departmentHead = User::factory()->create([
        'managed_department_id' => $managedDepartment->id,
    ]);
    $departmentHead->assignRole('Department Head');

    $managedEmployee = makeReportEmployee([
        'department_id' => $managedDepartment->id,
        'position_id' => $managedPosition->id,
        'first_name' => 'Alicia',
        'last_name' => 'Rivera',
        'employee_number' => 'EMP-HR-001',
    ]);
    makeReportEmployee([
        'department_id' => $otherDepartment->id,
        'position_id' => $otherPosition->id,
        'first_name' => 'Berto',
        'last_name' => 'Lopez',
        'employee_number' => 'EMP-ENG-001',
    ]);

    $this->actingAs($departmentHead)
        ->get('/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('departments', 1)
            ->has('employees', 1)
            ->where('departments.0.value', (string) $managedDepartment->id)
            ->where('employees.0.value', (string) $managedEmployee->id)
        );
});

test('employee role is blocked from reports', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');
    $this->actingAs($user)->get('/reports')->assertForbidden();
});

// --- Dashboard Payload ---

test('dashboard returns organization cards charts and recent records', function () {
    makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->where('dashboardType', 'organization')
            ->has('cards', 4)
            ->has('charts', 2)
            ->has('charts.0.items')
            ->has('charts.1.items')
            ->has('recentRecords')
            ->has('recentRecords.rows')
        );
});

test('dashboard organization cards reflect active and inactive employee counts', function () {
    makeReportEmployee(['is_active' => true]);
    makeReportEmployee(['is_active' => true]);
    makeReportEmployee(['is_active' => false]);

    $this->actingAs($this->hrAdmin)
        ->get('/dashboard')
        ->assertInertia(fn ($page) => $page
            ->where('cards.0.value', '3')
            ->where('cards.0.detail', '2 active entries')
        );
});

test('dashboard organization open items card counts submitted leave requests this month', function () {
    $emp = makeReportEmployee();
    $leaveType = LeaveType::factory()->create();

    LeaveRequest::factory()->create([
        'employee_id' => $emp->id,
        'leave_type_id' => $leaveType->id,
        'status' => 'submitted',
        'start_date' => now()->startOfMonth(),
        'end_date' => now()->startOfMonth(),
        'days_requested' => 1,
        'created_at' => now(),
    ]);

    $this->actingAs($this->hrAdmin)
        ->get('/dashboard')
        ->assertInertia(fn ($page) => $page->where('cards.1.value', '1'));
});

test('dashboard recent records is capped at 5 movements', function () {
    $emp = makeReportEmployee();
    $movType = MovementType::factory()->create();

    for ($i = 0; $i < 6; $i++) {
        PersonnelMovement::factory()->create([
            'employee_id' => $emp->id,
            'movement_type_id' => $movType->id,
            'effective_date' => now()->subDays($i),
        ]);
    }

    $this->actingAs($this->hrAdmin)
        ->get('/dashboard')
        ->assertInertia(fn ($page) => $page->has('recentRecords.rows', 5));
});

// --- Reports Page Filter Options ---

test('reports page passes departments employees leaveTypes years and recent export props', function () {
    makeReportEmployee();
    $leaveType = LeaveType::factory()->create(['name' => 'Vacation Leave']);
    ReportExport::factory()->create([
        'user_id' => $this->hrAdmin->id,
        'report_name' => 'Personnel Masterlist',
        'export_format' => 'excel',
        'file_name' => 'personnel-masterlist.xlsx',
    ]);

    $this->actingAs($this->hrAdmin)
        ->get('/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('departments')
            ->has('employees')
            ->has('leaveTypes')
            ->has('years')
            ->has('recentExports', 1)
            ->where('departments.0.label', 'Finance')
            ->where('leaveTypes.0.label', $leaveType->name)
            ->where('years.0.value', (string) now()->year)
            ->where('recentExports.0.report_name', 'Personnel Masterlist')
            ->where('recentExports.0.export_format', 'XLSX')
        );
});

// --- Excel Exports ---

test('masterlist excel export returns xlsx', function () {
    makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get('/exports/masterlist/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('masterlist csv export returns csv', function () {
    makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get('/exports/masterlist/csv')
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('plantilla excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/plantilla/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('plantilla pdf export returns pdf', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/plantilla/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('leave ledger excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/leave-ledger/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('leave ledger pdf export returns pdf', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/leave-ledger/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('attendance summary excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/attendance/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('payroll support excel export returns xlsx', function () {
    $employee = makeReportEmployee([
        'gsis_number' => 'GSIS-001',
        'philhealth_number' => 'PHIC-001',
        'pagibig_number' => 'HDMF-001',
        'sss_number' => 'SSS-001',
    ]);
    $salaryGrade = SalaryGrade::factory()->create([
        'grade' => 11,
        'step' => 1,
    ]);
    EmployeeCompensation::factory()->create([
        'employee_id' => $employee->id,
        'salary_grade_id' => $salaryGrade->id,
    ]);

    $this->actingAs($this->hrAdmin)
        ->get('/exports/payroll-support/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('payroll support csv export returns csv', function () {
    $employee = makeReportEmployee();
    $salaryGrade = SalaryGrade::factory()->create([
        'grade' => 11,
        'step' => 2,
    ]);
    EmployeeCompensation::factory()->create([
        'employee_id' => $employee->id,
        'salary_grade_id' => $salaryGrade->id,
    ]);

    $this->actingAs($this->hrAdmin)
        ->get('/exports/payroll-support/csv')
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('payroll support pdf export returns pdf', function () {
    $employee = makeReportEmployee();
    $salaryGrade = SalaryGrade::factory()->create([
        'grade' => 12,
        'step' => 1,
    ]);
    EmployeeCompensation::factory()->create([
        'employee_id' => $employee->id,
        'salary_grade_id' => $salaryGrade->id,
    ]);

    $this->actingAs($this->hrAdmin)
        ->get('/exports/payroll-support/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('attendance summary csv export returns csv', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/attendance/csv')
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('attendance summary pdf export returns pdf', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/attendance/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('personnel movements excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/movements/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('personnel movements csv export returns csv', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/movements/csv')
        ->assertOk()
        ->assertHeader('content-type', 'text/csv; charset=UTF-8');
});

test('personnel movements pdf export returns pdf', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/movements/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('masterlist export respects department filter', function () {
    $dept2 = Department::factory()->create(['name' => 'Admin', 'is_active' => true]);
    $pos2 = Position::factory()->create(['department_id' => $dept2->id]);
    makeReportEmployee(['department_id' => $dept2->id, 'position_id' => $pos2->id]);

    $this->actingAs($this->hrAdmin)
        ->get('/exports/masterlist/excel?department_id='.$dept2->id)
        ->assertOk();
});

test('department head with export permission cannot export another departments records', function () {
    $managedDepartment = Department::factory()->create(['name' => 'HR', 'is_active' => true]);
    $otherDepartment = Department::factory()->create(['name' => 'Engineering', 'is_active' => true]);

    $departmentHead = User::factory()->create([
        'managed_department_id' => $managedDepartment->id,
    ]);
    $departmentHead->assignRole('Department Head');
    $departmentHead->givePermissionTo('reports.export');

    $this->actingAs($departmentHead)
        ->get('/exports/masterlist/excel?department_id='.$otherDepartment->id)
        ->assertForbidden();
});

test('department head with export permission can export service record within managed department', function () {
    $department = Department::factory()->create(['name' => 'HR', 'is_active' => true]);
    $position = Position::factory()->create(['department_id' => $department->id, 'is_active' => true]);

    $departmentHead = User::factory()->create([
        'managed_department_id' => $department->id,
    ]);
    $departmentHead->assignRole('Department Head');
    $departmentHead->givePermissionTo('reports.export');

    $employee = makeReportEmployee([
        'department_id' => $department->id,
        'position_id' => $position->id,
    ]);

    $this->actingAs($departmentHead)
        ->get("/exports/service-record/{$employee->id}/pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('department head with export permission cannot export service record outside managed department', function () {
    $managedDepartment = Department::factory()->create(['name' => 'HR', 'is_active' => true]);
    $otherDepartment = Department::factory()->create(['name' => 'Engineering', 'is_active' => true]);
    $otherPosition = Position::factory()->create(['department_id' => $otherDepartment->id, 'is_active' => true]);

    $departmentHead = User::factory()->create([
        'managed_department_id' => $managedDepartment->id,
    ]);
    $departmentHead->assignRole('Department Head');
    $departmentHead->givePermissionTo('reports.export');

    $employee = makeReportEmployee([
        'department_id' => $otherDepartment->id,
        'position_id' => $otherPosition->id,
    ]);

    $this->actingAs($departmentHead)
        ->get("/exports/service-record/{$employee->id}/pdf")
        ->assertForbidden();
});

test('export routes block employee role', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');

    $this->actingAs($user)->get('/exports/masterlist/excel')->assertForbidden();
    $this->actingAs($user)->get('/exports/masterlist/pdf')->assertForbidden();
});

// --- PDF Exports ---

test('masterlist pdf export returns pdf', function () {
    makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get('/exports/masterlist/pdf')
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('service record pdf export returns pdf for valid employee', function () {
    $emp = makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get("/exports/service-record/{$emp->id}/pdf")
        ->assertOk()
        ->assertHeader('content-type', 'application/pdf');
});

test('service record pdf returns 404 for invalid employee', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/service-record/999999/pdf')
        ->assertNotFound();
});

test('masterlist excel export records report export history', function () {
    makeReportEmployee();

    $this->actingAs($this->hrAdmin)
        ->get('/exports/masterlist/excel?status=active')
        ->assertOk();

    $this->assertDatabaseHas('report_exports', [
        'user_id' => $this->hrAdmin->id,
        'report_key' => 'personnel_masterlist',
        'report_name' => 'Personnel Masterlist',
        'export_format' => 'excel',
        'file_name' => 'personnel-masterlist.xlsx',
    ]);
});

test('service record pdf export records employee scoped export history', function () {
    $employee = makeReportEmployee();

    $this->actingAs($this->hrAdmin)
        ->get("/exports/service-record/{$employee->id}/pdf")
        ->assertOk();

    $this->assertDatabaseHas('report_exports', [
        'user_id' => $this->hrAdmin->id,
        'report_key' => 'service_record',
        'report_name' => 'Service Record',
        'export_format' => 'pdf',
        'employee_id' => $employee->id,
    ]);
});
