import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    History,
    Plus,
    Search,
    Shield,
    Trash2,
    UserCog,
    Users,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import type { FormEvent } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import { index as referenceDataIndex } from '@/actions/App/Http/Controllers/ReferenceDataController';
import {
    index as accessControlIndex,
    destroy as destroyUser,
    store as storeUser,
    update as updateUser,
} from '@/actions/App/Http/Controllers/UserController';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex.url() },
    { title: 'Access Control', href: accessControlIndex.url() },
];

type UserRow = {
    id: number;
    uuid: string;
    name: string;
    email: string;
    roles: string[];
    managed_department_id: string | null;
    created_at: string;
};

type DeptOption = { value: string; label: string };

type AuditRow = {
    id: number;
    user: string;
    event: string;
    auditable_type: string;
    auditable_id: number;
    description: string | null;
    ip_address: string | null;
    created_at: string;
};

type Props = {
    users: UserRow[];
    roles: string[];
    departments: DeptOption[];
    auditLogs: AuditRow[];
};

const numberFormatter = new Intl.NumberFormat();

function roleBadgeVariant(
    role: string,
): 'default' | 'secondary' | 'outline' | 'destructive' {
    if (role === 'HR Admin') {
        return 'destructive';
    }

    if (role === 'HR Staff') {
        return 'default';
    }

    if (role === 'Department Head') {
        return 'secondary';
    }

    return 'outline';
}

function RoleBadge({ role }: { role: string }) {
    return <Badge variant={roleBadgeVariant(role)}>{role}</Badge>;
}

