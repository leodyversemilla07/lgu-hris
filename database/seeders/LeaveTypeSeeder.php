<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'code' => 'VL',
                'name' => 'Vacation Leave',
                'max_days_per_year' => 15,
                'requires_approval' => true,
            ],
            [
                'code' => 'SL',
                'name' => 'Sick Leave',
                'max_days_per_year' => 15,
                'requires_approval' => true,
            ],
            [
                'code' => 'ML',
                'name' => 'Maternity Leave',
                'max_days_per_year' => 105,
                'requires_approval' => true,
            ],
            [
                'code' => 'PTL',
                'name' => 'Paternity Leave',
                'max_days_per_year' => 7,
                'requires_approval' => true,
            ],
            [
                'code' => 'SPL',
                'name' => 'Special Privilege Leave',
                'max_days_per_year' => 3,
                'requires_approval' => true,
            ],
            [
                'code' => 'SOWL',
                'name' => 'Solo Parent Leave',
                'max_days_per_year' => 7,
                'requires_approval' => true,
            ],
            [
                'code' => 'FL',
                'name' => 'Forced Leave',
                'max_days_per_year' => 5,
                'requires_approval' => false,
            ],
            [
                'code' => 'OL',
                'name' => 'Official Leave',
                'max_days_per_year' => null,
                'requires_approval' => false,
            ],
        ];

        foreach ($types as $type) {
            LeaveType::firstOrCreate(['code' => $type['code']], array_merge($type, ['is_active' => true]));
        }
    }
}
