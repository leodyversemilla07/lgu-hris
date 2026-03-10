<?php

namespace App\Observers;

use App\Models\Employee;
use App\Services\AuditService;

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
    }

    public function updated(Employee $employee): void
    {
        $dirty = $employee->getDirty();
        if (empty($dirty)) {
            return;
        }

        $old = array_intersect_key($employee->getOriginal(), $dirty);

        AuditService::log(
            'updated',
            $employee,
            $old,
            $dirty,
            "Employee {$employee->employee_number} updated",
        );
    }
}
