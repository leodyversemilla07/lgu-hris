import { Head, router, useForm } from '@inertiajs/react';
import {
    Briefcase,
    Building2,
    CalendarDays,
    ClipboardList,
    Database,
    FileText,
    Pencil,
    Plus,
    PowerOff,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reference Data', href: '/reference-data' },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type Department = {
    id: number;
    code: string | null;
    name: string;
    is_active: boolean;
};

type Position = {
    id: number;
    code: string | null;
    name: string;
    department_id: number;
    department_name: string;
    is_active: boolean;
};

type EmploymentType = {
    id: number;
    code: string | null;
    name: string;
    is_active: boolean;
};

type EmploymentStatus = {
    id: number;
    code: string | null;
    name: string;
    is_active: boolean;
};

type LeaveType = {
    id: number;
    code: string | null;
    name: string;
    max_days_per_year: number;
    requires_approval: boolean;
    is_active: boolean;
};

type DocumentType = {
    id: number;
    code: string | null;
    name: string;
    is_confidential: boolean;
    is_active: boolean;
};

type SimpleRecord = { id: number; code: string | null; name: string; is_active: boolean };

type DeptOption = { value: string; label: string };

type Props = {
    departments: Department[];
    positions: Position[];
    employmentTypes: EmploymentType[];
    employmentStatuses: EmploymentStatus[];
    leaveTypes: LeaveType[];
    documentTypes: DocumentType[];
};

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
    return active ? (
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Active</Badge>
    ) : (
        <Badge variant="secondary">Inactive</Badge>
    );
}

function FormError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

