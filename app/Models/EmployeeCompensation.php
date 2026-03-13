<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeCompensation extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'employee_compensation';

    protected $fillable = [
        'uuid',
        'employee_id',
        'salary_grade_id',
        'effective_date',
        'allowances',
        'deductions',
        'notes',
        'recorded_by',
    ];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    protected $casts = [
        'effective_date' => 'date',
        'allowances' => 'decimal:2',
        'deductions' => 'decimal:2',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function salaryGrade(): BelongsTo
    {
        return $this->belongsTo(SalaryGrade::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
