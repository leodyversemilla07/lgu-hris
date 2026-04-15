import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import CentralLayout from '@/layouts/central/central-layout';
import {
    create as centralTenantsCreate,
    show as centralTenantsShow,
} from '@/actions/App/Http/Controllers/Central/TenantController';

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
    tenants: Tenant[];
};

export default function TenantsIndex({ tenants }: Props) {
    return (
        <CentralLayout breadcrumbs={[{ title: 'Tenants', href: '/tenants' }]}>
            <Head title="Manage Tenants" />

            <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">LGUs (Tenants)</h1>
                    <Button asChild>
                        <Link href={centralTenantsCreate()}>Create LGU</Link>
                    </Button>
                </div>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Domain</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tenants.map((tenant) => (
                                <TableRow key={tenant.id}>
                                    <TableCell className="font-medium">
                                        {tenant.name}
                                    </TableCell>
                                    <TableCell>
                                        <a
                                            href={`http://${tenant.domain}:8000`}
                                            target="_blank"
                                            className="text-blue-600 hover:underline"
                                        >
                                            {tenant.domain}
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        {tenant.municipality}, {tenant.province}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={
                                                tenant.is_active
                                                    ? 'default'
                                                    : 'destructive'
                                            }
                                        >
                                            {tenant.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            asChild
                                        >
                                            <Link
                                                href={centralTenantsShow({
                                                    tenant: tenant.id,
                                                })}
                                            >
                                                View
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {tenants.length === 0 && (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="py-6 text-center text-muted-foreground"
                                    >
                                        No LGUs registered yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </CentralLayout>
    );
}
