import { Form, Head, Link, useForm } from '@inertiajs/react';
import CentralLayout from '@/layouts/central/central-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { centralTenantsIndex } from '@/routes/central-tenants-index';
import { centralTenantsEdit } from '@/routes/central-tenants-edit';
import { centralTenantsToggle } from '@/routes/central-tenants-toggle';
import { centralTenantsDestroy } from '@/routes/central-tenants-destroy';

type Tenant = {
    id: string;
    name: string;
    municipality: string;
    province: string;
    is_active: boolean;
    domain: string;
    created_at: string;
};

type Props = {
    tenant: Tenant;
};

export default function TenantsShow({ tenant }: Props) {
    const toggleForm = useForm();
    const deleteForm = useForm();

    const handleToggle = (e: React.FormEvent) => {
        e.preventDefault();
        toggleForm.patch(centralTenantsToggle({ tenant: tenant.id }));
    };

    const handleDelete = (e: React.FormEvent) => {
        e.preventDefault();
        if (confirm(`Are you absolutely sure you want to delete ${tenant.name}? This will DROP their entire database and cannot be undone.`)) {
            deleteForm.delete(centralTenantsDestroy({ tenant: tenant.id }));
        }
    };

    return (
        <CentralLayout breadcrumbs={[
            { title: 'Tenants', href: '/tenants' },
            { title: tenant.name, href: `/tenants/${tenant.id}` },
        ]}>
            <Head title={`LGU: ${tenant.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">{tenant.name}</h1>
                    <div className="flex space-x-2">
                        <Button variant="outline" asChild>
                            <Link href={centralTenantsIndex()}>Back</Link>
                        </Button>
                        <Button asChild>
                            <Link href={centralTenantsEdit({ tenant: tenant.id })}>Edit</Link>
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-md border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4">LGU Information</h2>
                        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Municipality / City</dt>
                                <dd className="mt-1 text-base">{tenant.municipality}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Province</dt>
                                <dd className="mt-1 text-base">{tenant.province}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Subdomain URL</dt>
                                <dd className="mt-1 text-base">
                                    <a href={`http://${tenant.domain}:8000`} target="_blank" className="text-blue-600 hover:underline">
                                        {tenant.domain}
                                    </a>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                                <dd className="mt-1">
                                    <Badge variant={tenant.is_active ? 'default' : 'destructive'}>
                                        {tenant.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                </dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-muted-foreground">Registered At</dt>
                                <dd className="mt-1 text-base">{new Date(tenant.created_at).toLocaleDateString()}</dd>
                            </div>
                        </dl>
                    </div>

                    <div className="rounded-md border bg-card p-6 shadow-sm">
                        <h2 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h2>
                        
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-medium">Suspend Access</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-2">
                                    {tenant.is_active 
                                        ? "Deactivating will prevent all LGU users from accessing their HRIS." 
                                        : "Activating will restore access for all LGU users."}
                                </p>
                                <form onSubmit={handleToggle}>
                                    <Button type="submit" variant={tenant.is_active ? 'destructive' : 'default'} disabled={toggleForm.processing}>
                                        {tenant.is_active ? 'Deactivate LGU' : 'Activate LGU'}
                                    </Button>
                                </form>
                            </div>

                            <hr />

                            <div>
                                <h3 className="font-medium text-destructive">Delete LGU Database</h3>
                                <p className="text-sm text-muted-foreground mt-1 mb-2">
                                    Once you delete an LGU, their database and all HR records are permanently removed. This action cannot be undone.
                                </p>
                                <form onSubmit={handleDelete}>
                                    <Button type="submit" variant="destructive" disabled={deleteForm.processing}>
                                        Permanently Delete LGU
                                    </Button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </CentralLayout>
    );
}