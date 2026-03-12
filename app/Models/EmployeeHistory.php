<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeHistory extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeHistoryFactory> */
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'event_type',
        'title',
        'description',
        'effective_date',
        'before_values',
        'after_values',
        'source_type',
        'source_id',
        'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'before_values' => 'array',
            'after_values' => 'array',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
