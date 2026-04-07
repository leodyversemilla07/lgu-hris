import { Form, Head, Link } from '@inertiajs/react';
import CentralLayout from '@/layouts/central/central-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { centralTenantsStore } from '@/routes/central-tenants-store';
import { centralTenantsIndex } from '@/routes/central-tenants-index';

export default function TenantsCreate() {
    return (
        <CentralLayout breadcrumbs={[
            { title: 'Tenants', href: '/tenants' },
            { title: 'Create LGU', href: '/tenants/create' },
        ]}>
            <Head title="Create LGU Tenant" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Register New LGU</h1>
                    <Button variant="outline" asChild>
                        <Link href={centralTenantsIndex()}>Cancel</Link>
                    </Button>
                </div>

                <div className="rounded-md border bg-card p-6 shadow-sm max-w-2xl">
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
                                    <Label htmlFor="municipality">Municipality / City</Label>
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
                                        <span className="text-muted-foreground">.yourhris.test</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Letters, numbers, and dashes only. No spaces.
                                    </p>
                                    <InputError message={errors.subdomain} />
                                </div>

                                <div className="flex justify-end mt-4">
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Provisioning Database...' : 'Register LGU'}
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