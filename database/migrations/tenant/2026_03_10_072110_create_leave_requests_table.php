<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_requests', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('employee_id')->constrained()->restrictOnDelete();
            $table->foreignId('leave_type_id')->constrained()->restrictOnDelete();
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('days_requested', 6, 3);
            $table->text('reason')->nullable();
            $table->string('status', 20)->default('submitted')
                ->comment('submitted, approved, rejected, cancelled');
            $table->timestamp('submitted_at')->nullable();
            $table->foreignId('actioned_by')->nullable()
                ->constrained('users')->nullOnDelete();
            $table->timestamp('actioned_at')->nullable();
            $table->text('remarks')->nullable();
            $table->timestamps();

            $table->index(['employee_id', 'status']);
            $table->index(['leave_type_id', 'status']);
            $table->index('start_date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_requests');
    }
};
