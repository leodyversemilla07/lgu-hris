import { Link, usePage } from '@inertiajs/react';
import {
    ArrowRightLeft,
    CalendarDays,
    Database,
    FileArchive,
    FileSpreadsheet,
    LayoutGrid,
    ShieldCheck,
    UserRoundSearch,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { Auth, NavItem } from '@/types';

type SidebarModule = {
    title: string;
    href: string;
    icon: LucideIcon;
    visibleForAnyRole?: string[];
    visibleForAnyPermission?: string[];
};

const sidebarModules: SidebarModule[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Employees',
        href: '/employees',
        icon: UserRoundSearch,
        visibleForAnyPermission: ['employees.view', 'employees.manage'],
    },
    {
        title: 'Documents',
        href: '/documents',
        icon: FileArchive,
        visibleForAnyPermission: ['documents.view', 'documents.manage'],
    },
    {
        title: 'Leave',
        href: '/leave',
        icon: WalletCards,
        visibleForAnyPermission: ['leave.file', 'leave.approve'],
    },
    {
        title: 'Movements',
        href: '/personnel-movements',
        icon: ArrowRightLeft,
        visibleForAnyPermission: ['movements.view', 'movements.manage'],
    },
    {
        title: 'Attendance',
        href: '/attendance',
        icon: CalendarDays,
        visibleForAnyPermission: ['attendance.view', 'attendance.manage'],
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: FileSpreadsheet,
        visibleForAnyPermission: ['reports.view', 'reports.export'],
    },
    {
        title: 'Access Control',
        href: '/access-control',
        icon: ShieldCheck,
        visibleForAnyPermission: ['access-control.manage'],
    },
    {
        title: 'Reference Data',
        href: '/reference-data',
        icon: Database,
        visibleForAnyPermission: ['reference-data.manage'],
    },
];

function filterSidebarModules(
    modules: SidebarModule[],
    roles: string[],
    permissions: string[],
): SidebarModule[] {
    return modules.filter((module) => {
        const matchesRole =
            !module.visibleForAnyRole ||
            module.visibleForAnyRole.some((role) => roles.includes(role));
        const matchesPermission =
            !module.visibleForAnyPermission ||
            module.visibleForAnyPermission.some((permission) =>
                permissions.includes(permission),
            );

        return matchesRole && matchesPermission;
    });
}

export function AppSidebar() {
    const { auth } = usePage<{ auth: Auth }>().props;
    const mainNavItems: NavItem[] = filterSidebarModules(
        sidebarModules,
        auth.user.roles,
        auth.user.permissions,
    ).map(({ title, href, icon }) => ({
        title,
        href,
        icon,
    }));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboardIndex()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
