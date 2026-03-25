<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Services\DtrReportService;
use Illuminate\Http\Request;

class DtrExportController extends Controller
{
    public function __construct(
        protected DtrReportService $dtrService
    ) {}

    /**
     * Export single employee DTR (CSC Form 48)
     */
    public function export(Request $request, Employee $employee)
    {
        $this->authorize('exportDtr', $employee);

        $year = $request->integer('year', now()->year);
        $month = $request->integer('month', now()->month);

        $pdf = $this->dtrService->generateCscForm48($employee, $year, $month);

        $filename = "DTR_{$employee->last_name}_{$year}_{$month}.pdf";
        
        return $pdf->download($filename);
    }
}
