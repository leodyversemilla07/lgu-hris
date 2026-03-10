<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'log_date',
        'time_in',
        'time_out',
        'status',
        'minutes_late',
        'minutes_undertime',
        'remarks',
        'source',
        'recorded_by',
    ];

    protected $casts = [
        'log_date' => 'date',
        'minutes_late' => 'integer',
        'minutes_undertime' => 'integer',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
