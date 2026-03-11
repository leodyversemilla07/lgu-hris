<?php

namespace Database\Seeders;

use App\Models\AttendanceLog;
use App\Models\AttendanceSummary;
use App\Models\AuditLog;
use App\Models\Department;
use App\Models\DocumentType;
use App\Models\Employee;
use App\Models\EmployeeCompensation;
use App\Models\EmployeeDocument;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\LeaveBalance;
use App\Models\LeaveRequest;
use App\Models\LeaveType;
use App\Models\MovementType;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\SalaryGrade;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Collection;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        if (Employee::query()->exists()) {
            return;
        }

        $departments = Department::query()->orderBy('id')->get();
        $positionsByDepartment = Position::query()
            ->where('is_active', true)
            ->get()
            ->groupBy('department_id');
        $seedableDepartments = $departments
            ->filter(fn (Department $department) => $positionsByDepartment->has($department->id))
            ->values();
        $employmentTypes = EmploymentType::query()->where('is_active', true)->get()->keyBy('code');
        $employmentStatuses = EmploymentStatus::query()->where('is_active', true)->get()->keyBy('code');
        $documentTypes = DocumentType::query()->where('is_active', true)->get();
        $leaveTypes = LeaveType::query()->where('is_active', true)->get();
        $movementTypes = MovementType::query()->where('is_active', true)->get();
        $salaryGrades = SalaryGrade::query()->where('step', 1)->get()->keyBy('grade');

        $adminUser = User::query()->where('email', 'hr.admin@example.com')->firstOrFail();
        $adminUser->syncRoles(['HR Admin']);

        $hrDepartment = $departments->firstWhere('code', 'HRMO') ?? $departments->firstOrFail();

        $hrStaffUser = User::query()->firstOrCreate(
            ['email' => 'hr.staff@example.com'],
            ['name' => 'HR Staff Seeder', 'password' => 'password'],
        );
        $hrStaffUser->syncRoles(['HR Staff']);

        $departmentHeadUser = User::query()->firstOrCreate(
            ['email' => 'department.head@example.com'],
            [
                'name' => 'Department Head Seeder',
                'password' => 'password',
                'managed_department_id' => $hrDepartment->id,
            ],
        );
        $departmentHeadUser->managed_department_id = $hrDepartment->id;
        $departmentHeadUser->save();
        $departmentHeadUser->syncRoles(['Department Head']);

        $employeeUsers = User::factory()->count(6)->create();
        $employeeUsers->each(fn (User $user) => $user->syncRoles(['Employee']));

        $employees = collect();

        $employees->push(
            $this->makeEmployee(
                user: $hrStaffUser,
                department: $hrDepartment,
                positionsByDepartment: $positionsByDepartment,
                employmentType: $employmentTypes->get('PERM'),
                employmentStatus: $employmentStatuses->get('ACTIVE'),
                attributes: [
                    'first_name' => 'Helena',
                    'last_name' => 'Cruz',
                    'email' => 'helena.cruz@example.com',
                    'sex' => 'female',
                    'civil_status' => 'married',
                ],
            ),
        );

        $employees->push(
            $this->makeEmployee(
                user: $departmentHeadUser,
                department: $hrDepartment,
                positionsByDepartment: $positionsByDepartment,
                employmentType: $employmentTypes->get('PERM'),
                employmentStatus: $employmentStatuses->get('ACTIVE'),
                attributes: [
                    'first_name' => 'Mario',
                    'last_name' => 'Ramos',
                    'email' => 'mario.ramos@example.com',
                    'sex' => 'male',
                    'civil_status' => 'married',
                ],
            ),
        );

        foreach ($employeeUsers as $index => $employeeUser) {
            $department = $seedableDepartments[$index % $seedableDepartments->count()];
            $employmentStatus = $index === 0
                ? $employmentStatuses->get('LEAVE')
                : $employmentStatuses->get('ACTIVE');

            $employees->push(
                $this->makeEmployee(
                    user: $employeeUser,
                    department: $department,
                    positionsByDepartment: $positionsByDepartment,
                    employmentType: $employmentTypes->get($index % 2 === 0 ? 'PERM' : 'CAS'),
                    employmentStatus: $employmentStatus,
                    attributes: [
                        'sex' => $index % 2 === 0 ? 'male' : 'female',
                        'civil_status' => $index % 3 === 0 ? 'married' : 'single',
                    ],
                ),
            );
        }

        for ($index = 0; $index < 6; $index++) {
            $department = $seedableDepartments[$index % $seedableDepartments->count()];
            $employees->push(
                $this->makeEmployee(
                    user: null,
                    department: $department,
                    positionsByDepartment: $positionsByDepartment,
                    employmentType: $employmentTypes->get($index % 2 === 0 ? 'COS' : 'JO'),
                    employmentStatus: $employmentStatuses->get($index === 5 ? 'SEP' : 'ACTIVE'),
                    attributes: [
                        'is_active' => $index !== 5,
                        'archived_at' => $index === 5 ? now()->subMonths(2) : null,
                    ],
                ),
            );
        }

        $this->seedDocuments($employees, $documentTypes, $adminUser, $hrStaffUser);
        $this->seedCompensation($employees, $salaryGrades, $adminUser, $hrStaffUser);
        $this->seedLeaveData($employees, $leaveTypes, $adminUser, $hrStaffUser, $departmentHeadUser);
        $this->seedMovementData(
            $employees,
            $movementTypes,
            $seedableDepartments,
            $positionsByDepartment,
            $employmentStatuses,
            $adminUser,
            $hrStaffUser,
        );
        $this->seedAttendanceData($employees, $adminUser, $hrStaffUser);
        $this->seedAuditLogs($employees, $adminUser);
    }

    private function makeEmployee(
        ?User $user,
        Department $department,
        Collection $positionsByDepartment,
        ?EmploymentType $employmentType,
        ?EmploymentStatus $employmentStatus,
        array $attributes = [],
    ): Employee {
        $position = $positionsByDepartment->get($department->id)?->random();

        return Employee::factory()->create(array_merge([
            'user_id' => $user?->id,
            'department_id' => $department->id,
            'position_id' => $position?->id,
            'employment_type_id' => $employmentType?->id,
            'employment_status_id' => $employmentStatus?->id,
        ], $attributes));
    }

    private function seedDocuments(
        Collection $employees,
        Collection $documentTypes,
        User $adminUser,
        User $hrStaffUser,
    ): void {
        $employees->take(10)->each(function (Employee $employee, int $index) use ($documentTypes, $adminUser, $hrStaffUser): void {
            $documentTypes->shuffle()->take(2)->each(function (DocumentType $documentType) use ($employee, $index, $adminUser, $hrStaffUser): void {
                EmployeeDocument::factory()->create([
                    'employee_id' => $employee->id,
                    'document_type_id' => $documentType->id,
                    'uploaded_by' => $index % 2 === 0 ? $adminUser->id : $hrStaffUser->id,
                    'is_confidential' => $documentType->is_confidential,
                ]);
            });
        });
    }

    private function seedCompensation(
        Collection $employees,
        Collection $salaryGrades,
        User $adminUser,
        User $hrStaffUser,
    ): void {
        $employees->each(function (Employee $employee, int $index) use ($salaryGrades, $adminUser, $hrStaffUser): void {
            $grade = (int) preg_replace('/\D+/', '', (string) $employee->position?->salary_grade) ?: fake()->numberBetween(1, 15);
            $salaryGrade = $salaryGrades->get($grade) ?? $salaryGrades->first();

            EmployeeCompensation::factory()->create([
                'employee_id' => $employee->id,
                'salary_grade_id' => $salaryGrade?->id,
                'recorded_by' => $index % 2 === 0 ? $adminUser->id : $hrStaffUser->id,
                'allowances' => fake()->randomFloat(2, 500, 3500),
                'deductions' => fake()->randomFloat(2, 100, 1200),
            ]);
        });
    }

    private function seedLeaveData(
        Collection $employees,
        Collection $leaveTypes,
        User $adminUser,
        User $hrStaffUser,
        User $departmentHeadUser,
    ): void {
        $trackedTypes = $leaveTypes
            ->filter(fn (LeaveType $leaveType) => in_array($leaveType->code, ['VL', 'SL', 'SPL'], true))
            ->values();
        $year = now()->year;

        foreach ($employees as $employee) {
            foreach ($trackedTypes as $leaveType) {
                LeaveBalance::query()->updateOrCreate(
                    [
                        'employee_id' => $employee->id,
                        'leave_type_id' => $leaveType->id,
                        'year' => $year,
                    ],
                    [
                        'total_days' => $leaveType->max_days_per_year ?? 15,
                        'used_days' => 0,
                    ],
                );
            }
        }

        $approvers = collect([$adminUser, $hrStaffUser, $departmentHeadUser]);
        $approvedUsage = [];
        $statuses = ['submitted', 'approved', 'rejected', 'cancelled'];

        $employees->take(10)->values()->each(function (Employee $employee, int $index) use ($trackedTypes, $statuses, $approvers, &$approvedUsage): void {
            $leaveType = $trackedTypes[$index % $trackedTypes->count()];
            $status = $statuses[$index % count($statuses)];
            $daysRequested = [1, 2, 3, 5][$index % 4];
            $startDate = now()->subDays(($index + 1) * 6)->startOfDay();

            $leaveRequest = LeaveRequest::factory()->create([
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'start_date' => $startDate->toDateString(),
                'end_date' => $startDate->copy()->addDays($daysRequested - 1)->toDateString(),
                'days_requested' => $daysRequested,
                'status' => $status,
                'reason' => fake()->sentence(),
                'actioned_by' => in_array($status, ['approved', 'rejected', 'cancelled'], true)
                    ? $approvers[$index % $approvers->count()]->id
                    : null,
                'actioned_at' => in_array($status, ['approved', 'rejected', 'cancelled'], true)
                    ? now()->subDays($index)
                    : null,
                'remarks' => $status === 'rejected'
                    ? 'Seeded rejection remark.'
                    : ($status === 'approved' ? 'Seeded approval.' : null),
            ]);

            if ($leaveRequest->status === 'approved') {
                $usageKey = $employee->id.'_'.$leaveType->id;
                $approvedUsage[$usageKey] = ($approvedUsage[$usageKey] ?? 0) + $daysRequested;
            }
        });

        foreach ($approvedUsage as $usageKey => $usedDays) {
            [$employeeId, $leaveTypeId] = explode('_', $usageKey);

            LeaveBalance::query()
                ->where('employee_id', $employeeId)
                ->where('leave_type_id', $leaveTypeId)
                ->where('year', $year)
                ->update(['used_days' => $usedDays]);
        }
    }

    private function seedMovementData(
        Collection $employees,
        Collection $movementTypes,
        Collection $departments,
        Collection $positionsByDepartment,
        Collection $employmentStatuses,
        User $adminUser,
        User $hrStaffUser,
    ): void {
        $employees->take(8)->values()->each(function (Employee $employee, int $index) use (
            $movementTypes,
            $departments,
            $positionsByDepartment,
            $employmentStatuses,
            $adminUser,
            $hrStaffUser,
        ): void {
            $fromDepartmentId = $employee->department_id;
            $toDepartment = $departments->reject(
                fn (Department $department) => $department->id === $fromDepartmentId,
            )->values()->get($index % max($departments->count() - 1, 1));
            $toPosition = $toDepartment
                ? $positionsByDepartment->get($toDepartment->id)?->first()
                : null;

            PersonnelMovement::factory()->create([
                'employee_id' => $employee->id,
                'movement_type_id' => $movementTypes->values()[$index % $movementTypes->count()]->id,
                'effective_date' => now()->subMonths($index + 1)->toDateString(),
                'from_department_id' => $employee->department_id,
                'to_department_id' => $toDepartment?->id,
                'from_position_id' => $employee->position_id,
                'to_position_id' => $toPosition?->id,
                'from_employment_status_id' => $employee->employment_status_id,
                'to_employment_status_id' => $employmentStatuses->values()[$index % $employmentStatuses->count()]->id,
                'recorded_by' => $index % 2 === 0 ? $adminUser->id : $hrStaffUser->id,
            ]);
        });
    }

    private function seedAttendanceData(
        Collection $employees,
        User $adminUser,
        User $hrStaffUser,
    ): void {
        $startOfWeek = CarbonImmutable::now()->subWeek()->startOfWeek();
        $summaryYear = now()->year;
        $summaryMonth = now()->month;

        $employees->take(6)->values()->each(function (Employee $employee, int $index) use (
            $startOfWeek,
            $adminUser,
            $hrStaffUser,
            $summaryYear,
            $summaryMonth,
        ): void {
            foreach (range(0, 4) as $dayOffset) {
                $logDate = $startOfWeek->addDays($dayOffset);
                $status = $dayOffset === 2 && $index % 3 === 0 ? 'leave' : 'present';

                AttendanceLog::factory()->create([
                    'employee_id' => $employee->id,
                    'log_date' => $logDate->toDateString(),
                    'status' => $status,
                    'time_in' => $status === 'present' ? '08:00:00' : null,
                    'time_out' => $status === 'present' ? '17:00:00' : null,
                    'minutes_late' => $status === 'present' ? $index * 2 : 0,
                    'minutes_undertime' => $status === 'present' ? $index : 0,
                    'recorded_by' => $dayOffset % 2 === 0 ? $adminUser->id : $hrStaffUser->id,
                ]);
            }

            AttendanceSummary::query()->updateOrCreate(
                [
                    'employee_id' => $employee->id,
                    'year' => $summaryYear,
                    'month' => $summaryMonth,
                ],
                [
                    'days_present' => 20 - $index,
                    'days_absent' => $index % 2,
                    'days_leave' => $index % 3,
                    'days_holiday' => 1,
                    'days_rest_day' => 8,
                    'total_late_minutes' => $index * 12,
                    'total_undertime_minutes' => $index * 5,
                ],
            );
        });
    }

    private function seedAuditLogs(Collection $employees, User $adminUser): void
    {
        $employee = $employees->first();
        $leaveRequest = LeaveRequest::query()->first();
        $movement = PersonnelMovement::query()->first();
        $document = EmployeeDocument::query()->first();
        $compensation = EmployeeCompensation::query()->first();
        $attendanceLog = AttendanceLog::query()->first();

        $logs = [
            [
                'event' => 'created',
                'auditable_type' => Employee::class,
                'auditable_id' => $employee?->id,
                'description' => 'Seeded employee profile created.',
                'new_values' => ['employee_number' => $employee?->employee_number],
            ],
            [
                'event' => 'document_uploaded',
                'auditable_type' => EmployeeDocument::class,
                'auditable_id' => $document?->id,
                'description' => 'Seeded employee document uploaded.',
                'new_values' => ['file_name' => $document?->file_name],
            ],
            [
                'event' => 'leave_filed',
                'auditable_type' => LeaveRequest::class,
                'auditable_id' => $leaveRequest?->id,
                'description' => 'Seeded leave request filed.',
                'new_values' => ['status' => $leaveRequest?->status],
            ],
            [
                'event' => 'movement_recorded',
                'auditable_type' => PersonnelMovement::class,
                'auditable_id' => $movement?->id,
                'description' => 'Seeded personnel movement recorded.',
                'new_values' => ['movement_type_id' => $movement?->movement_type_id],
            ],
            [
                'event' => 'compensation_updated',
                'auditable_type' => EmployeeCompensation::class,
                'auditable_id' => $compensation?->id,
                'description' => 'Seeded compensation record saved.',
                'new_values' => ['salary_grade_id' => $compensation?->salary_grade_id],
            ],
            [
                'event' => 'attendance_logged',
                'auditable_type' => AttendanceLog::class,
                'auditable_id' => $attendanceLog?->id,
                'description' => 'Seeded attendance log created.',
                'new_values' => ['status' => $attendanceLog?->status],
            ],
        ];

        foreach ($logs as $log) {
            if (! $log['auditable_id']) {
                continue;
            }

            AuditLog::query()->create([
                'user_id' => $adminUser->id,
                'event' => $log['event'],
                'auditable_type' => $log['auditable_type'],
                'auditable_id' => $log['auditable_id'],
                'description' => $log['description'],
                'new_values' => $log['new_values'],
                'ip_address' => '127.0.0.1',
            ]);
        }
    }
}
