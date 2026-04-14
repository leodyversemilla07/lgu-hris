import { PropsWithChildren, ReactNode } from 'react';
import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
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
        <AppShell variant="sidebar">
            <CentralSidebar />
            <AppContent variant="sidebar" className="overflow-x-hidden">
                <AppSidebarHeader breadcrumbs={breadcrumbs ?? []} />
                {children}
            </AppContent>
        </AppShell>
    );
}