<?php

namespace App\Console\Commands;

use App\Models\Employee;
use App\Models\EmploymentType;
use App\Models\LeaveBalance;
use App\Models\LeaveType;
use App\Models\AuditLog;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class AddMonthlyLeaveCredits extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'hris:add-monthly-leave-credits {--force : Force the addition of credits even if already added for this month}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Automatically add 1.25 monthly leave credits (VL/SL) to active permanent employees.';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $year = now()->year;
        $month = now()->month;
        $today = now()->format('Y-m-d');

        $this->info("Starting monthly leave credit addition for {$year}-" . str_pad($month, 2, '0', STR_PAD_LEFT));

        // 1. Check if we've already run this month (unless forced)
        if (!$this->option('force')) {
            $alreadyRun = DB::table('audit_logs')
                ->where('event', 'monthly_leave_credits_added')
                ->whereYear('created_at', $year)
                ->whereMonth('created_at', $month)
                ->exists();

            if ($alreadyRun) {
                $this->warn("Monthly leave credits have already been added for this month.");
                return self::SUCCESS;
            }
        }

        // 2. Get required reference IDs
        $permanentType = EmploymentType::where('name', 'Permanent')->first();
        if (!$permanentType) {
            $this->error("Permanent employment type not found. Please seed the database.");
            return self::FAILURE;
        }

        $vlType = LeaveType::where('code', 'VL')->first();
        $slType = LeaveType::where('code', 'SL')->first();

        if (!$vlType || !$slType) {
            $this->error("VL or SL leave types not found. Please seed the database.");
            return self::FAILURE;
        }

        // 3. Find active permanent employees
        $employees = Employee::query()
            ->where('is_active', true)
            ->where('employment_type_id', $permanentType->id)
            ->get();

        if ($employees->isEmpty()) {
            $this->warn("No active permanent employees found.");
            return self::SUCCESS;
        }

        $this->info("Found {$employees->count()} employees. Processing...");

        $bar = $this->output->createProgressBar($employees->count());
        $bar->start();

        DB::transaction(function () use ($employees, $vlType, $slType, $year, $bar) {
            foreach ($employees as $employee) {
                // Add 1.25 for Vacation Leave (VL)
                $this->addCredit($employee, $vlType, $year, 1.25);

                // Add 1.25 for Sick Leave (SL)
                $this->addCredit($employee, $slType, $year, 1.25);

                $bar->advance();
            }
        });

        $bar->finish();
        $this->newLine();

        // 4. Record in Audit Log
        AuditLog::create([
            'event' => 'monthly_leave_credits_added',
            'user_id' => null, // System-generated
            'auditable_type' => 'System',
            'auditable_id' => 0,
            'old_values' => null,
            'new_values' => ['year' => $year, 'month' => $month, 'count' => $employees->count()],
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Artisan Command',
        ]);

        $this->info("Successfully added leave credits for {$employees->count()} employees.");

        return self::SUCCESS;
    }

    private function addCredit(Employee $employee, LeaveType $leaveType, int $year, float $amount)
    {
        $balance = LeaveBalance::firstOrCreate(
            [
                'employee_id' => $employee->id,
                'leave_type_id' => $leaveType->id,
                'year' => $year,
            ],
            [
                'total_days' => 0,
                'used_days' => 0,
            ]
        );

        $balance->increment('total_days', $amount);
    }
}