function deactivate(type: string, id: number, name: string) {
    if (!confirm(`Deactivate "${name}"? It will no longer appear in active lists.`)) return;
    router.delete(`/reference-data/${id}`, { data: { type } });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function AddDepartmentDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({ type: 'department', name: '', code: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/reference-data', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-1 size-4" /> Add
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Department</DialogTitle>
                    <DialogDescription>Create a new department record.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                placeholder="e.g. FIN"
                            />
                            <FormError message={form.errors.code} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditDepartmentDialog({ dept }: { dept: Department }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type: 'department',
        name: dept.name,
        code: dept.code ?? '',
        is_active: dept.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/reference-data/${dept.id}`, {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Department</DialogTitle>
                    <DialogDescription>{dept.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                            <FormError message={form.errors.code} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`dept-active-${dept.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) => form.setData('is_active', !!v)}
                        />
                        <Label htmlFor={`dept-active-${dept.id}`}>Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DepartmentsTab({ departments }: { departments: Department[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>Organizational units for grouping employees and positions.</CardDescription>
                </div>
                <AddDepartmentDialog />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {departments.map((dept) => (
                            <TableRow key={dept.id} className={!dept.is_active ? 'opacity-60' : ''}>
                                <TableCell className="font-mono text-xs text-slate-500">{dept.code ?? '—'}</TableCell>
                                <TableCell className="font-medium">{dept.name}</TableCell>
                                <TableCell>
                                    <ActiveBadge active={dept.is_active} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <EditDepartmentDialog dept={dept} />
                                        {dept.is_active && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deactivate('department', dept.id, dept.name)}
                                                className="text-slate-400 hover:text-destructive"
                                                title="Deactivate"
                                            >
                                                <PowerOff className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {departments.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-400">
                                    No departments yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// POSITIONS
// ═══════════════════════════════════════════════════════════════════════════════

function AddPositionDialog({ deptOptions }: { deptOptions: DeptOption[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ type: 'position', name: '', code: '', department_id: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/reference-data', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-1 size-4" /> Add
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Position</DialogTitle>
                    <DialogDescription>Create a new position tied to a department.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>
                            Department <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.data.department_id}
                            onValueChange={(v) => form.setData('department_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select department…" />
                            </SelectTrigger>
                            <SelectContent>
                                {deptOptions.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormError message={form.errors.department_id} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPositionDialog({ position, deptOptions }: { position: Position; deptOptions: DeptOption[] }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type: 'position',
        name: position.name,
        code: position.code ?? '',
        department_id: String(position.department_id),
        is_active: position.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/reference-data/${position.id}`, {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Position</DialogTitle>
                    <DialogDescription>{position.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>
                            Department <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.data.department_id}
                            onValueChange={(v) => form.setData('department_id', v)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {deptOptions.map((d) => (
                                    <SelectItem key={d.value} value={d.value}>
                                        {d.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormError message={form.errors.department_id} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`pos-active-${position.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) => form.setData('is_active', !!v)}
                        />
                        <Label htmlFor={`pos-active-${position.id}`}>Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PositionsTab({ positions, departments }: { positions: Position[]; departments: Department[] }) {
    const activeDeptOptions: DeptOption[] = departments
        .filter((d) => d.is_active)
        .map((d) => ({ value: String(d.id), label: d.name }));

    const allDeptOptions: DeptOption[] = departments.map((d) => ({ value: String(d.id), label: d.name }));

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Positions</CardTitle>
                    <CardDescription>Job positions linked to departments.</CardDescription>
                </div>
                <AddPositionDialog deptOptions={activeDeptOptions} />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Department</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.map((pos) => (
                            <TableRow key={pos.id} className={!pos.is_active ? 'opacity-60' : ''}>
                                <TableCell className="font-mono text-xs text-slate-500">{pos.code ?? '—'}</TableCell>
                                <TableCell className="font-medium">{pos.name}</TableCell>
                                <TableCell className="text-sm text-slate-600">{pos.department_name}</TableCell>
                                <TableCell>
                                    <ActiveBadge active={pos.is_active} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <EditPositionDialog position={pos} deptOptions={allDeptOptions} />
                                        {pos.is_active && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deactivate('position', pos.id, pos.name)}
                                                className="text-slate-400 hover:text-destructive"
                                                title="Deactivate"
                                            >
                                                <PowerOff className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {positions.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-400">
                                    No positions yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMPLE NAME + CODE reference types (Employment Types, Employment Statuses)
// ═══════════════════════════════════════════════════════════════════════════════

function AddSimpleDialog({
    type,
    dialogTitle,
    dialogDescription,
}: {
    type: string;
    dialogTitle: string;
    dialogDescription: string;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({ type, name: '', code: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/reference-data', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-1 size-4" /> Add
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{dialogDescription}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditSimpleDialog({
    type,
    record,
    dialogTitle,
}: {
    type: string;
    record: SimpleRecord;
    dialogTitle: string;
}) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type,
        name: record.name,
        code: record.code ?? '',
        is_active: record.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/reference-data/${record.id}`, {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{dialogTitle}</DialogTitle>
                    <DialogDescription>{record.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`simple-active-${type}-${record.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) => form.setData('is_active', !!v)}
                        />
                        <Label htmlFor={`simple-active-${type}-${record.id}`}>Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function SimpleRefTab({
    type,
    cardTitle,
    cardDescription,
    singularTitle,
    records,
}: {
    type: string;
    cardTitle: string;
    cardDescription: string;
    singularTitle: string;
    records: SimpleRecord[];
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>{cardTitle}</CardTitle>
                    <CardDescription>{cardDescription}</CardDescription>
                </div>
                <AddSimpleDialog
                    type={type}
                    dialogTitle={`Add ${singularTitle}`}
                    dialogDescription={`Create a new ${singularTitle.toLowerCase()}.`}
                />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.map((rec) => (
                            <TableRow key={rec.id} className={!rec.is_active ? 'opacity-60' : ''}>
                                <TableCell className="font-mono text-xs text-slate-500">{rec.code ?? '—'}</TableCell>
                                <TableCell className="font-medium">{rec.name}</TableCell>
                                <TableCell>
                                    <ActiveBadge active={rec.is_active} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <EditSimpleDialog
                                            type={type}
                                            record={rec}
                                            dialogTitle={`Edit ${singularTitle}`}
                                        />
                                        {rec.is_active && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deactivate(type, rec.id, rec.name)}
                                                className="text-slate-400 hover:text-destructive"
                                                title="Deactivate"
                                            >
                                                <PowerOff className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {records.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="py-8 text-center text-sm text-slate-400">
                                    No records yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEAVE TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function AddLeaveTypeDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type: 'leave_type',
        name: '',
        code: '',
        max_days_per_year: 0,
        requires_approval: true,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/reference-data', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-1 size-4" /> Add
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Leave Type</DialogTitle>
                    <DialogDescription>Define a new leave category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                                placeholder="e.g. VL"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Max Days per Year <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.max_days_per_year}
                            onChange={(e) => form.setData('max_days_per_year', parseInt(e.target.value) || 0)}
                        />
                        <FormError message={form.errors.max_days_per_year} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="add-lt-approval"
                            checked={form.data.requires_approval}
                            onCheckedChange={(v) => form.setData('requires_approval', !!v)}
                        />
                        <Label htmlFor="add-lt-approval">Requires Approval</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditLeaveTypeDialog({ lt }: { lt: LeaveType }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type: 'leave_type',
        name: lt.name,
        code: lt.code ?? '',
        max_days_per_year: lt.max_days_per_year,
        requires_approval: lt.requires_approval,
        is_active: lt.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/reference-data/${lt.id}`, {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Leave Type</DialogTitle>
                    <DialogDescription>{lt.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Max Days per Year</Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.max_days_per_year}
                            onChange={(e) => form.setData('max_days_per_year', parseInt(e.target.value) || 0)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`lt-approval-${lt.id}`}
                            checked={form.data.requires_approval}
                            onCheckedChange={(v) => form.setData('requires_approval', !!v)}
                        />
                        <Label htmlFor={`lt-approval-${lt.id}`}>Requires Approval</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`lt-active-${lt.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) => form.setData('is_active', !!v)}
                        />
                        <Label htmlFor={`lt-active-${lt.id}`}>Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function LeaveTypesTab({ leaveTypes }: { leaveTypes: LeaveType[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Leave Types</CardTitle>
                    <CardDescription>Categories of leave with maximum day allowances.</CardDescription>
                </div>
                <AddLeaveTypeDialog />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Max Days/Yr</TableHead>
                            <TableHead>Approval</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leaveTypes.map((lt) => (
                            <TableRow key={lt.id} className={!lt.is_active ? 'opacity-60' : ''}>
                                <TableCell className="font-mono text-xs text-slate-500">{lt.code ?? '—'}</TableCell>
                                <TableCell className="font-medium">{lt.name}</TableCell>
                                <TableCell className="text-sm">{lt.max_days_per_year}</TableCell>
                                <TableCell>
                                    {lt.requires_approval ? (
                                        <Badge variant="outline" className="text-xs">
                                            Required
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400">Not required</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <ActiveBadge active={lt.is_active} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <EditLeaveTypeDialog lt={lt} />
                                        {lt.is_active && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deactivate('leave_type', lt.id, lt.name)}
                                                className="text-slate-400 hover:text-destructive"
                                                title="Deactivate"
                                            >
                                                <PowerOff className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {leaveTypes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-400">
                                    No leave types yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT TYPES
// ═══════════════════════════════════════════════════════════════════════════════

function AddDocumentTypeDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type: 'document_type',
        name: '',
        code: '',
        is_confidential: false,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post('/reference-data', {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <Plus className="mr-1 size-4" /> Add
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Document Type</DialogTitle>
                    <DialogDescription>Define a new HR document category.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="add-dt-confidential"
                            checked={form.data.is_confidential}
                            onCheckedChange={(v) => form.setData('is_confidential', !!v)}
                        />
                        <Label htmlFor="add-dt-confidential">Confidential</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditDocumentTypeDialog({ dt }: { dt: DocumentType }) {
    const [open, setOpen] = useState(false);
    const form = useForm({
        type: 'document_type',
        name: dt.name,
        code: dt.code ?? '',
        is_confidential: dt.is_confidential,
        is_active: dt.is_active,
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.put(`/reference-data/${dt.id}`, {
            onSuccess: () => setOpen(false),
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Document Type</DialogTitle>
                    <DialogDescription>{dt.name}</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) => form.setData('name', e.target.value)}
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) => form.setData('code', e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`dt-confidential-${dt.id}`}
                            checked={form.data.is_confidential}
                            onCheckedChange={(v) => form.setData('is_confidential', !!v)}
                        />
                        <Label htmlFor={`dt-confidential-${dt.id}`}>Confidential</Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`dt-active-${dt.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) => form.setData('is_active', !!v)}
                        />
                        <Label htmlFor={`dt-active-${dt.id}`}>Active</Label>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DocumentTypesTab({ documentTypes }: { documentTypes: DocumentType[] }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Document Types</CardTitle>
                    <CardDescription>Categories used to classify HR documents.</CardDescription>
                </div>
                <AddDocumentTypeDialog />
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Confidential</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {documentTypes.map((dt) => (
                            <TableRow key={dt.id} className={!dt.is_active ? 'opacity-60' : ''}>
                                <TableCell className="font-mono text-xs text-slate-500">{dt.code ?? '—'}</TableCell>
                                <TableCell className="font-medium">{dt.name}</TableCell>
                                <TableCell>
                                    {dt.is_confidential ? (
                                        <Badge variant="outline" className="border-amber-300 text-xs text-amber-700">
                                            Confidential
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-slate-400">Public</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <ActiveBadge active={dt.is_active} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <EditDocumentTypeDialog dt={dt} />
                                        {dt.is_active && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deactivate('document_type', dt.id, dt.name)}
                                                className="text-slate-400 hover:text-destructive"
                                                title="Deactivate"
                                            >
                                                <PowerOff className="size-4" />
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {documentTypes.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="py-8 text-center text-sm text-slate-400">
                                    No document types yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════

export default function ReferenceDataIndex({
    departments,
    positions,
    employmentTypes,
    employmentStatuses,
    leaveTypes,
    documentTypes,
}: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reference Data" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
                        <Database className="size-6 text-[#1e3a5f]" /> Reference Data
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage lookup tables used across the HRIS — departments, positions, leave types, and more.
                    </p>
                </div>

                <Tabs defaultValue="departments">
                    <TabsList className="flex-wrap h-auto gap-1">
                        <TabsTrigger value="departments" className="gap-1.5">
                            <Building2 className="size-4" /> Departments ({departments.length})
                        </TabsTrigger>
                        <TabsTrigger value="positions" className="gap-1.5">
                            <Briefcase className="size-4" /> Positions ({positions.length})
                        </TabsTrigger>
                        <TabsTrigger value="employment-types" className="gap-1.5">
                            <UserCheck className="size-4" /> Employment Types ({employmentTypes.length})
                        </TabsTrigger>
                        <TabsTrigger value="employment-statuses" className="gap-1.5">
                            <ClipboardList className="size-4" /> Employment Statuses ({employmentStatuses.length})
                        </TabsTrigger>
                        <TabsTrigger value="leave-types" className="gap-1.5">
                            <CalendarDays className="size-4" /> Leave Types ({leaveTypes.length})
                        </TabsTrigger>
                        <TabsTrigger value="document-types" className="gap-1.5">
                            <FileText className="size-4" /> Document Types ({documentTypes.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="departments" className="mt-4">
                        <DepartmentsTab departments={departments} />
                    </TabsContent>

                    <TabsContent value="positions" className="mt-4">
                        <PositionsTab positions={positions} departments={departments} />
                    </TabsContent>

                    <TabsContent value="employment-types" className="mt-4">
                        <SimpleRefTab
                            type="employment_type"
                            cardTitle="Employment Types"
                            cardDescription="Categories of employment arrangement (Regular, Casual, Contract of Service, etc.)."
                            singularTitle="Employment Type"
                            records={employmentTypes}
                        />
                    </TabsContent>

                    <TabsContent value="employment-statuses" className="mt-4">
                        <SimpleRefTab
                            type="employment_status"
                            cardTitle="Employment Statuses"
                            cardDescription="Current employment standing (Active, On Leave, Separated, Retired, etc.)."
                            singularTitle="Employment Status"
                            records={employmentStatuses}
                        />
                    </TabsContent>

                    <TabsContent value="leave-types" className="mt-4">
                        <LeaveTypesTab leaveTypes={leaveTypes} />
                    </TabsContent>

                    <TabsContent value="document-types" className="mt-4">
                        <DocumentTypesTab documentTypes={documentTypes} />
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}
