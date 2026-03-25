<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BiometricDevice extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'brand',
        'model_number',
        'serial_number',
        'ip_address',
        'port',
        'protocol',
        'location',
        'is_active',
        'last_sync_at',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'last_sync_at' => 'datetime',
    ];

    public function rawLogs(): HasMany
    {
        return $this->hasMany(BiometricRawLog::class);
    }
}
