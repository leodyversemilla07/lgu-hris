<?php

use App\Models\Department;
use App\Models\Employee;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
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

test('employee role is blocked from reports', function () {
    $user = User::factory()->create();
    $user->assignRole('Employee');
    $this->actingAs($user)->get('/reports')->assertForbidden();
});

// --- Dashboard KPIs ---

test('dashboard returns kpis with correct structure', function () {
    makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('kpis')
            ->has('kpis.totalActive')
            ->has('kpis.totalInactive')
            ->has('kpis.pendingLeave')
            ->has('kpis.approvedLeaveThisMonth')
            ->has('kpis.totalLeaveDaysThisMonth')
            ->has('kpis.byStatus')
            ->has('kpis.byDepartment')
            ->has('recentMovements')
        );
});

test('dashboard kpi totalActive counts only active employees', function () {
    makeReportEmployee(['is_active' => true]);
    makeReportEmployee(['is_active' => true]);
    makeReportEmployee(['is_active' => false]);

    $this->actingAs($this->hrAdmin)
        ->get('/dashboard')
        ->assertInertia(fn ($page) => $page
            ->where('kpis.totalActive', 2)
            ->where('kpis.totalInactive', 1)
        );
});

test('dashboard kpi pendingLeave counts submitted leave requests this month', function () {
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
        ->assertInertia(fn ($page) => $page->where('kpis.pendingLeave', 1));
});

test('dashboard recentMovements is capped at 5', function () {
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
        ->assertInertia(fn ($page) => $page->has('recentMovements', 5));
});

// --- Reports Page Filter Options ---

test('reports page passes departments employees leaveTypes and years props', function () {
    makeReportEmployee();
    $this->actingAs($this->hrAdmin)
        ->get('/reports')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('reports/index')
            ->has('departments')
            ->has('employees')
            ->has('leaveTypes')
            ->has('years')
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

test('leave ledger excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/leave-ledger/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('attendance summary excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/attendance/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('personnel movements excel export returns xlsx', function () {
    $this->actingAs($this->hrAdmin)
        ->get('/exports/movements/excel')
        ->assertOk()
        ->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
});

test('masterlist export respects department filter', function () {
    $dept2 = Department::factory()->create(['name' => 'Admin', 'is_active' => true]);
    $pos2 = Position::factory()->create(['department_id' => $dept2->id]);
    makeReportEmployee(['department_id' => $dept2->id, 'position_id' => $pos2->id]);

    $this->actingAs($this->hrAdmin)
        ->get('/exports/masterlist/excel?department_id='.$dept2->id)
        ->assertOk();
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
