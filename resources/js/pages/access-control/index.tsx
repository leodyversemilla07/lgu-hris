import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Shield, Trash2, UserCog, History } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Access Control', href: '/access-control' },
];

type UserRow = {
    id: number;
    name: string;
    email: string;
    roles: string[];
    created_at: string;
};

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
    auditLogs: AuditRow[];
};

const ROLE_COLORS: Record<string, string> = {
    'HR Admin': 'bg-red-100 text-red-800',
    'HR Staff': 'bg-blue-100 text-blue-800',
    'Department Head': 'bg-purple-100 text-purple-800',
    Employee: 'bg-slate-100 text-slate-700',
};

function RoleBadge({ role }: { role: string }) {
    const cls = ROLE_COLORS[role] ?? 'bg-slate-100 text-slate-700';
    return (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
            {role}
        </span>
    );
}

function EditRoleDialog({ user, roles }: { user: UserRow; roles: string[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ role: user.roles[0] ?? '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/access-control/users/${user.id}`, {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm"><UserCog className="size-4" /></Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Change role – {user.name}</DialogTitle>
                    <DialogDescription>{user.email}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Select value={form.data.role} onValueChange={(v) => form.setData('role', v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {roles.map((r) => (
                                    <SelectItem key={r} value={r}>{r}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function CreateUserDialog({ roles }: { roles: string[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ name: '', email: '', role: '', password: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/access-control/users', {
            onSuccess: () => { setOpen(false); form.reset(); },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm"><Plus className="size-4" /> Add user</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new user</DialogTitle>
                    <DialogDescription>Provide credentials and assign a role.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Full name</Label>
                            <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} required />
                            {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} required />
                            {form.errors.email && <p className="text-xs text-destructive">{form.errors.email}</p>}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={form.data.role} onValueChange={(v) => form.setData('role', v)}>
                                <SelectTrigger><SelectValue placeholder="Select role…" /></SelectTrigger>
                                <SelectContent>
                                    {roles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            {form.errors.role && <p className="text-xs text-destructive">{form.errors.role}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label>Password</Label>
                            <Input type="password" value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} required minLength={8} />
                            {form.errors.password && <p className="text-xs text-destructive">{form.errors.password}</p>}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={form.processing}>Create user</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function AccessControlIndex({ users, roles, auditLogs }: Props) {
    function deleteUser(user: UserRow) {
        if (!confirm(`Remove ${user.name}? This cannot be undone.`)) return;
        router.delete(`/access-control/users/${user.id}`);
    }

    const eventColor: Record<string, string> = {
        created: 'text-emerald-700',
        updated: 'text-blue-700',
        deleted: 'text-red-700',
        user_created: 'text-emerald-700',
        user_deleted: 'text-red-700',
        role_changed: 'text-purple-700',
        status_changed: 'text-amber-700',
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Access Control" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                            <Shield className="size-6 text-[#1e3a5f]" /> Access Control
                        </h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Manage user accounts, role assignments, and review the audit trail.
                        </p>
                    </div>
                    <CreateUserDialog roles={roles} />
                </div>

                <Tabs defaultValue="users">
                    <TabsList>
                        <TabsTrigger value="users" className="gap-2">
                            <UserCog className="size-4" /> Users ({users.length})
                        </TabsTrigger>
                        <TabsTrigger value="audit" className="gap-2">
                            <History className="size-4" /> Audit Log
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>System Users</CardTitle>
                                <CardDescription>All registered accounts with their current role assignments.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-20">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user) => (
                                            <TableRow key={user.id}>
                                                <TableCell className="font-medium">{user.name}</TableCell>
                                                <TableCell className="text-slate-600">{user.email}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.roles.length > 0
                                                            ? user.roles.map((r) => <RoleBadge key={r} role={r} />)
                                                            : <span className="text-xs text-slate-400">No role</span>
                                                        }
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">{user.created_at}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <EditRoleDialog user={user} roles={roles} />
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => deleteUser(user)}
                                                            className="text-destructive hover:text-destructive"
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="audit" className="mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Audit Log</CardTitle>
                                <CardDescription>Last 50 system events across all modules.</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Timestamp</TableHead>
                                            <TableHead>User</TableHead>
                                            <TableHead>Event</TableHead>
                                            <TableHead>Record</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>IP</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {auditLogs.map((log) => (
                                            <TableRow key={log.id}>
                                                <TableCell className="whitespace-nowrap text-xs text-slate-500">{log.created_at}</TableCell>
                                                <TableCell className="text-sm">{log.user}</TableCell>
                                                <TableCell>
                                                    <span className={`text-xs font-semibold ${eventColor[log.event] ?? 'text-slate-700'}`}>
                                                        {log.event}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600">
                                                    {log.auditable_type} #{log.auditable_id}
                                                </TableCell>
                                                <TableCell className="text-xs text-slate-600">{log.description ?? '—'}</TableCell>
                                                <TableCell className="text-xs text-slate-400">{log.ip_address ?? '—'}</TableCell>
                                            </TableRow>
                                        ))}
                                        {auditLogs.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-400">
                                                    No audit events recorded yet.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

