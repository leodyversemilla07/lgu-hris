<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonnelMovement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'uuid',
        'employee_id',
        'movement_type_id',
        'effective_date',
        'from_department_id',
        'to_department_id',
        'from_position_id',
        'to_position_id',
        'from_employment_status_id',
        'to_employment_status_id',
        'order_number',
        'remarks',
        'recorded_by',
    ];

    public function getRouteKeyName(): string
    {
        return 'uuid';
    }

    public function uniqueIds(): array
    {
        return ['uuid'];
    }

    protected $casts = [
        'effective_date' => 'date',
    ];

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function movementType(): BelongsTo
    {
        return $this->belongsTo(MovementType::class);
    }

    public function fromDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'from_department_id');
    }

    public function toDepartment(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'to_department_id');
    }

    public function fromPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'from_position_id');
    }

    public function toPosition(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'to_position_id');
    }

    public function fromEmploymentStatus(): BelongsTo
    {
        return $this->belongsTo(EmploymentStatus::class, 'from_employment_status_id');
    }

    public function toEmploymentStatus(): BelongsTo
    {
        return $this->belongsTo(EmploymentStatus::class, 'to_employment_status_id');
    }

    public function recordedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
