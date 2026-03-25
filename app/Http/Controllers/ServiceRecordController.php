<?php

namespace App\Http\Controllers;

use App\Models\Employee;
use App\Services\ServiceRecordReportService;
use Illuminate\Http\Request;

class ServiceRecordController extends Controller
{
    public function __construct(
        protected ServiceRecordReportService $serviceRecordService
    ) {}

    /**
     * Export employee Service Record PDF
     */
    public function export(Request $request, Employee $employee)
    {
        $this->authorize('exportServiceRecord', $employee);

        $pdf = $this->serviceRecordService->generateServiceRecord($employee);

        $filename = "ServiceRecord_{$employee->last_name}.pdf";
        
        return $pdf->download($filename);
    }
}
