<?php

namespace App\Observers;

use App\Models\Employee;
use App\Services\AuditService;
use App\Services\EmployeeHistoryService;

class EmployeeObserver
{
    public function created(Employee $employee): void
    {
        AuditService::log(
            'created',
            $employee,
            null,
            $employee->only([
                'employee_number', 'first_name', 'last_name',
                'department_id', 'position_id', 'employment_status_id',
            ]),
            "Employee {$employee->employee_number} created",
        );

        EmployeeHistoryService::recordCreated($employee);
    }

    public function updated(Employee $employee): void
    {
        $changes = $employee->getChanges();

        if ($changes === []) {
            return;
        }

        $old = array_intersect_key($employee->getPrevious(), $changes);

        AuditService::log(
            'updated',
            $employee,
            $old,
            $changes,
            "Employee {$employee->employee_number} updated",
        );

        EmployeeHistoryService::recordUpdated($employee);
    }
}
