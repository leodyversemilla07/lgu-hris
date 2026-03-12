<?php

namespace App\Http\Controllers;

use App\Exports\AttendanceSummaryExport;
use App\Exports\LeaveLedgerExport;
use App\Exports\PayrollSupportExport;
use App\Exports\PersonnelMasterlistExport;
use App\Exports\PersonnelMovementExport;
use App\Exports\PlantillaExport;
use App\Models\AttendanceSummary;
use App\Models\Department;
use App\Models\Employee;
use App\Models\LeaveRequest;
use App\Models\PersonnelMovement;
use App\Models\Position;
use App\Models\User;
use App\Services\ReportExportService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    public function masterlistExcel(Request $request): BinaryFileResponse
    {
        $departmentId = $this->scopedDepartmentId($request);

        $fileName = 'personnel-masterlist.xlsx';
        $response = Excel::download(
            new PersonnelMasterlistExport(
                departmentId: $departmentId,
                statusFilter: $request->input('status'),
            ),
            $fileName,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'personnel_masterlist',
            reportName: 'Personnel Masterlist',
            format: 'excel',
            fileName: $fileName,
            departmentId: $departmentId,
            filters: ['status' => $request->input('status')],
        );

        return $response;
    }

    public function masterlistCsv(Request $request): BinaryFileResponse
    {
        $departmentId = $this->scopedDepartmentId($request);

        $fileName = 'personnel-masterlist.csv';
        $response = Excel::download(
            new PersonnelMasterlistExport(
                departmentId: $departmentId,
                statusFilter: $request->input('status'),
            ),
            $fileName,
            \Maatwebsite\Excel\Excel::CSV,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'personnel_masterlist',
            reportName: 'Personnel Masterlist',
            format: 'csv',
            fileName: $fileName,
            departmentId: $departmentId,
            filters: ['status' => $request->input('status')],
        );

        return $response;
    }

    public function masterlistPdf(Request $request): Response
    {
        $departmentId = $this->scopedDepartmentId($request);
        $statusFilter = $request->input('status');

        $query = Employee::query()
            ->with(['department', 'position', 'employmentType', 'employmentStatus'])
            ->when($departmentId, fn ($builder) => $builder->where('department_id', $departmentId))
            ->when($statusFilter === 'active', fn ($builder) => $builder->where('is_active', true))
            ->when($statusFilter === 'inactive', fn ($builder) => $builder->where('is_active', false))
            ->orderBy('last_name')
            ->orderBy('first_name');

        $department = $departmentId ? Department::find($departmentId) : null;

        $pdf = Pdf::loadView('pdf.personnel-masterlist', [
            'employees' => $query->get(),
            'department' => $department,
            'statusFilter' => $statusFilter,
        ])->setPaper('legal', 'landscape');

        $fileName = 'personnel-masterlist.pdf';

        $this->recordReportExport(
            $request,
            reportKey: 'personnel_masterlist',
            reportName: 'Personnel Masterlist',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $departmentId,
            filters: ['status' => $statusFilter],
        );

        return $pdf->download($fileName);
    }

    public function plantillaExcel(Request $request): BinaryFileResponse
    {
        $departmentId = $this->scopedDepartmentId($request);
        $fileName = 'plantilla-of-personnel.xlsx';
        $response = Excel::download(
            new PlantillaExport(departmentId: $departmentId),
            $fileName,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'plantilla_of_personnel',
            reportName: 'Plantilla of Personnel',
            format: 'excel',
            fileName: $fileName,
            departmentId: $departmentId,
        );

        return $response;
    }

    public function plantillaCsv(Request $request): BinaryFileResponse
    {
        $departmentId = $this->scopedDepartmentId($request);
        $fileName = 'plantilla-of-personnel.csv';
        $response = Excel::download(
            new PlantillaExport(departmentId: $departmentId),
            $fileName,
            \Maatwebsite\Excel\Excel::CSV,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'plantilla_of_personnel',
            reportName: 'Plantilla of Personnel',
            format: 'csv',
            fileName: $fileName,
            departmentId: $departmentId,
        );

        return $response;
    }

    public function plantillaPdf(Request $request): Response
    {
        $departmentId = $this->scopedDepartmentId($request);

        $positions = Position::query()
            ->with([
                'department',
                'employees' => fn ($query) => $query
                    ->where('is_active', true)
                    ->with('employmentStatus')
                    ->orderBy('last_name'),
            ])
            ->when($departmentId, fn ($query) => $query->where('department_id', $departmentId))
            ->where('is_active', true)
            ->orderBy('salary_grade')
            ->orderBy('name')
            ->get();

        $department = $departmentId ? Department::find($departmentId) : null;

        $pdf = Pdf::loadView('pdf.plantilla-of-personnel', [
            'positions' => $positions,
            'department' => $department,
        ])->setPaper('legal', 'landscape');

        $fileName = 'plantilla-of-personnel.pdf';

        $this->recordReportExport(
            $request,
            reportKey: 'plantilla_of_personnel',
            reportName: 'Plantilla of Personnel',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $departmentId,
        );

        return $pdf->download($fileName);
    }

    public function leaveLedgerExcel(Request $request): BinaryFileResponse
    {
        $year = $request->integer('year') ?: null;
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $fileName = 'leave-ledger.xlsx';
        $response = Excel::download(
            new LeaveLedgerExport(
                year: $year,
                departmentId: $departmentId,
                employeeId: $employeeId,
            ),
            $fileName,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'leave_ledger',
            reportName: 'Leave Ledger',
            format: 'excel',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
            filters: ['year' => $year],
        );

        return $response;
    }

    public function leaveLedgerCsv(Request $request): BinaryFileResponse
    {
        $year = $request->integer('year') ?: null;
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $fileName = 'leave-ledger.csv';
        $response = Excel::download(
            new LeaveLedgerExport(
                year: $year,
                departmentId: $departmentId,
                employeeId: $employeeId,
            ),
            $fileName,
            \Maatwebsite\Excel\Excel::CSV,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'leave_ledger',
            reportName: 'Leave Ledger',
            format: 'csv',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
            filters: ['year' => $year],
        );

        return $response;
    }

    public function leaveLedgerPdf(Request $request): Response
    {
        $year = $request->integer('year') ?: now()->year;
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);

        $leaveRequests = LeaveRequest::query()
            ->with(['employee.department', 'employee.position', 'leaveType'])
            ->whereYear('start_date', $year)
            ->when($departmentId, fn (Builder $query) => $query->whereHas('employee', fn (Builder $employeeQuery) => $employeeQuery->where('department_id', $departmentId)))
            ->when($employeeId, fn (Builder $query) => $query->where('employee_id', $employeeId))
            ->orderBy('start_date')
            ->get();

        $department = $departmentId ? Department::find($departmentId) : null;
        $employee = $employeeId ? Employee::find($employeeId) : null;

        $pdf = Pdf::loadView('pdf.leave-ledger', [
            'leaveRequests' => $leaveRequests,
            'department' => $department,
            'employee' => $employee,
            'year' => $year,
        ])->setPaper('legal', 'landscape');

        $fileName = 'leave-ledger.pdf';

        $this->recordReportExport(
            $request,
            reportKey: 'leave_ledger',
            reportName: 'Leave Ledger',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
            filters: ['year' => $year],
        );

        return $pdf->download($fileName);
    }

    public function attendanceSummaryExcel(Request $request): BinaryFileResponse
    {
        $year = $request->integer('year') ?: null;
        $month = $request->integer('month') ?: null;
        $departmentId = $this->scopedDepartmentId($request);
        $fileName = 'attendance-summary.xlsx';
        $response = Excel::download(
            new AttendanceSummaryExport(
                year: $year,
                month: $month,
                departmentId: $departmentId,
            ),
            $fileName,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'attendance_summary',
            reportName: 'Attendance Summary',
            format: 'excel',
            fileName: $fileName,
            departmentId: $departmentId,
            filters: ['year' => $year, 'month' => $month],
        );

        return $response;
    }

    public function attendanceSummaryCsv(Request $request): BinaryFileResponse
    {
        $year = $request->integer('year') ?: null;
        $month = $request->integer('month') ?: null;
        $departmentId = $this->scopedDepartmentId($request);
        $fileName = 'attendance-summary.csv';
        $response = Excel::download(
            new AttendanceSummaryExport(
                year: $year,
                month: $month,
                departmentId: $departmentId,
            ),
            $fileName,
            \Maatwebsite\Excel\Excel::CSV,
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );

        $this->recordReportExport(
            $request,
            reportKey: 'attendance_summary',
            reportName: 'Attendance Summary',
            format: 'csv',
            fileName: $fileName,
            departmentId: $departmentId,
            filters: ['year' => $year, 'month' => $month],
        );

        return $response;
    }

    public function attendanceSummaryPdf(Request $request): Response
    {
        $year = $request->integer('year') ?: now()->year;
        $month = $request->integer('month') ?: null;
        $departmentId = $this->scopedDepartmentId($request);

        $summaries = AttendanceSummary::query()
            ->with(['employee.department', 'employee.position'])
            ->where('year', $year)
            ->when($month, fn ($query) => $query->where('month', $month))
            ->when($departmentId, fn ($query) => $query->whereHas('employee', fn ($employeeQuery) => $employeeQuery->where('department_id', $departmentId)))
            ->orderBy('year')
            ->orderBy('month')
            ->orderBy(
                Employee::select('last_name')
                    ->whereColumn('employees.id', 'attendance_summaries.employee_id')
                    ->limit(1)
            )
            ->get();

        $department = $departmentId ? Department::find($departmentId) : null;

        $pdf = Pdf::loadView('pdf.attendance-summary', [
            'summaries' => $summaries,
            'department' => $department,
            'year' => $year,
            'month' => $month,
        ])->setPaper('legal', 'landscape');

        $fileName = 'attendance-summary.pdf';

        $this->recordReportExport(
            $request,
            reportKey: 'attendance_summary',
            reportName: 'Attendance Summary',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $departmentId,
            filters: ['year' => $year, 'month' => $month],
        );

        return $pdf->download($fileName);
    }

    public function personnelMovementsExcel(Request $request): BinaryFileResponse
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $fileName = 'personnel-movements.xlsx';
        $response = Excel::download(
            new PersonnelMovementExport(
                dateFrom: $dateFrom,
                dateTo: $dateTo,
                departmentId: $departmentId,
                employeeId: $employeeId,
            ),
            $fileName,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'personnel_movements',
            reportName: 'Personnel Movements',
            format: 'excel',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
            filters: ['date_from' => $dateFrom, 'date_to' => $dateTo],
        );

        return $response;
    }

    public function personnelMovementsCsv(Request $request): BinaryFileResponse
    {
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $fileName = 'personnel-movements.csv';
        $response = Excel::download(
            new PersonnelMovementExport(
                dateFrom: $dateFrom,
                dateTo: $dateTo,
                departmentId: $departmentId,
                employeeId: $employeeId,
            ),
            $fileName,
            \Maatwebsite\Excel\Excel::CSV,
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );

        $this->recordReportExport(
            $request,
            reportKey: 'personnel_movements',
            reportName: 'Personnel Movements',
            format: 'csv',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
            filters: ['date_from' => $dateFrom, 'date_to' => $dateTo],
        );

        return $response;
    }

    public function personnelMovementsPdf(Request $request): Response
    {
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $dateFrom = $request->input('date_from');
        $dateTo = $request->input('date_to');

        $movements = $this->personnelMovementQuery(
            dateFrom: $dateFrom,
            dateTo: $dateTo,
            departmentId: $departmentId,
            employeeId: $employeeId,
        )->get();

        $department = $departmentId ? Department::find($departmentId) : null;
        $employee = $employeeId ? Employee::find($employeeId) : null;

        $pdf = Pdf::loadView('pdf.personnel-movements', [
            'movements' => $movements,
            'department' => $department,
            'employee' => $employee,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
        ])->setPaper('legal', 'landscape');

        $fileName = 'personnel-movements.pdf';

        $this->recordReportExport(
            $request,
            reportKey: 'personnel_movements',
            reportName: 'Personnel Movements',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
            filters: ['date_from' => $dateFrom, 'date_to' => $dateTo],
        );

        return $pdf->download($fileName);
    }

    public function payrollSupportExcel(Request $request): BinaryFileResponse
    {
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $fileName = 'payroll-support-register.xlsx';
        $response = Excel::download(
            new PayrollSupportExport(
                departmentId: $departmentId,
                employeeId: $employeeId,
            ),
            $fileName,
        );

        $this->recordReportExport(
            $request,
            reportKey: 'payroll_support_register',
            reportName: 'Payroll Support Register',
            format: 'excel',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
        );

        return $response;
    }

    public function payrollSupportCsv(Request $request): BinaryFileResponse
    {
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);
        $fileName = 'payroll-support-register.csv';
        $response = Excel::download(
            new PayrollSupportExport(
                departmentId: $departmentId,
                employeeId: $employeeId,
            ),
            $fileName,
            \Maatwebsite\Excel\Excel::CSV,
            ['Content-Type' => 'text/csv; charset=UTF-8'],
        );

        $this->recordReportExport(
            $request,
            reportKey: 'payroll_support_register',
            reportName: 'Payroll Support Register',
            format: 'csv',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
        );

        return $response;
    }

    public function payrollSupportPdf(Request $request): Response
    {
        $departmentId = $this->scopedDepartmentId($request);
        $employeeId = $this->scopedEmployeeId($request);

        $employees = $this->payrollSupportQuery(
            departmentId: $departmentId,
            employeeId: $employeeId,
        )->get();

        $department = $departmentId ? Department::find($departmentId) : null;
        $employee = $employeeId ? Employee::find($employeeId) : null;

        $pdf = Pdf::loadView('pdf.payroll-support-register', [
            'employees' => $employees,
            'department' => $department,
            'employee' => $employee,
        ])->setPaper('legal', 'landscape');

        $fileName = 'payroll-support-register.pdf';

        $this->recordReportExport(
            $request,
            reportKey: 'payroll_support_register',
            reportName: 'Payroll Support Register',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $departmentId,
            employeeId: $employeeId,
        );

        return $pdf->download($fileName);
    }

    public function serviceRecordPdf(Request $request, Employee $employee): Response
    {
        $this->authorize('view', $employee);
        $this->assertEmployeeExportScope($request->user(), $employee);

        $employee->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
            'movements.movementType',
            'movements.fromDepartment',
            'movements.toDepartment',
            'movements.fromPosition',
            'movements.toPosition',
            'compensations.salaryGrade',
        ]);

        $pdf = Pdf::loadView('pdf.service-record', ['employee' => $employee])
            ->setPaper('letter', 'portrait');

        $fileName = "service-record-{$employee->employee_number}.pdf";

        $this->recordReportExport(
            $request,
            reportKey: 'service_record',
            reportName: 'Service Record',
            format: 'pdf',
            fileName: $fileName,
            departmentId: $employee->department_id,
            employeeId: $employee->id,
        );

        return $pdf->download($fileName);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    private function recordReportExport(
        Request $request,
        string $reportKey,
        string $reportName,
        string $format,
        string $fileName,
        ?int $departmentId = null,
        ?int $employeeId = null,
        array $filters = [],
    ): void {
        ReportExportService::record(
            $request->user(),
            reportKey: $reportKey,
            reportName: $reportName,
            format: $format,
            fileName: $fileName,
            filters: $filters,
            departmentId: $departmentId,
            employeeId: $employeeId,
        );
    }

    private function payrollSupportQuery(
        ?int $departmentId,
        ?int $employeeId,
    ): Builder {
        return Employee::query()
            ->with([
                'department',
                'position',
                'employmentStatus',
                'compensations' => fn ($query) => $query
                    ->with('salaryGrade')
                    ->orderByDesc('effective_date')
                    ->limit(1),
            ])
            ->where('is_active', true)
            ->when($departmentId, fn (Builder $query) => $query->where('department_id', $departmentId))
            ->when($employeeId, fn (Builder $query) => $query->whereKey($employeeId))
            ->orderBy('last_name')
            ->orderBy('first_name');
    }

    private function personnelMovementQuery(
        ?string $dateFrom,
        ?string $dateTo,
        ?int $departmentId,
        ?int $employeeId,
    ): Builder {
        return PersonnelMovement::query()
            ->with([
                'employee.department',
                'movementType',
                'fromDepartment',
                'toDepartment',
                'fromPosition',
                'toPosition',
                'fromEmploymentStatus',
                'toEmploymentStatus',
            ])
            ->when($dateFrom, fn (Builder $query) => $query->where('effective_date', '>=', $dateFrom))
            ->when($dateTo, fn (Builder $query) => $query->where('effective_date', '<=', $dateTo))
            ->when($departmentId, fn (Builder $query) => $query->whereHas('employee', fn (Builder $employeeQuery) => $employeeQuery->where('department_id', $departmentId)))
            ->when($employeeId, fn (Builder $query) => $query->where('employee_id', $employeeId))
            ->orderByDesc('effective_date');
    }

    private function scopedDepartmentId(Request $request): ?int
    {
        /** @var User $user */
        $user = $request->user();
        $requestedDepartmentId = $request->integer('department_id') ?: null;

        if ($user->hasRole('Department Head')) {
            $managedDepartmentId = $user->managed_department_id;
            abort_unless($managedDepartmentId !== null, 403);

            if ($requestedDepartmentId !== null && $requestedDepartmentId !== $managedDepartmentId) {
                abort(403);
            }

            return $managedDepartmentId;
        }

        if ($user->hasRole('Employee')) {
            $employeeDepartmentId = $user->employee?->department_id;
            abort_unless($employeeDepartmentId !== null, 403);

            if ($requestedDepartmentId !== null && $requestedDepartmentId !== $employeeDepartmentId) {
                abort(403);
            }

            return $employeeDepartmentId;
        }

        return $requestedDepartmentId;
    }

    private function scopedEmployeeId(Request $request): ?int
    {
        /** @var User $user */
        $user = $request->user();
        $requestedEmployeeId = $request->integer('employee_id') ?: null;

        if ($user->hasRole('Department Head')) {
            if ($requestedEmployeeId === null) {
                return null;
            }

            $employee = Employee::find($requestedEmployeeId);
            abort_unless(
                $employee !== null && $employee->department_id === $user->managed_department_id,
                403,
            );

            return $requestedEmployeeId;
        }

        if ($user->hasRole('Employee')) {
            $ownEmployeeId = $user->employee?->id;
            abort_unless($ownEmployeeId !== null, 403);

            if ($requestedEmployeeId !== null && $requestedEmployeeId !== $ownEmployeeId) {
                abort(403);
            }

            return $ownEmployeeId;
        }

        return $requestedEmployeeId;
    }

    private function assertEmployeeExportScope(User $user, Employee $employee): void
    {
        if ($user->hasRole('Department Head')) {
            abort_unless($employee->department_id === $user->managed_department_id, 403);
        }

        if ($user->hasRole('Employee')) {
            abort_unless($user->employee?->is($employee) ?? false, 403);
        }
    }
}
