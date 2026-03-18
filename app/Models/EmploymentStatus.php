<?php

namespace App\Models;

use Database\Factories\EmploymentStatusFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmploymentStatus extends Model
{
    /** @use HasFactory<EmploymentStatusFactory> */
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'code',
        'name',
        'description',
        'is_active',
    ];

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    public function employees(): HasMany
    {
        return $this->hasMany(Employee::class);
    }
}
