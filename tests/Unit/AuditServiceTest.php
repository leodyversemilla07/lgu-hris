<?php

use App\Models\Employee;
use App\Models\User;
use App\Services\AuditService;
use Database\Seeders\RoleAndPermissionSeeder;
use Tests\TestCase;

uses(TestCase::class);

beforeEach(function () {
    $this->seed(RoleAndPermissionSeeder::class);
    $this->user = User::factory()->create();
    $this->user->assignRole('HR Admin');

    $this->actingAs($this->user);
});

test('audit service logs an event with all fields', function () {
    $employee = Employee::factory()->create();

    AuditService::log(
        event: 'created',
        auditable: $employee,
        oldValues: null,
        newValues: ['first_name' => 'Juan', 'last_name' => 'Dela Cruz'],
        description: 'Employee created',
    );

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'event' => 'created',
        'auditable_type' => Employee::class,
        'auditable_id' => $employee->id,
        'description' => 'Employee created',
        'ip_address' => '127.0.0.1',
    ]);
});

test('audit service logs event without optional fields', function () {
    $employee = Employee::factory()->create();

    AuditService::log(
        event: 'deleted',
        auditable: $employee,
    );

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $this->user->id,
        'event' => 'deleted',
        'auditable_type' => Employee::class,
        'auditable_id' => $employee->id,
        'description' => null,
        'ip_address' => '127.0.0.1',
    ]);
});

test('audit service stores old and new values when provided', function () {
    $employee = Employee::factory()->create();

    $oldValues = ['first_name' => 'Juan', 'is_active' => true];
    $newValues = ['first_name' => 'Juan Carlos', 'is_active' => false];

    AuditService::log(
        event: 'updated',
        auditable: $employee,
        oldValues: $oldValues,
        newValues: $newValues,
        description: 'Employee updated',
    );

    $this->assertDatabaseHas('audit_logs', [
        'event' => 'updated',
        'auditable_id' => $employee->id,
    ]);
});
