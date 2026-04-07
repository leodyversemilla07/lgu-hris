<?php

namespace App\Http\Controllers\Central;

use App\Http\Controllers\Controller;
use App\Models\Tenant;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class TenantController extends Controller
{
    public function index(): Response
    {
        $tenants = Tenant::query()
            ->with('domains')
            ->orderBy('name')
            ->get()
            ->map(fn(Tenant $tenant) => [
                'id'           => $tenant->id,
                'name'         => $tenant->name,
                'municipality' => $tenant->municipality,
                'province'     => $tenant->province,
                'is_active'    => $tenant->is_active,
                'domain'       => $tenant->domains->first()?->domain,
                'created_at'   => $tenant->created_at,
            ]);

        return Inertia::render('Central/Tenants/Index', [
            'tenants' => $tenants,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Central/Tenants/Create');
    }

    public function store(): RedirectResponse
    {
        $data = request()->validate([
            'name'         => ['required', 'string', 'max:255'],
            'municipality' => ['required', 'string', 'max:255'],
            'province'     => ['required', 'string', 'max:255'],
            'subdomain'    => ['required', 'string', 'max:63', 'alpha_dash', 'unique:domains,domain'],
        ]);

        $tenant = Tenant::create([
            'name'         => $data['name'],
            'municipality' => $data['municipality'],
            'province'     => $data['province'],
        ]);

        $tenant->domains()->create([
            'domain' => $data['subdomain'].'.'.config('tenancy.central_domains')[2],
        ]);

        return redirect()->route('central.tenants.index')
            ->with('success', "LGU \"{$data['name']}\" has been created and its database is being provisioned.");
    }

    public function show(Tenant $tenant): Response
    {
        $tenant->load('domains');

        return Inertia::render('Central/Tenants/Show', [
            'tenant' => [
                'id'           => $tenant->id,
                'name'         => $tenant->name,
                'municipality' => $tenant->municipality,
                'province'     => $tenant->province,
                'is_active'    => $tenant->is_active,
                'domain'       => $tenant->domains->first()?->domain,
                'created_at'   => $tenant->created_at,
            ],
        ]);
    }

    public function edit(Tenant $tenant): Response
    {
        $tenant->load('domains');

        return Inertia::render('Central/Tenants/Edit', [
            'tenant' => [
                'id'           => $tenant->id,
                'name'         => $tenant->name,
                'municipality' => $tenant->municipality,
                'province'     => $tenant->province,
                'is_active'    => $tenant->is_active,
                'subdomain'    => explode('.', $tenant->domains->first()?->domain ?? '')[0] ?? '',
            ],
        ]);
    }

    public function update(Tenant $tenant): RedirectResponse
    {
        $data = request()->validate([
            'name'         => ['required', 'string', 'max:255'],
            'municipality' => ['required', 'string', 'max:255'],
            'province'     => ['required', 'string', 'max:255'],
        ]);

        $tenant->update($data);

        return redirect()->route('central.tenants.show', $tenant)
            ->with('success', 'LGU updated successfully.');
    }

    public function toggle(Tenant $tenant): RedirectResponse
    {
        $tenant->update(['is_active' => ! $tenant->is_active]);

        $status = $tenant->is_active ? 'activated' : 'deactivated';

        return redirect()->route('central.tenants.index')
            ->with('success', "LGU \"{$tenant->name}\" has been {$status}.");
    }

    public function destroy(Tenant $tenant): RedirectResponse
    {
        $name = $tenant->name;
        $tenant->delete(); // This triggers TenantDeleted event → deletes the database automatically

        return redirect()->route('central.tenants.index')
            ->with('success', "LGU \"{$name}\" and all its data have been permanently deleted.");
    }
}
