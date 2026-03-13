<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_documents', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->foreignId('document_type_id')->constrained()->cascadeOnDelete();
            $table->foreignId('root_document_id')->nullable()->constrained('employee_documents')->nullOnDelete();
            $table->foreignId('previous_version_id')->nullable()->constrained('employee_documents')->nullOnDelete();
            $table->unsignedInteger('version_number')->default(1);
            $table->string('file_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->boolean('is_confidential')->default(false)->index();
            $table->boolean('is_current_version')->default(true)->index();
            $table->timestamp('replaced_at')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'document_type_id']);
            $table->index(['employee_id', 'is_confidential']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_documents');
    }
};
