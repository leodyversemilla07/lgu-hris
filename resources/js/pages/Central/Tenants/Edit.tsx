import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CentralLayout from '@/layouts/central/central-layout';
import {
    show as centralTenantsShow,
    update as centralTenantsUpdate,
} from '@/actions/App/Http/Controllers/Central/TenantController';

type Tenant = {
    id: string;
    name: string;
    municipality: string;
    province: string;
    is_active: boolean;
    subdomain: string;
};

type Props = {
    tenant: Tenant;
};

export default function TenantsEdit({ tenant }: Props) {
    return (
        <CentralLayout
            breadcrumbs={[
                { title: 'Tenants', href: '/tenants' },
                { title: tenant.name, href: `/tenants/${tenant.id}` },
                { title: 'Edit', href: `/tenants/${tenant.id}/edit` },
            ]}
        >
            <Head title={`Edit: ${tenant.name}`} />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit LGU Information</h1>
                    <Button variant="outline" asChild>
                        <Link href={centralTenantsShow({ tenant: tenant.id })}>
                            Cancel
                        </Link>
                    </Button>
                </div>

                <div className="max-w-2xl rounded-md border bg-card p-6 shadow-sm">
                    <Form
                        {...centralTenantsUpdate.form({ tenant: tenant.id })}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">LGU Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={tenant.name}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="municipality">
                                        Municipality / City
                                    </Label>
                                    <Input
                                        id="municipality"
                                        name="municipality"
                                        defaultValue={tenant.municipality}
                                        required
                                    />
                                    <InputError message={errors.municipality} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        name="province"
                                        defaultValue={tenant.province}
                                        required
                                    />
                                    <InputError message={errors.province} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="subdomain">
                                        Subdomain (Read-only)
                                    </Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="subdomain"
                                            name="subdomain"
                                            defaultValue={tenant.subdomain}
                                            disabled
                                            className="w-1/2 bg-muted"
                                        />
                                        <span className="text-muted-foreground">
                                            .yourhris.test
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Subdomains cannot be changed after an
                                        LGU is registered.
                                    </p>
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Saving...'
                                            : 'Save Changes'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </Form>
                </div>
            </div>
        </CentralLayout>
    );
}
