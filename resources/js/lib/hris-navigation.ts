import {
    ArrowRightLeft,
    FileArchive,
    FileSpreadsheet,
    LayoutGrid,
    ShieldCheck,
    UserCircle,
    UserRoundSearch,
    WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type HrisModule = {
    title: string;
    href: string;
    description: string;
    icon: LucideIcon;
    status: 'ready' | 'next';
};

export const hrisPrimaryNavigation: HrisModule[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        description: 'Operational overview and launch point for HR workflows.',
        icon: LayoutGrid,
        status: 'ready',
    },
    {
        title: 'Employees',
        href: '/employees',
        description:
            'Prepare digital 201 files, positions, and employment records.',
        icon: UserRoundSearch,
        status: 'next',
    },
    {
        title: 'Documents',
        href: '/documents',
        description:
            'Organize employee files with controlled retrieval and storage.',
        icon: FileArchive,
        status: 'next',
    },
    {
        title: 'Leave',
        href: '/leave',
        description:
            'Stage leave balances, filing, review, and approval flows.',
        icon: WalletCards,
        status: 'next',
    },
    {
        title: 'Movements',
        href: '/personnel-movements',
        description:
            'Track transfers, promotions, reappointments, and separations.',
        icon: ArrowRightLeft,
        status: 'next',
    },
    {
        title: 'Reports',
        href: '/reports',
        description:
            'Prepare compliance exports, ledgers, and dashboard analytics.',
        icon: FileSpreadsheet,
        status: 'next',
    },
    {
        title: 'Access Control',
        href: '/access-control',
        description:
            'Implement roles, permissions, and audit-ready access rules.',
        icon: ShieldCheck,
        status: 'next',
    },
    {
        title: 'My Profile',
        href: '/my-profile',
        description: 'View your personal employment information and leave balances.',
        icon: UserCircle,
        status: 'ready',
    },
];

export const hrisFoundationMetrics = [
    {
        label: 'Phase',
        value: 'Foundation',
        detail: 'Starter kit replaced with a focused HRIS workspace shell.',
    },
    {
        label: 'Priority',
        value: 'MVP first',
        detail: 'Employee records, documents, leave, movements, access, and reports.',
    },
    {
        label: 'Immediate Build',
        value: 'Core modules',
        detail: 'Navigation now points directly to the first delivery stream.',
    },
];

export const hrisDeliverySequence = [
    'Replace the starter experience with an LGU HRIS shell.',
    'Implement roles, permissions, and audit logging foundations.',
    'Build employee references and digital 201 records.',
    'Add documents, leave workflow, personnel movements, and reports.',
];
