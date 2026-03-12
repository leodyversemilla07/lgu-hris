<?php

namespace App\Observers;

use App\Models\PersonnelMovement;
use App\Services\EmployeeHistoryService;

class PersonnelMovementObserver
{
    public function created(PersonnelMovement $personnelMovement): void
    {
        EmployeeHistoryService::recordMovement($personnelMovement);
    }
}
