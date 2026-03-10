<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $permissions = [
            'employees.view',
            'employees.manage',
            'documents.view',
            'documents.manage',
            'leave.file',
            'leave.approve',
            'movements.view',
            'movements.manage',
            'attendance.view',
            'attendance.manage',
            'reports.view',
            'reports.export',
            'access-control.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        $rolePermissions = [
            'HR Admin' => $permissions,
            'HR Staff' => [
                'employees.view',
                'employees.manage',
                'documents.view',
                'documents.manage',
                'leave.file',
                'leave.approve',
                'movements.view',
                'movements.manage',
                'attendance.view',
                'attendance.manage',
                'reports.view',
                'reports.export',
            ],
            'Department Head' => [
                'employees.view',
                'documents.view',
                'leave.approve',
                'movements.view',
                'attendance.view',
                'reports.view',
            ],
            'Employee' => [
                'leave.file',
            ],
        ];

        foreach ($rolePermissions as $roleName => $grantedPermissions) {
            $role = Role::findOrCreate($roleName, 'web');
            $role->syncPermissions($grantedPermissions);
        }

        $adminUser = User::query()->firstOrCreate(
            ['email' => 'hr.admin@example.com'],
            [
                'name' => 'HR Admin',
                'password' => 'password',
                'email_verified_at' => now(),
            ],
        );

        $adminUser->syncRoles(['HR Admin']);
    }
}
