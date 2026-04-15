import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import CentralLayout from '@/layouts/central/central-layout';
import {
    index as centralTenantsIndex,
    store as centralTenantsStore,
} from '@/actions/App/Http/Controllers/Central/TenantController';

export default function TenantsCreate() {
    return (
        <CentralLayout
            breadcrumbs={[
                { title: 'Tenants', href: '/tenants' },
                { title: 'Create LGU', href: '/tenants/create' },
            ]}
        >
            <Head title="Create LGU Tenant" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Register New LGU</h1>
                    <Button variant="outline" asChild>
                        <Link href={centralTenantsIndex()}>Cancel</Link>
                    </Button>
                </div>

                <div className="max-w-2xl rounded-md border bg-card p-6 shadow-sm">
                    <Form {...centralTenantsStore.form()} className="space-y-6">
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">LGU Name</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        placeholder="e.g. Municipality of Gloria"
                                        required
                                        autoFocus
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
                                        placeholder="e.g. Gloria"
                                        required
                                    />
                                    <InputError message={errors.municipality} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="province">Province</Label>
                                    <Input
                                        id="province"
                                        name="province"
                                        placeholder="e.g. Oriental Mindoro"
                                        required
                                    />
                                    <InputError message={errors.province} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="subdomain">Subdomain</Label>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            id="subdomain"
                                            name="subdomain"
                                            placeholder="e.g. gloria"
                                            required
                                            className="w-1/2"
                                        />
                                        <span className="text-muted-foreground">
                                            .yourhris.test
                                        </span>
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        Letters, numbers, and dashes only. No
                                        spaces.
                                    </p>
                                    <InputError message={errors.subdomain} />
                                </div>

                                <div className="mt-4 flex justify-end">
                                    <Button type="submit" disabled={processing}>
                                        {processing
                                            ? 'Provisioning Database...'
                                            : 'Register LGU'}
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
