<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class EmployeeDocument extends Model
{
    /** @use HasFactory<\Database\Factories\EmployeeDocumentFactory> */
    use HasFactory;

    protected $fillable = [
        'employee_id',
        'document_type_id',
        'root_document_id',
        'previous_version_id',
        'version_number',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'uploaded_by',
        'notes',
        'is_confidential',
        'is_current_version',
        'replaced_at',
    ];

    protected function casts(): array
    {
        return [
            'version_number' => 'integer',
            'file_size' => 'integer',
            'is_confidential' => 'boolean',
            'is_current_version' => 'boolean',
            'replaced_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class);
    }

    public function documentType(): BelongsTo
    {
        return $this->belongsTo(DocumentType::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function rootDocument(): BelongsTo
    {
        return $this->belongsTo(self::class, 'root_document_id');
    }

    public function previousVersion(): BelongsTo
    {
        return $this->belongsTo(self::class, 'previous_version_id');
    }

    public function nextVersions(): HasMany
    {
        return $this->hasMany(self::class, 'previous_version_id');
    }

    public function versionHistory(): HasMany
    {
        return $this->hasMany(self::class, 'root_document_id', 'root_document_id');
    }
}
