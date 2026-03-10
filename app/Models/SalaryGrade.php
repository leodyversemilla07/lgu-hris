<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SalaryGrade extends Model
{
    use HasFactory;

    protected $fillable = [
        'grade',
        'step',
        'monthly_salary',
    ];

    protected $casts = [
        'grade' => 'integer',
        'step' => 'integer',
        'monthly_salary' => 'decimal:2',
    ];

    public function compensations(): HasMany
    {
        return $this->hasMany(EmployeeCompensation::class);
    }
}
