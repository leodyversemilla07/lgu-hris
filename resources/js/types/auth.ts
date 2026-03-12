export type User = {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    roles: string[];
    permissions: string[];
    primary_role?: string | null;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type AppNotification = {
    id: string;
    title: string;
    message: string;
    action_url: string | null;
    category: string;
    status: string | null;
    read_at: string | null;
    recorded_at: string;
};

export type SharedNotifications = {
    unread_count: number;
    recent: AppNotification[];
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
