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
        Schema::table('employees', function (Blueprint $table) {
            // Personal details
            $table->enum('sex', ['male', 'female'])->nullable()->after('birth_date');
            $table->enum('civil_status', ['single', 'married', 'widowed', 'separated', 'divorced'])->nullable()->after('sex');

            // Address
            $table->string('address_street')->nullable()->after('civil_status');
            $table->string('address_city', 100)->nullable()->after('address_street');
            $table->string('address_province', 100)->nullable()->after('address_city');
            $table->string('address_zip', 20)->nullable()->after('address_province');

            // Government IDs
            $table->string('tin', 50)->nullable()->after('address_zip');
            $table->string('gsis_number', 50)->nullable()->after('tin');
            $table->string('philhealth_number', 50)->nullable()->after('gsis_number');
            $table->string('pagibig_number', 50)->nullable()->after('philhealth_number');
            $table->string('sss_number', 50)->nullable()->after('pagibig_number');

            // Emergency contact
            $table->string('emergency_contact_name')->nullable()->after('sss_number');
            $table->string('emergency_contact_relationship', 100)->nullable()->after('emergency_contact_name');
            $table->string('emergency_contact_phone', 50)->nullable()->after('emergency_contact_relationship');

            // User linkage
            $table->foreignId('user_id')->nullable()->after('id')
                ->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('employees', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id', 'sex', 'civil_status',
                'address_street', 'address_city', 'address_province', 'address_zip',
                'tin', 'gsis_number', 'philhealth_number', 'pagibig_number', 'sss_number',
                'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
            ]);
        });
    }
};
