<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->string('source')->default('manual')->change();
        });
    }

    public function down(): void
    {
        DB::table('attendance_logs')
            ->where('source', 'biometric')
            ->update(['source' => 'import']);

        Schema::table('attendance_logs', function (Blueprint $table) {
            $table->enum('source', ['manual', 'import'])->default('manual')->change();
        });
    }
};
