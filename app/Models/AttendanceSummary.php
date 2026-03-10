<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceSummary extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'year',
        'month',
        'days_present',
        'days_absent',
        'days_leave',
        'days_holiday',
        'days_rest_day',
        'total_late_minutes',
        'total_undertime_minutes',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'days_present' => 'integer',
        'days_absent' => 'integer',
        'days_leave' => 'integer',
        'days_holiday' => 'integer',
        'days_rest_day' => 'integer',
        'total_late_minutes' => 'integer',
        'total_undertime_minutes' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
