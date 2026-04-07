import { PropsWithChildren, ReactNode } from 'react';
import AppContent from '@/components/app-content';
import AppShell from '@/components/app-shell';
import { CentralSidebar } from '@/components/central-sidebar';
import type { BreadcrumbItem } from '@/types';

interface CentralLayoutProps {
    breadcrumbs?: BreadcrumbItem[];
    children: ReactNode;
}

export default function CentralLayout({
    breadcrumbs,
    children,
}: PropsWithChildren<CentralLayoutProps>) {
    return (
        <AppShell sidebar={<CentralSidebar />}>
            <AppContent breadcrumbs={breadcrumbs}>{children}</AppContent>
        </AppShell>
    );
}