function EditRoleDialog({
    user,
    roles,
    departments,
}: {
    user: UserRow;
    roles: string[];
    departments: DeptOption[];
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        role: user.roles[0] ?? '',
        managed_department_id: user.managed_department_id ?? '',
    });
    const isDepartmentHead = form.data.role === 'Department Head';

    function submit(event: FormEvent): void {
        event.preventDefault();

        form.submit(updateUser(user.uuid), {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <UserCog data-icon="inline-start" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update access role</DialogTitle>
                    <DialogDescription>
                        {user.name} · {user.email}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Label htmlFor={`role-${user.id}`}>Role</Label>
                        <Select
                            value={form.data.role}
                            onValueChange={(value) =>
                                form.setData('role', value)
                            }
                        >
                            <SelectTrigger
                                id={`role-${user.id}`}
                                className="w-full"
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    {roles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {role}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {form.errors.role && (
                            <p className="text-xs text-destructive">
                                {form.errors.role}
                            </p>
                        )}
                    </div>

                    {isDepartmentHead && (
                        <div className="flex flex-col gap-2">
                            <Label htmlFor={`department-${user.id}`}>
                                Managed department
                            </Label>
                            <Select
                                value={form.data.managed_department_id || '0'}
                                onValueChange={(value) =>
                                    form.setData(
                                        'managed_department_id',
                                        value === '0' ? '' : value,
                                    )
                                }
                            >
                                <SelectTrigger
                                    id={`department-${user.id}`}
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="0">
                                            No department
                                        </SelectItem>
                                        {departments.map((department) => (
                                            <SelectItem
                                                key={department.value}
                                                value={department.value}
                                            >
                                                {department.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.errors.managed_department_id && (
                                <p className="text-xs text-destructive">
                                    {form.errors.managed_department_id}
                                </p>
                            )}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateUserDialog({ roles }: { roles: string[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        name: '',
        email: '',
        role: '',
        password: '',
    });

    function submit(event: FormEvent): void {
        event.preventDefault();

        form.submit(storeUser(), {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus data-icon="inline-start" />
                    Add user
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create user account</DialogTitle>
                    <DialogDescription>
                        Create a new system user and assign the initial role.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="create-user-name">Full name</Label>
                            <Input
                                id="create-user-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                            />
                            {form.errors.name && (
                                <p className="text-xs text-destructive">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="create-user-email">Email</Label>
                            <Input
                                id="create-user-email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                required
                            />
                            {form.errors.email && (
                                <p className="text-xs text-destructive">
                                    {form.errors.email}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="create-user-role">Role</Label>
                            <Select
                                value={form.data.role}
                                onValueChange={(value) =>
                                    form.setData('role', value)
                                }
                            >
                                <SelectTrigger
                                    id="create-user-role"
                                    className="w-full"
                                >
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {roles.map((role) => (
                                            <SelectItem key={role} value={role}>
                                                {role}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.errors.role && (
                                <p className="text-xs text-destructive">
                                    {form.errors.role}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="create-user-password">
                                Password
                            </Label>
                            <Input
                                id="create-user-password"
                                type="password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                required
                                minLength={8}
                            />
                            {form.errors.password && (
                                <p className="text-xs text-destructive">
                                    {form.errors.password}
                                </p>
                            )}
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create user
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DeleteUserDialog({ user }: { user: UserRow }) {
    function handleDelete(): void {
        router.delete(destroyUser(user.uuid));
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                >
                    <Trash2 data-icon="inline-start" />
                    Delete
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete user account?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Remove {user.name} from access control. This action
                        cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Keep user</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={handleDelete}
                    >
                        Delete user
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

export default function AccessControlIndex({
    users,
    roles,
    departments,
    auditLogs,
}: Props) {
    const [userQuery, setUserQuery] = useState('');
    const [auditQuery, setAuditQuery] = useState('');
    const deferredUserQuery = useDeferredValue(userQuery);
    const deferredAuditQuery = useDeferredValue(auditQuery);

    const normalizedUserQuery = deferredUserQuery.trim().toLowerCase();
    const normalizedAuditQuery = deferredAuditQuery.trim().toLowerCase();

    const filteredUsers = users.filter((user) => {
        if (!normalizedUserQuery) {
            return true;
        }

        return [user.name, user.email, ...user.roles]
            .join(' ')
            .toLowerCase()
            .includes(normalizedUserQuery);
    });

    const filteredAuditLogs = auditLogs.filter((log) => {
        if (!normalizedAuditQuery) {
            return true;
        }

        return [
            log.user,
            log.event,
            log.auditable_type,
            log.description,
            log.ip_address,
            log.created_at,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(normalizedAuditQuery);
    });

    const departmentHeads = users.filter((user) =>
        user.roles.includes('Department Head'),
    ).length;
    const admins = users.filter((user) =>
        user.roles.includes('HR Admin'),
    ).length;

    const summaryCards = [
        {
            title: 'System users',
            value: numberFormatter.format(users.length),
            detail: `${numberFormatter.format(filteredUsers.length)} in the current view`,
            hint: 'Accounts',
            icon: Users,
        },
        {
            title: 'Administrators',
            value: numberFormatter.format(admins),
            detail: `${numberFormatter.format(roles.length)} available roles`,
            hint: 'Security',
            icon: Shield,
        },
        {
            title: 'Department heads',
            value: numberFormatter.format(departmentHeads),
            detail: `${numberFormatter.format(departments.length)} active departments available`,
            hint: 'Approvers',
            icon: UserCog,
        },
        {
            title: 'Audit records',
            value: numberFormatter.format(auditLogs.length),
            detail: `${numberFormatter.format(filteredAuditLogs.length)} matching current search`,
            hint: 'History',
            icon: History,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Control" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Security
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Access control
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Manage user accounts, role assignments,
                                        and the latest security-relevant audit
                                        activity from one consistent workspace.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <CreateUserDialog roles={roles} />
                                    <Button asChild variant="outline">
                                        <Link href={referenceDataIndex()}>
                                            Review reference data
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
                            {summaryCards.map((item) => (
                                <Card
                                    key={item.title}
                                    className="@container/card shadow-xs"
                                >
                                    <CardHeader>
                                        <CardDescription>
                                            {item.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                            {item.value}
                                        </CardTitle>
                                        <CardAction>
                                            <Badge variant="outline">
                                                <item.icon />
                                                {item.hint}
                                            </Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                        <div className="flex items-center gap-2 font-medium">
                                            <item.icon className="size-4" />
                                            Snapshot
                                        </div>
                                        <div className="text-muted-foreground">
                                            {item.detail}
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="px-4 lg:px-6">
                            <Tabs defaultValue="users">
                                <Card>
                                    <CardHeader>
                                        <div className="flex flex-col gap-1">
                                            <CardTitle>
                                                Access workspace
                                            </CardTitle>
                                            <CardDescription>
                                                Review accounts or inspect
                                                recent audit events with the
                                                same streamlined layout as the
                                                rest of the system.
                                            </CardDescription>
                                        </div>
                                        <CardAction>
                                            <TabsList>
                                                <TabsTrigger value="users">
                                                    Users
                                                </TabsTrigger>
                                                <TabsTrigger value="audit">
                                                    Audit log
                                                </TabsTrigger>
                                            </TabsList>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        <TabsContent
                                            value="users"
                                            className="mt-0 flex flex-col gap-4"
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative w-full lg:max-w-sm">
                                                    <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={userQuery}
                                                        onChange={(event) =>
                                                            setUserQuery(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Search users, emails, or roles"
                                                        aria-label="Search users"
                                                        className="pl-9"
                                                    />
                                                </div>
                                                <Badge variant="secondary">
                                                    {numberFormatter.format(
                                                        filteredUsers.length,
                                                    )}{' '}
                                                    of{' '}
                                                    {numberFormatter.format(
                                                        users.length,
                                                    )}{' '}
                                                    shown
                                                </Badge>
                                            </div>

                                            {filteredUsers.length > 0 ? (
                                                <div className="overflow-hidden rounded-lg border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>
                                                                    Name
                                                                </TableHead>
                                                                <TableHead>
                                                                    Email
                                                                </TableHead>
                                                                <TableHead>
                                                                    Roles
                                                                </TableHead>
                                                                <TableHead>
                                                                    Created
                                                                </TableHead>
                                                                <TableHead className="text-right">
                                                                    Actions
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredUsers.map(
                                                                (user) => (
                                                                    <TableRow
                                                                        key={
                                                                            user.id
                                                                        }
                                                                    >
                                                                        <TableCell className="font-medium">
                                                                            {
                                                                                user.name
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-muted-foreground">
                                                                            {
                                                                                user.email
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {user
                                                                                    .roles
                                                                                    .length >
                                                                                0 ? (
                                                                                    user.roles.map(
                                                                                        (
                                                                                            role,
                                                                                        ) => (
                                                                                            <RoleBadge
                                                                                                key={
                                                                                                    role
                                                                                                }
                                                                                                role={
                                                                                                    role
                                                                                                }
                                                                                            />
                                                                                        ),
                                                                                    )
                                                                                ) : (
                                                                                    <span className="text-sm text-muted-foreground">
                                                                                        No
                                                                                        role
                                                                                    </span>
                                                                                )}
                                                                            </div>
                                                                        </TableCell>
                                                                        <TableCell className="text-muted-foreground">
                                                                            {
                                                                                user.created_at
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="text-right">
                                                                            <div className="flex items-center justify-end gap-2">
                                                                                <EditRoleDialog
                                                                                    user={
                                                                                        user
                                                                                    }
                                                                                    roles={
                                                                                        roles
                                                                                    }
                                                                                    departments={
                                                                                        departments
                                                                                    }
                                                                                />
                                                                                <DeleteUserDialog
                                                                                    user={
                                                                                        user
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <Empty className="min-h-70 border-border bg-muted/20">
                                                    <EmptyHeader>
                                                        <EmptyMedia variant="icon">
                                                            <Users />
                                                        </EmptyMedia>
                                                        <EmptyTitle>
                                                            No matching users
                                                        </EmptyTitle>
                                                        <EmptyDescription>
                                                            Adjust the search to
                                                            bring accounts back
                                                            into view.
                                                        </EmptyDescription>
                                                    </EmptyHeader>
                                                    <EmptyContent>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setUserQuery('')
                                                            }
                                                        >
                                                            Reset search
                                                        </Button>
                                                    </EmptyContent>
                                                </Empty>
                                            )}
                                        </TabsContent>

                                        <TabsContent
                                            value="audit"
                                            className="mt-0 flex flex-col gap-4"
                                        >
                                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                                <div className="relative w-full lg:max-w-sm">
                                                    <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                                                    <Input
                                                        value={auditQuery}
                                                        onChange={(event) =>
                                                            setAuditQuery(
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        placeholder="Search users, events, descriptions, or IP"
                                                        aria-label="Search audit log"
                                                        className="pl-9"
                                                    />
                                                </div>
                                                <Badge variant="secondary">
                                                    {numberFormatter.format(
                                                        filteredAuditLogs.length,
                                                    )}{' '}
                                                    of{' '}
                                                    {numberFormatter.format(
                                                        auditLogs.length,
                                                    )}{' '}
                                                    shown
                                                </Badge>
                                            </div>

                                            {filteredAuditLogs.length > 0 ? (
                                                <div className="overflow-hidden rounded-lg border">
                                                    <Table>
                                                        <TableHeader>
                                                            <TableRow>
                                                                <TableHead>
                                                                    Timestamp
                                                                </TableHead>
                                                                <TableHead>
                                                                    User
                                                                </TableHead>
                                                                <TableHead>
                                                                    Event
                                                                </TableHead>
                                                                <TableHead>
                                                                    Record
                                                                </TableHead>
                                                                <TableHead>
                                                                    Description
                                                                </TableHead>
                                                                <TableHead>
                                                                    IP
                                                                </TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {filteredAuditLogs.map(
                                                                (log) => (
                                                                    <TableRow
                                                                        key={
                                                                            log.id
                                                                        }
                                                                    >
                                                                        <TableCell className="whitespace-nowrap text-muted-foreground">
                                                                            {
                                                                                log.created_at
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="font-medium">
                                                                            {
                                                                                log.user
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="outline">
                                                                                {
                                                                                    log.event
                                                                                }
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-muted-foreground">
                                                                            {
                                                                                log.auditable_type
                                                                            }
                                                                            {
                                                                                ' #'
                                                                            }
                                                                            {
                                                                                log.auditable_id
                                                                            }
                                                                        </TableCell>
                                                                        <TableCell className="max-w-md text-sm text-muted-foreground">
                                                                            {log.description ??
                                                                                'No description recorded'}
                                                                        </TableCell>
                                                                        <TableCell className="text-muted-foreground">
                                                                            {log.ip_address ??
                                                                                'Unavailable'}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ),
                                                            )}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            ) : (
                                                <Empty className="min-h-70 border-border bg-muted/20">
                                                    <EmptyHeader>
                                                        <EmptyMedia variant="icon">
                                                            <History />
                                                        </EmptyMedia>
                                                        <EmptyTitle>
                                                            No matching audit
                                                            records
                                                        </EmptyTitle>
                                                        <EmptyDescription>
                                                            Adjust the search to
                                                            bring security
                                                            events back into
                                                            view.
                                                        </EmptyDescription>
                                                    </EmptyHeader>
                                                    <EmptyContent>
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() =>
                                                                setAuditQuery(
                                                                    '',
                                                                )
                                                            }
                                                        >
                                                            Reset search
                                                        </Button>
                                                    </EmptyContent>
                                                </Empty>
                                            )}
                                        </TabsContent>
                                    </CardContent>
                                </Card>
                            </Tabs>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
