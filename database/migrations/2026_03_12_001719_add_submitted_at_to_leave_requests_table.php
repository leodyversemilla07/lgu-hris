<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->timestamp('submitted_at')->nullable()->after('status');
        });

        DB::table('leave_requests')
            ->whereNull('submitted_at')
            ->whereIn('status', ['submitted', 'approved', 'rejected', 'cancelled'])
            ->update(['submitted_at' => DB::raw('created_at')]);
    }

    public function down(): void
    {
        Schema::table('leave_requests', function (Blueprint $table) {
            $table->dropColumn('submitted_at');
        });
    }
};
