<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    public function before(User $user, string $ability): ?bool
    {
        if ($user->hasRole('HR Admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('employees.view');
    }

    public function view(User $user, Employee $employee): bool
    {
        if ($user->hasRole('HR Staff')) {
            return $user->can('employees.view');
        }

        if ($user->hasRole('Department Head')) {
            return $user->can('employees.view') && $this->managesEmployee($user, $employee);
        }

        return $this->ownsEmployee($user, $employee);
    }

    public function create(User $user): bool
    {
        return $user->can('employees.manage');
    }

    public function update(User $user, Employee $employee): bool
    {
        return $user->hasRole('HR Staff') && $user->can('employees.manage');
    }

    public function archive(User $user, Employee $employee): bool
    {
        return $this->update($user, $employee);
    }

    public function restore(User $user, Employee $employee): bool
    {
        return $this->update($user, $employee);
    }

    public function linkUser(User $user, Employee $employee): bool
    {
        return $this->update($user, $employee);
    }

    private function managesEmployee(User $user, Employee $employee): bool
    {
        return $user->managed_department_id !== null
            && $user->managed_department_id === $employee->department_id;
    }

    private function ownsEmployee(User $user, Employee $employee): bool
    {
        return $user->employee?->is($employee) ?? false;
    }
}
