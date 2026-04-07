import { Link, usePage } from '@inertiajs/react';
import {
    LayoutGrid,
    Building2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { CentralNavUser } from '@/components/central-nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';
import { centralHome } from '@/routes/central-home';
import { centralTenantsIndex } from '@/routes/central-tenants-index';

type SidebarModule = {
    title: string;
    href: string;
    icon: LucideIcon;
};

const sidebarModules: SidebarModule[] = [
    {
        title: 'Dashboard',
        href: centralHome.url(),
        icon: LayoutGrid,
    },
    {
        title: 'Tenants (LGUs)',
        href: centralTenantsIndex.url(),
        icon: Building2,
    },
];

export function CentralSidebar() {
    const mainNavItems: NavItem[] = sidebarModules.map(({ title, href, icon }) => ({
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
                            <Link href={centralHome()} prefetch>
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
                <CentralNavUser />
            </SidebarFooter>
        </Sidebar>
    );
}