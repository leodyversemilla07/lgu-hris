<?php

namespace App\Policies;

use App\Models\EmployeeDocument;
use App\Models\User;

class EmployeeDocumentPolicy
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
        return $user->can('documents.view');
    }

    public function view(User $user, EmployeeDocument $employeeDocument): bool
    {
        if (! $user->can('documents.view')) {
            return false;
        }

        if ($user->hasRole('HR Staff')) {
            return true;
        }

        if ($user->hasRole('Department Head')) {
            return ! $employeeDocument->is_confidential
                && $user->managed_department_id !== null
                && $employeeDocument->employee?->department_id === $user->managed_department_id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        return $user->hasRole('HR Staff') && $user->can('documents.manage');
    }

    public function update(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $this->delete($user, $employeeDocument);
    }

    public function delete(User $user, EmployeeDocument $employeeDocument): bool
    {
        return $user->hasRole('HR Staff') && $user->can('documents.manage');
    }
}
