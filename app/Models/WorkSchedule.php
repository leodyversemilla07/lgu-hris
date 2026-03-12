<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'time_in',
        'time_out',
        'break_minutes',
        'work_hours_per_day',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'work_hours_per_day' => 'float',
        ];
    }

    public function attendanceLogs(): HasMany
    {
        return $this->hasMany(AttendanceLog::class);
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
