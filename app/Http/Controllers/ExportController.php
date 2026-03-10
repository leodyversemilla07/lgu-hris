<?php

namespace App\Http\Controllers;

use App\Exports\AttendanceSummaryExport;
use App\Exports\LeaveLedgerExport;
use App\Exports\PersonnelMasterlistExport;
use App\Exports\PersonnelMovementExport;
use App\Exports\PlantillaExport;
use App\Models\Department;
use App\Models\Employee;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class ExportController extends Controller
{
    public function masterlistExcel(Request $request): BinaryFileResponse
    {
        $export = new PersonnelMasterlistExport(
            departmentId: $request->integer('department_id') ?: null,
            statusFilter: $request->input('status'),
        );

        return Excel::download($export, 'personnel-masterlist.xlsx');
    }

    public function masterlistCsv(Request $request): BinaryFileResponse
    {
        $export = new PersonnelMasterlistExport(
            departmentId: $request->integer('department_id') ?: null,
            statusFilter: $request->input('status'),
        );

        return Excel::download($export, 'personnel-masterlist.csv', \Maatwebsite\Excel\Excel::CSV);
    }

    public function masterlistPdf(Request $request): Response
    {
        $deptId = $request->integer('department_id') ?: null;
        $statusFilter = $request->input('status');

        $query = Employee::with(['department', 'position', 'employmentType', 'employmentStatus'])
            ->when($deptId, fn ($q) => $q->where('department_id', $deptId))
            ->when($statusFilter === 'active', fn ($q) => $q->where('is_active', true))
            ->when($statusFilter === 'inactive', fn ($q) => $q->where('is_active', false))
            ->orderBy('last_name')
            ->orderBy('first_name');

        $department = $deptId ? Department::find($deptId) : null;

        $pdf = Pdf::loadView('pdf.personnel-masterlist', [
            'employees' => $query->get(),
            'department' => $department,
            'statusFilter' => $statusFilter,
        ])->setPaper('legal', 'landscape');

        return $pdf->download('personnel-masterlist.pdf');
    }

    public function plantillaExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new PlantillaExport(departmentId: $request->integer('department_id') ?: null),
            'plantilla-of-personnel.xlsx',
        );
    }

    public function plantillaCsv(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new PlantillaExport(departmentId: $request->integer('department_id') ?: null),
            'plantilla-of-personnel.csv',
            \Maatwebsite\Excel\Excel::CSV,
        );
    }

    public function leaveLedgerExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new LeaveLedgerExport(
                year: $request->integer('year') ?: null,
                departmentId: $request->integer('department_id') ?: null,
                employeeId: $request->integer('employee_id') ?: null,
            ),
            'leave-ledger.xlsx',
        );
    }

    public function leaveLedgerCsv(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new LeaveLedgerExport(
                year: $request->integer('year') ?: null,
                departmentId: $request->integer('department_id') ?: null,
                employeeId: $request->integer('employee_id') ?: null,
            ),
            'leave-ledger.csv',
            \Maatwebsite\Excel\Excel::CSV,
        );
    }

    public function attendanceSummaryExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new AttendanceSummaryExport(
                year: $request->integer('year') ?: null,
                month: $request->integer('month') ?: null,
                departmentId: $request->integer('department_id') ?: null,
            ),
            'attendance-summary.xlsx',
        );
    }

    public function personnelMovementsExcel(Request $request): BinaryFileResponse
    {
        return Excel::download(
            new PersonnelMovementExport(
                dateFrom: $request->input('date_from'),
                dateTo: $request->input('date_to'),
                departmentId: $request->integer('department_id') ?: null,
                employeeId: $request->integer('employee_id') ?: null,
            ),
            'personnel-movements.xlsx',
        );
    }

    public function serviceRecordPdf(Employee $employee): Response
    {
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

        return $pdf->download("service-record-{$employee->employee_number}.pdf");
    }
}
