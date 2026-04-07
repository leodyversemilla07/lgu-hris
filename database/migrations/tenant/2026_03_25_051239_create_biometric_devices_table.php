<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biometric_devices', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('brand')->default('zkteco'); // zkteco, hikvision, etc.
            $table->string('model_number')->nullable();
            $table->string('serial_number')->unique();
            $table->string('ip_address')->nullable();
            $table->integer('port')->default(4370); // Default ZK port
            $table->string('protocol')->default('push'); // push (ADMS), poll (TCP/IP)
            $table->string('location')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamp('last_sync_at')->nullable();
            $table->timestamps();
        });

        Schema::create('biometric_raw_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('biometric_device_id')->constrained()->cascadeOnDelete();
            $table->string('employee_external_id'); // The ID on the device (usually employee_number)
            $table->dateTime('timestamp');
            $table->string('punch_type')->default('0'); // 0=In, 1=Out, etc.
            $table->string('verify_mode')->nullable(); // Finger, Face, etc.
            $table->json('raw_payload')->nullable();
            $table->boolean('is_processed')->default(false);
            $table->timestamps();

            $table->index(['employee_external_id', 'timestamp']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biometric_raw_logs');
        Schema::dropIfExists('biometric_devices');
    }
};
