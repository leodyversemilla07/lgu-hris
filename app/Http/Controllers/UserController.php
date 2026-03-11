<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Department;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(): Response
    {
        $users = User::with(['roles', 'managedDepartment'])
            ->orderBy('name')
            ->get()
            ->map(fn (User $user): array => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->toArray(),
                'managed_department_id' => $user->managed_department_id ? (string) $user->managed_department_id : null,
                'created_at' => $user->created_at?->format('Y-m-d'),
            ]);

        $roles = Role::orderBy('name')->pluck('name');

        $departments = Department::where('is_active', true)->orderBy('name')->get(['id', 'name'])
            ->map(fn (Department $d): array => ['value' => (string) $d->id, 'label' => $d->name]);

        $auditLogs = AuditLog::with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get()
            ->map(fn (AuditLog $log): array => [
                'id' => $log->id,
                'user' => $log->user?->name ?? 'System',
                'event' => $log->event,
                'auditable_type' => class_basename($log->auditable_type),
                'auditable_id' => $log->auditable_id,
                'description' => $log->description,
                'ip_address' => $log->ip_address,
                'created_at' => $log->created_at?->format('Y-m-d H:i:s'),
            ]);

        return Inertia::render('access-control/index', [
            'users' => $users,
            'roles' => $roles,
            'departments' => $departments,
            'auditLogs' => $auditLogs,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'role' => ['required', 'string', 'exists:roles,name'],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'email_verified_at' => now(),
        ]);

        $user->syncRoles([$validated['role']]);

        AuditService::log(
            'user_created',
            $user,
            null,
            ['name' => $user->name, 'email' => $user->email, 'role' => $validated['role']],
            "User {$user->email} created with role {$validated['role']}",
        );

        return to_route('access-control.index')
            ->with('success', "User {$user->name} created successfully.");
    }

    public function update(User $user, Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
            'managed_department_id' => ['nullable', 'integer', 'exists:departments,id'],
        ]);

        $oldRoles = $user->roles->pluck('name')->toArray();
        $user->syncRoles([$validated['role']]);
        $user->update(['managed_department_id' => $validated['managed_department_id'] ?? null]);

        AuditService::log(
            'role_changed',
            $user,
            ['roles' => $oldRoles],
            ['roles' => [$validated['role']]],
            "User {$user->email} role changed to {$validated['role']}",
        );

        return to_route('access-control.index')
            ->with('success', "Role updated for {$user->name}.");
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return to_route('access-control.index')
                ->with('error', 'You cannot delete your own account.');
        }

        $isLastAdmin = $user->hasRole('HR Admin')
            && User::role('HR Admin')->count() <= 1;

        if ($isLastAdmin) {
            return to_route('access-control.index')
                ->with('error', 'Cannot delete the last HR Admin account.');
        }

        AuditService::log(
            'user_deleted',
            $user,
            ['name' => $user->name, 'email' => $user->email, 'roles' => $user->roles->pluck('name')->toArray()],
            null,
            "User {$user->email} deleted",
        );

        $user->delete();

        return to_route('access-control.index')
            ->with('success', "{$user->name} has been removed.");
    }
}
