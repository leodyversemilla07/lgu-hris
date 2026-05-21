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
        Schema::create('attendance_summaries', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('employee_id')->constrained()->cascadeOnDelete();
            $table->unsignedSmallInteger('year');
            $table->unsignedTinyInteger('month');
            $table->unsignedTinyInteger('days_present')->default(0);
            $table->unsignedTinyInteger('days_absent')->default(0);
            $table->unsignedTinyInteger('days_leave')->default(0);
            $table->unsignedTinyInteger('days_holiday')->default(0);
            $table->unsignedTinyInteger('days_rest_day')->default(0);
            $table->unsignedSmallInteger('total_late_minutes')->default(0);
            $table->unsignedSmallInteger('total_undertime_minutes')->default(0);
            $table->timestamps();

            $table->unique(['employee_id', 'year', 'month']);
            $table->index(['year', 'month']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendance_summaries');
    }
};
