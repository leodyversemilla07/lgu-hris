import { Head } from '@inertiajs/react';
import CentralLayout from '@/layouts/central/central-layout';

export default function CentralWelcome() {
    return (
        <CentralLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Central Admin Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4 md:p-6">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-border/50 bg-sidebar/50 rounded-xl border p-4 text-center">
                        <h2 className="text-2xl font-bold">Welcome!</h2>
                        <p className="text-muted-foreground mt-2">Manage your LGUs from the Tenants menu.</p>
                    </div>
                </div>
            </div>
        </CentralLayout>
    );
}