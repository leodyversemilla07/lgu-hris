<?php

namespace App\Http\Controllers;

use App\Models\LeaveRequest;
use Inertia\Inertia;
use Inertia\Response;

class MyProfileController extends Controller
{
    public function index(): Response
    {
        $user = auth()->user();
        $employee = $user->employee?->load([
            'department',
            'position',
            'employmentType',
            'employmentStatus',
            'compensations.salaryGrade',
        ]);

        $leaveBalances = $employee
            ? $employee->leaveBalances()->with('leaveType')->get()->map(fn ($lb) => [
                'leave_type' => $lb->leaveType->name,
                'balance' => $lb->balance,
            ])
            : collect();

        $recentLeave = $employee
            ? LeaveRequest::query()
                ->where('employee_id', $employee->id)
                ->with('leaveType')
                ->latest()
                ->limit(5)
                ->get()
                ->map(fn (LeaveRequest $lr) => [
                    'id' => $lr->id,
                    'leave_type' => $lr->leaveType->name,
                    'start_date' => $lr->start_date->format('M d, Y'),
                    'end_date' => $lr->end_date->format('M d, Y'),
                    'days' => $lr->days,
                    'status' => $lr->status,
                ])
            : collect();

        $latestComp = $employee?->compensations?->sortByDesc('effective_date')->first();

        return Inertia::render('my-profile/index', [
            'employee' => $employee ? [
                'full_name' => trim(collect([$employee->first_name, $employee->middle_name, $employee->last_name, $employee->suffix])->filter()->join(' ')),
                'employee_number' => $employee->employee_number,
                'department' => $employee->department->name,
                'position' => $employee->position->name,
                'employment_type' => $employee->employmentType->name,
                'employment_status' => $employee->employmentStatus->name,
                'hired_at' => $employee->hired_at?->format('M d, Y'),
                'email' => $employee->email,
                'phone' => $employee->phone,
                'birth_date' => $employee->birth_date?->format('M d, Y'),
                'sex' => $employee->sex,
                'civil_status' => $employee->civil_status,
                'address_street' => $employee->address_street,
                'address_city' => $employee->address_city,
                'address_province' => $employee->address_province,
                'address_zip' => $employee->address_zip,
                'tin' => $employee->tin,
                'gsis_number' => $employee->gsis_number,
                'philhealth_number' => $employee->philhealth_number,
                'pagibig_number' => $employee->pagibig_number,
                'sss_number' => $employee->sss_number,
                'emergency_contact_name' => $employee->emergency_contact_name,
                'emergency_contact_relationship' => $employee->emergency_contact_relationship,
                'emergency_contact_phone' => $employee->emergency_contact_phone,
                'is_active' => $employee->is_active,
            ] : null,
            'compensation' => $latestComp ? [
                'grade' => $latestComp->salaryGrade->grade,
                'step' => $latestComp->salaryGrade->step,
                'monthly_salary' => number_format((float) $latestComp->salaryGrade->monthly_salary, 2),
                'effective_date' => $latestComp->effective_date->format('M d, Y'),
            ] : null,
            'leaveBalances' => $leaveBalances->values(),
            'recentLeave' => $recentLeave->values(),
        ]);
    }
}
