<?php

namespace App\Services;

use App\Models\AttendanceLog;
use App\Models\Employee;
use App\Models\WorkSchedule;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class DtrReportService
{
    /**
     * Generate the official CSC Form 48 (DTR) PDF
     * 
     * @param Employee $employee
     * @param int $year
     * @param int $month
     * @return \Barryvdh\DomPDF\PDF
     */
    public function generateCscForm48(Employee $employee, int $year, int $month)
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $days = $this->getMonthlyAttendance($employee, $year, $month);
        
        $totals = [
            'late' => $days->sum('late_minutes'),
            'undertime' => $days->sum('undertime_minutes'),
        ];

        $data = [
            'employee' => $employee,
            'year' => $year,
            'month' => $startDate->format('F'),
            'days' => $days,
            'totals' => $totals,
            'office' => $employee->department?->name ?? 'N/A',
        ];

        // CSC Form 48 is usually printed twice on a single A4/Letter page (left and right)
        // We will pass the data twice to the view for this standard layout.
        return Pdf::loadView('reports.dtr-csc-form-48', $data)
            ->setPaper('a4', 'portrait');
    }

    /**
     * Get processed attendance for a given month
     */
    private function getMonthlyAttendance(Employee $employee, int $year, int $month): Collection
    {
        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = $startDate->copy()->endOfMonth();
        
        $logs = AttendanceLog::where('employee_id', $employee->id)
            ->whereBetween('log_date', [$startDate, $endDate])
            ->get()
            ->keyBy(fn ($log) => $log->log_date->format('Y-m-d'));

        $schedule = $employee->workSchedule;
        $attendance = collect();

        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            $dateStr = $date->format('Y-m-d');
            $log = $logs->get($dateStr);
            
            $attendance->push([
                'day' => $date->day,
                'date' => $date->copy(),
                'is_weekend' => $date->isWeekend(),
                'time_in' => $log?->time_in ? Carbon::parse($log->time_in)->format('h:i') : null,
                'time_out' => $log?->time_out ? Carbon::parse($log->time_out)->format('h:i') : null,
                // In official DTRs, there are 4 columns: AM In, AM Out, PM In, PM Out
                // For simplicity, we split the 8-hour shift.
                'am_in' => $log?->time_in ? Carbon::parse($log->time_in)->format('h:i') : null,
                'am_out' => '12:00', // Typical break
                'pm_in' => '01:00',  // Typical return
                'pm_out' => $log?->time_out ? Carbon::parse($log->time_out)->format('h:i') : null,
                'late_minutes' => $log?->minutes_late ?? 0,
                'undertime_minutes' => $log?->minutes_undertime ?? 0,
            ]);
        }

        return $attendance;
    }
}
