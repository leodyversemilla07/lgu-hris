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
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    index as referenceDataIndex,
    destroy as destroyReferenceData,
    store as storeReferenceData,
    update as updateReferenceData,
} from '@/actions/App/Http/Controllers/ReferenceDataController';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex.url() },
    { title: 'Reference Data', href: referenceDataIndex.url() },
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

type SimpleRecord = {
    id: number;
    code: string | null;
    name: string;
    is_active: boolean;
};

type DeptOption = { value: string; label: string };

type Props = {
    departments: Department[];
    positions: Position[];
    employmentTypes: EmploymentType[];
    employmentStatuses: EmploymentStatus[];
    leaveTypes: LeaveType[];
    documentTypes: DocumentType[];
};

const numberFormatter = new Intl.NumberFormat();

// ─── Shared helpers ───────────────────────────────────────────────────────────

function ActiveBadge({ active }: { active: boolean }) {
    return active ? (
        <Badge>Active</Badge>
    ) : (
        <Badge variant="secondary">Inactive</Badge>
    );
}

function FormError({ message }: { message?: string }) {
    if (!message) return null;
    return <p className="text-xs text-destructive">{message}</p>;
}

function deactivate(type: string, id: number, name: string) {
    if (
        !confirm(
            `Deactivate "${name}"? It will no longer appear in active lists.`,
        )
    )
        return;
    router.delete(destroyReferenceData(id), { data: { type } });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEPARTMENTS
// ═══════════════════════════════════════════════════════════════════════════════

function AddDepartmentDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm({ type: 'department', name: '', code: '' });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(storeReferenceData.url(), {
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
                    <DialogDescription>
                        Create a new department record.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                                placeholder="e.g. FIN"
                            />
                            <FormError message={form.errors.code} />
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
        form.put(updateReferenceData.url(dept.id), {
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                            <FormError message={form.errors.code} />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`dept-active-${dept.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) =>
                                form.setData('is_active', !!v)
                            }
                        />
                        <Label htmlFor={`dept-active-${dept.id}`}>Active</Label>
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
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <CardTitle>Departments</CardTitle>
                    <CardDescription>
                        Organizational units for grouping employees and
                        positions.
                    </CardDescription>
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
                            <TableRow
                                key={dept.id}
                                className={!dept.is_active ? 'opacity-60' : ''}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {dept.code ?? '—'}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {dept.name}
                                </TableCell>
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
                                                onClick={() =>
                                                    deactivate(
                                                        'department',
                                                        dept.id,
                                                        dept.name,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-destructive"
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
                                <TableCell
                                    colSpan={4}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
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
    const form = useForm({
        type: 'position',
        name: '',
        code: '',
        department_id: '',
    });

    function submit(e: React.FormEvent) {
        e.preventDefault();
        form.post(storeReferenceData.url(), {
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
                    <DialogDescription>
                        Create a new position tied to a department.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-2">
                        <Label>
                            Department{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.data.department_id}
                            onValueChange={(v) =>
                                form.setData('department_id', v)
                            }
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
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
                            Create
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditPositionDialog({
    position,
    deptOptions,
}: {
    position: Position;
    deptOptions: DeptOption[];
}) {
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
        form.put(updateReferenceData.url(position.id), {
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
                            Department{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Select
                            value={form.data.department_id}
                            onValueChange={(v) =>
                                form.setData('department_id', v)
                            }
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`pos-active-${position.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) =>
                                form.setData('is_active', !!v)
                            }
                        />
                        <Label htmlFor={`pos-active-${position.id}`}>
                            Active
                        </Label>
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
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PositionsTab({
    positions,
    departments,
}: {
    positions: Position[];
    departments: Department[];
}) {
    const activeDeptOptions: DeptOption[] = departments
        .filter((d) => d.is_active)
        .map((d) => ({ value: String(d.id), label: d.name }));

    const allDeptOptions: DeptOption[] = departments.map((d) => ({
        value: String(d.id),
        label: d.name,
    }));

    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <CardTitle>Positions</CardTitle>
                    <CardDescription>
                        Job positions linked to departments.
                    </CardDescription>
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
                            <TableRow
                                key={pos.id}
                                className={!pos.is_active ? 'opacity-60' : ''}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {pos.code ?? '—'}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {pos.name}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {pos.department_name}
                                </TableCell>
                                <TableCell>
                                    <ActiveBadge active={pos.is_active} />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        <EditPositionDialog
                                            position={pos}
                                            deptOptions={allDeptOptions}
                                        />
                                        {pos.is_active && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() =>
                                                    deactivate(
                                                        'position',
                                                        pos.id,
                                                        pos.name,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-destructive"
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
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
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
        form.post(storeReferenceData.url(), {
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
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
        form.put(updateReferenceData.url(record.id), {
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`simple-active-${type}-${record.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) =>
                                form.setData('is_active', !!v)
                            }
                        />
                        <Label htmlFor={`simple-active-${type}-${record.id}`}>
                            Active
                        </Label>
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
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                            <TableRow
                                key={rec.id}
                                className={!rec.is_active ? 'opacity-60' : ''}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {rec.code ?? '—'}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {rec.name}
                                </TableCell>
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
                                                onClick={() =>
                                                    deactivate(
                                                        type,
                                                        rec.id,
                                                        rec.name,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-destructive"
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
                                <TableCell
                                    colSpan={4}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
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
        form.post(storeReferenceData.url(), {
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
                    <DialogDescription>
                        Define a new leave category.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                                placeholder="e.g. VL"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>
                            Max Days per Year{' '}
                            <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.max_days_per_year}
                            onChange={(e) =>
                                form.setData(
                                    'max_days_per_year',
                                    parseInt(e.target.value) || 0,
                                )
                            }
                        />
                        <FormError message={form.errors.max_days_per_year} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="add-lt-approval"
                            checked={form.data.requires_approval}
                            onCheckedChange={(v) =>
                                form.setData('requires_approval', !!v)
                            }
                        />
                        <Label htmlFor="add-lt-approval">
                            Requires Approval
                        </Label>
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
        form.put(updateReferenceData.url(lt.id), {
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Max Days per Year</Label>
                        <Input
                            type="number"
                            min={0}
                            value={form.data.max_days_per_year}
                            onChange={(e) =>
                                form.setData(
                                    'max_days_per_year',
                                    parseInt(e.target.value) || 0,
                                )
                            }
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`lt-approval-${lt.id}`}
                            checked={form.data.requires_approval}
                            onCheckedChange={(v) =>
                                form.setData('requires_approval', !!v)
                            }
                        />
                        <Label htmlFor={`lt-approval-${lt.id}`}>
                            Requires Approval
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`lt-active-${lt.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) =>
                                form.setData('is_active', !!v)
                            }
                        />
                        <Label htmlFor={`lt-active-${lt.id}`}>Active</Label>
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
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <CardTitle>Leave Types</CardTitle>
                    <CardDescription>
                        Categories of leave with maximum day allowances.
                    </CardDescription>
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
                            <TableRow
                                key={lt.id}
                                className={!lt.is_active ? 'opacity-60' : ''}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {lt.code ?? '—'}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {lt.name}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {lt.max_days_per_year}
                                </TableCell>
                                <TableCell>
                                    {lt.requires_approval ? (
                                        <Badge
                                            variant="outline"
                                            className="text-xs"
                                        >
                                            Required
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Not required
                                        </span>
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
                                                onClick={() =>
                                                    deactivate(
                                                        'leave_type',
                                                        lt.id,
                                                        lt.name,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-destructive"
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
                                <TableCell
                                    colSpan={6}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
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
        form.post(storeReferenceData.url(), {
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
                    <DialogDescription>
                        Define a new HR document category.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2 space-y-2">
                            <Label>
                                Name <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={form.data.name}
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="add-dt-confidential"
                            checked={form.data.is_confidential}
                            onCheckedChange={(v) =>
                                form.setData('is_confidential', !!v)
                            }
                        />
                        <Label htmlFor="add-dt-confidential">
                            Confidential
                        </Label>
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
        form.put(updateReferenceData.url(dt.id), {
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
                                onChange={(e) =>
                                    form.setData('name', e.target.value)
                                }
                                required
                            />
                            <FormError message={form.errors.name} />
                        </div>
                        <div className="space-y-2">
                            <Label>Code</Label>
                            <Input
                                value={form.data.code}
                                onChange={(e) =>
                                    form.setData('code', e.target.value)
                                }
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`dt-confidential-${dt.id}`}
                            checked={form.data.is_confidential}
                            onCheckedChange={(v) =>
                                form.setData('is_confidential', !!v)
                            }
                        />
                        <Label htmlFor={`dt-confidential-${dt.id}`}>
                            Confidential
                        </Label>
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id={`dt-active-${dt.id}`}
                            checked={form.data.is_active}
                            onCheckedChange={(v) =>
                                form.setData('is_active', !!v)
                            }
                        />
                        <Label htmlFor={`dt-active-${dt.id}`}>Active</Label>
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
                            Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function DocumentTypesTab({
    documentTypes,
}: {
    documentTypes: DocumentType[];
}) {
    return (
        <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                    <CardTitle>Document Types</CardTitle>
                    <CardDescription>
                        Categories used to classify HR documents.
                    </CardDescription>
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
                            <TableRow
                                key={dt.id}
                                className={!dt.is_active ? 'opacity-60' : ''}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    {dt.code ?? '—'}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {dt.name}
                                </TableCell>
                                <TableCell>
                                    {dt.is_confidential ? (
                                        <Badge
                                            variant="outline"
                                            className="border-amber-300 text-xs text-amber-700"
                                        >
                                            Confidential
                                        </Badge>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">
                                            Public
                                        </span>
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
                                                onClick={() =>
                                                    deactivate(
                                                        'document_type',
                                                        dt.id,
                                                        dt.name,
                                                    )
                                                }
                                                className="text-muted-foreground hover:text-destructive"
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
                                <TableCell
                                    colSpan={5}
                                    className="py-8 text-center text-sm text-muted-foreground"
                                >
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
    const catalogCount = 6;
    const totalRecords =
        departments.length +
        positions.length +
        employmentTypes.length +
        employmentStatuses.length +
        leaveTypes.length +
        documentTypes.length;
    const activeRecords = [
        ...departments,
        ...positions,
        ...employmentTypes,
        ...employmentStatuses,
        ...leaveTypes,
        ...documentTypes,
    ].filter((record) => record.is_active).length;
    const summaryCards = [
        {
            title: 'Reference catalogs',
            value: numberFormatter.format(catalogCount),
            detail: 'Departments, positions, employment, leave, and document registries',
            hint: 'Catalogs',
            icon: Database,
        },
        {
            title: 'Total records',
            value: numberFormatter.format(totalRecords),
            detail: `${numberFormatter.format(activeRecords)} active and ${numberFormatter.format(totalRecords - activeRecords)} inactive records`,
            hint: 'Coverage',
            icon: Building2,
        },
        {
            title: 'Positions',
            value: numberFormatter.format(positions.length),
            detail: `${numberFormatter.format(departments.length)} departments with assignment definitions`,
            hint: 'Workforce',
            icon: Briefcase,
        },
        {
            title: 'Policy references',
            value: numberFormatter.format(
                leaveTypes.length + documentTypes.length,
            ),
            detail: `${numberFormatter.format(leaveTypes.length)} leave types and ${numberFormatter.format(documentTypes.length)} document types`,
            hint: 'Rules',
            icon: FileText,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reference Data" />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex max-w-3xl flex-col gap-2">
                                <Badge variant="outline" className="w-fit">
                                    Configuration
                                </Badge>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Reference data
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Maintain the lookup tables that power the
                                    rest of the HRIS, from departments and
                                    positions to leave and document definitions.
                                </p>
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
                            <Tabs defaultValue="departments">
                                <Card>
                                    <CardHeader className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <CardTitle>
                                                Reference workspace
                                            </CardTitle>
                                            <CardDescription>
                                                Review and update each catalog
                                                from one consistent admin
                                                workspace.
                                            </CardDescription>
                                        </div>
                                        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 rounded-lg bg-muted/50 p-1">
                                            <TabsTrigger
                                                value="departments"
                                                className="gap-1.5"
                                            >
                                                <Building2 />
                                                Departments (
                                                {departments.length})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="positions"
                                                className="gap-1.5"
                                            >
                                                <Briefcase />
                                                Positions ({positions.length})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="employment-types"
                                                className="gap-1.5"
                                            >
                                                <UserCheck />
                                                Employment Types (
                                                {employmentTypes.length})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="employment-statuses"
                                                className="gap-1.5"
                                            >
                                                <ClipboardList />
                                                Employment Statuses (
                                                {employmentStatuses.length})
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="leave-types"
                                                className="gap-1.5"
                                            >
                                                <CalendarDays />
                                                Leave Types ({leaveTypes.length}
                                                )
                                            </TabsTrigger>
                                            <TabsTrigger
                                                value="document-types"
                                                className="gap-1.5"
                                            >
                                                <FileText />
                                                Document Types (
                                                {documentTypes.length})
                                            </TabsTrigger>
                                        </TabsList>
                                    </CardHeader>
                                    <CardContent>
                                        <TabsContent
                                            value="departments"
                                            className="mt-0"
                                        >
                                            <DepartmentsTab
                                                departments={departments}
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="positions"
                                            className="mt-0"
                                        >
                                            <PositionsTab
                                                positions={positions}
                                                departments={departments}
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="employment-types"
                                            className="mt-0"
                                        >
                                            <SimpleRefTab
                                                type="employment_type"
                                                cardTitle="Employment Types"
                                                cardDescription="Categories of employment arrangement (Regular, Casual, Contract of Service, etc.)."
                                                singularTitle="Employment Type"
                                                records={employmentTypes}
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="employment-statuses"
                                            className="mt-0"
                                        >
                                            <SimpleRefTab
                                                type="employment_status"
                                                cardTitle="Employment Statuses"
                                                cardDescription="Current employment standing (Active, On Leave, Separated, Retired, etc.)."
                                                singularTitle="Employment Status"
                                                records={employmentStatuses}
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="leave-types"
                                            className="mt-0"
                                        >
                                            <LeaveTypesTab
                                                leaveTypes={leaveTypes}
                                            />
                                        </TabsContent>

                                        <TabsContent
                                            value="document-types"
                                            className="mt-0"
                                        >
                                            <DocumentTypesTab
                                                documentTypes={documentTypes}
                                            />
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
