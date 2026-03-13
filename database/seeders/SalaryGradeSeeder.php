<?php

namespace Database\Seeders;

use App\Models\SalaryGrade;
use Illuminate\Database\Seeder;

class SalaryGradeSeeder extends Seeder
{
    /**
     * Philippine Salary Standardization Law (SSL) IV — Tranche 4 (2023) monthly salaries.
     * Source: Executive Order No. 64, s. 2018 as adjusted for Tranche 4.
     *
     * Base salary per grade (step 1) and approximate increments per step.
     */
    public function run(): void
    {
        // [grade => [step1_salary, step_increment_rate]]
        $grades = [
            1 => [13_000.00, 0.0130],
            2 => [13_579.00, 0.0130],
            3 => [14_173.00, 0.0130],
            4 => [14_856.00, 0.0134],
            5 => [15_586.00, 0.0135],
            6 => [16_362.00, 0.0140],
            7 => [17_188.00, 0.0141],
            8 => [18_067.00, 0.0145],
            9 => [18_998.00, 0.0150],
            10 => [20_754.00, 0.0200],
            11 => [22_690.00, 0.0210],
            12 => [24_813.00, 0.0215],
            13 => [27_163.00, 0.0220],
            14 => [29_798.00, 0.0225],
            15 => [32_321.00, 0.0240],
            16 => [35_097.00, 0.0245],
            17 => [38_150.00, 0.0250],
            18 => [41_508.00, 0.0255],
            19 => [45_203.00, 0.0260],
            20 => [49_835.00, 0.0265],
            21 => [55_027.00, 0.0270],
            22 => [60_765.00, 0.0275],
            23 => [67_132.00, 0.0280],
            24 => [74_139.00, 0.0280],
            25 => [81_902.00, 0.0285],
            26 => [90_479.00, 0.0285],
            27 => [99_985.00, 0.0290],
            28 => [110_549.00, 0.0290],
            29 => [122_169.00, 0.0290],
            30 => [135_000.00, 0.0295],
            31 => [149_152.00, 0.0295],
            32 => [164_814.00, 0.0295],
            33 => [182_000.00, 0.0000],
        ];

        $rows = [];

        foreach ($grades as $grade => [$base, $rate]) {
            for ($step = 1; $step <= 8; $step++) {
                $salary = $base * (1 + $rate * ($step - 1));

                $rows[] = [
                    'grade' => $grade,
                    'step' => $step,
                    'monthly_salary' => round($salary, 2),
                ];
            }
        }

        foreach ($rows as $row) {
            SalaryGrade::updateOrCreate(
                ['grade' => $row['grade'], 'step' => $row['step']],
                $row,
            );
        }
    }
}
