<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReportExport extends Model
{
    /** @use HasFactory<\Database\Factories\ReportExportFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'report_key',
        'report_name',
        'export_format',
        'file_name',
        'department_id',
        'employee_id',
        'filters',
        'exported_at',
    ];

    protected function casts(): array
    {
        return [
            'filters' => 'array',
            'exported_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }
}
