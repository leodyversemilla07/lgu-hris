import type { Auth, SharedNotifications } from '@/types/auth';

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            notifications: SharedNotifications;
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
