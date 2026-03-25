<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BiometricRawLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'biometric_device_id',
        'employee_external_id',
        'timestamp',
        'punch_type',
        'verify_mode',
        'raw_payload',
        'is_processed',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'raw_payload' => 'array',
        'is_processed' => 'boolean',
    ];

    public function device(): BelongsTo
    {
        return $this->belongsTo(BiometricDevice::class, 'biometric_device_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_external_id', 'employee_number');
    }
}
