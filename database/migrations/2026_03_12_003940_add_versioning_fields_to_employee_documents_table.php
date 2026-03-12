<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_documents', function (Blueprint $table): void {
            $table->foreignId('root_document_id')->nullable()->after('document_type_id')
                ->constrained('employee_documents')->nullOnDelete();
            $table->foreignId('previous_version_id')->nullable()->after('root_document_id')
                ->constrained('employee_documents')->nullOnDelete();
            $table->unsignedInteger('version_number')->default(1)->after('previous_version_id');
            $table->boolean('is_current_version')->default(true)->after('is_confidential')->index();
            $table->timestamp('replaced_at')->nullable()->after('is_current_version');
        });

        DB::table('employee_documents')->update([
            'version_number' => 1,
            'is_current_version' => true,
            'root_document_id' => DB::raw('id'),
            'previous_version_id' => null,
            'replaced_at' => null,
        ]);
    }

    public function down(): void
    {
        Schema::table('employee_documents', function (Blueprint $table): void {
            $table->dropForeign(['root_document_id']);
            $table->dropForeign(['previous_version_id']);
            $table->dropColumn([
                'root_document_id',
                'previous_version_id',
                'version_number',
                'is_current_version',
                'replaced_at',
            ]);
        });
    }
};
