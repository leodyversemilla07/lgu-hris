<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\EmploymentStatus;
use App\Models\EmploymentType;
use App\Models\Position;
use Illuminate\Database\Seeder;

class HrReferenceSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['code' => 'HRMO', 'name' => 'Human Resource Management Office'],
            ['code' => 'MAYOR', 'name' => 'Office of the Municipal Mayor'],
            ['code' => 'BUDGET', 'name' => 'Municipal Budget Office'],
            ['code' => 'MTO', 'name' => 'Municipal Treasurer Office'],
        ];

        foreach ($departments as $department) {
            Department::query()->updateOrCreate(
                ['code' => $department['code']],
                [
                    'name' => $department['name'],
                    'description' => $department['name'],
                    'is_active' => true,
                ],
            );
        }

        $employmentTypes = [
            ['code' => 'PERM', 'name' => 'Permanent'],
            ['code' => 'CAS', 'name' => 'Casual'],
            ['code' => 'COS', 'name' => 'Contract of Service'],
            ['code' => 'JO', 'name' => 'Job Order'],
        ];

        foreach ($employmentTypes as $employmentType) {
            EmploymentType::query()->updateOrCreate(
                ['code' => $employmentType['code']],
                [
                    'name' => $employmentType['name'],
                    'description' => $employmentType['name'],
                    'is_active' => true,
                ],
            );
        }

        $employmentStatuses = [
            ['code' => 'ACTIVE', 'name' => 'Active'],
            ['code' => 'LEAVE', 'name' => 'On Leave'],
            ['code' => 'SEP', 'name' => 'Separated'],
        ];

        foreach ($employmentStatuses as $employmentStatus) {
            EmploymentStatus::query()->updateOrCreate(
                ['code' => $employmentStatus['code']],
                [
                    'name' => $employmentStatus['name'],
                    'description' => $employmentStatus['name'],
                    'is_active' => true,
                ],
            );
        }

        $positions = [
            ['code' => 'HRAIDE1', 'name' => 'Administrative Aide I', 'department_code' => 'HRMO', 'salary_grade' => 'SG-1'],
            ['code' => 'HROFF1', 'name' => 'Administrative Officer I', 'department_code' => 'HRMO', 'salary_grade' => 'SG-10'],
            ['code' => 'BUDGOFF1', 'name' => 'Budget Officer I', 'department_code' => 'BUDGET', 'salary_grade' => 'SG-11'],
            ['code' => 'TREAS1', 'name' => 'Treasurer Staff I', 'department_code' => 'MTO', 'salary_grade' => 'SG-8'],
        ];

        foreach ($positions as $position) {
            $department = Department::query()->where('code', $position['department_code'])->firstOrFail();

            Position::query()->updateOrCreate(
                ['code' => $position['code']],
                [
                    'department_id' => $department->id,
                    'name' => $position['name'],
                    'salary_grade' => $position['salary_grade'],
                    'description' => $position['name'],
                    'is_active' => true,
                ],
            );
        }
    }
}
