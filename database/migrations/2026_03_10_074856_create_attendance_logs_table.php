<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->date('log_date');
            $table->time('time_in')->nullable();
            $table->time('time_out')->nullable();
            $table->enum('status', ['present', 'absent', 'leave', 'holiday', 'rest_day', 'half_day'])
                ->default('present');
            $table->unsignedSmallInteger('minutes_late')->default(0);
            $table->unsignedSmallInteger('minutes_undertime')->default(0);
            $table->text('remarks')->nullable();
            $table->enum('source', ['manual', 'import'])->default('manual');
            $table->foreignId('recorded_by')->nullable()->nullOnDelete()->constrained('users');
            $table->timestamps();

            $table->unique(['employee_id', 'log_date']);
            $table->index('log_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
