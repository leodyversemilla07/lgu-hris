import { Link, usePage } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import {
    markAllAsRead,
    markAsRead,
} from '@/actions/App/Http/Controllers/NotificationController';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarTrigger } from '@/components/ui/sidebar';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';
import type { SharedNotifications } from '@/types';

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    const { notifications } = usePage<{ notifications: SharedNotifications }>()
        .props;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border/60 bg-background/85 px-6 backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                        <Bell className="size-4" />
                        {notifications.unread_count > 0 ? (
                            <span className="absolute top-2 right-2 size-2 rounded-full bg-destructive" />
                        ) : null}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-104">
                    <DropdownMenuLabel className="flex items-center justify-between gap-3">
                        <span>Notifications</span>
                        <div className="flex items-center gap-2">
                            {notifications.unread_count > 0 ? (
                                <Badge variant="secondary">
                                    {notifications.unread_count} unread
                                </Badge>
                            ) : null}
                            {notifications.unread_count > 0 ? (
                                <Link
                                    href={markAllAsRead.url()}
                                    method="patch"
                                    as="button"
                                    className="text-xs font-medium text-primary"
                                >
                                    Mark all read
                                </Link>
                            ) : null}
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {notifications.recent.length === 0 ? (
                        <div className="px-2 py-6 text-sm text-muted-foreground">
                            No notifications yet.
                        </div>
                    ) : (
                        notifications.recent.map((notification) => (
                            <div key={notification.id}>
                                <div className="space-y-2 px-2 py-2">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="space-y-1">
                                            <p className="text-sm leading-tight font-medium text-foreground">
                                                {notification.title}
                                            </p>
                                            <p className="text-xs leading-relaxed text-muted-foreground">
                                                {notification.message}
                                            </p>
                                        </div>
                                        {notification.read_at === null ? (
                                            <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />
                                        ) : null}
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="text-[11px] tracking-wide text-muted-foreground uppercase">
                                            {notification.category}
                                        </span>
                                        <div className="flex items-center gap-3 text-xs">
                                            {notification.read_at === null ? (
                                                <Link
                                                    href={markAsRead.url(notification.id)}
                                                    method="patch"
                                                    as="button"
                                                    className="font-medium text-primary"
                                                >
                                                    Mark read
                                                </Link>
                                            ) : null}
                                            {notification.action_url ? (
                                                <Link
                                                    href={
                                                        notification.action_url
                                                    }
                                                    className="font-medium text-foreground"
                                                >
                                                    Open
                                                </Link>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                            </div>
                        ))
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}
