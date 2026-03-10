<?php

namespace Database\Seeders;

use App\Models\MovementType;
use Illuminate\Database\Seeder;

class MovementTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'code' => 'PROMO',
                'name' => 'Promotion',
                'description' => 'Advancement to a higher position or salary grade.',
            ],
            [
                'code' => 'TRANSFER',
                'name' => 'Transfer',
                'description' => 'Movement from one department or office to another.',
            ],
            [
                'code' => 'REAPP',
                'name' => 'Reappointment',
                'description' => 'Reappointment to the same or equivalent position.',
            ],
            [
                'code' => 'STATCHG',
                'name' => 'Status Change',
                'description' => 'Change in employment status, e.g., Casual to Permanent.',
            ],
            [
                'code' => 'SEP',
                'name' => 'Separation',
                'description' => 'Voluntary resignation, retirement, or termination.',
            ],
            [
                'code' => 'REINST',
                'name' => 'Reinstatement',
                'description' => 'Return to service after separation.',
            ],
            [
                'code' => 'DETAIL',
                'name' => 'Detail',
                'description' => 'Temporary assignment to another office or unit.',
            ],
            [
                'code' => 'STEP',
                'name' => 'Step Increment',
                'description' => 'Salary step increment within the same position.',
            ],
        ];

        foreach ($types as $type) {
            MovementType::firstOrCreate(
                ['code' => $type['code']],
                array_merge($type, ['is_active' => true]),
            );
        }
    }
}
