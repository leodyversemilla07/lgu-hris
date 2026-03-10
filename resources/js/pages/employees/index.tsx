import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, BriefcaseBusiness, Building2, Upload, Users } from 'lucide-react';
import { useRef, useState } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EmployeeRecord = {
    id: number;
    employee_number: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    department: string;
    position: string;
    employment_type: string;
    employment_status: string;
    hired_at: string | null;
    is_active: boolean;
};

type Props = {
    employees: EmployeeRecord[];
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Employees',
        href: '/employees',
    },
];

export default function EmployeesIndex({ employees }: Props) {
    const activeEmployees = employees.filter(
        (employee) => employee.is_active,
    ).length;
    const departments = new Set(
        employees.map((employee) => employee.department),
    ).size;

    const [importOpen, setImportOpen] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const importForm = useForm<{ file: File | null }>({ file: null });

    function submitImport(e: React.FormEvent) {
        e.preventDefault();
        if (!importForm.data.file) return;
        importForm.post('/import/employees', {
            forceFormData: true,
            onSuccess: () => { setImportOpen(false); },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Employee Information Management
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Employee registry
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Digital 201 records backed by MySQL,
                                    connected to departments, positions,
                                    employment types, and statuses.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild>
                                <Link href="/employees/create">
                                    Add employee
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                            <Dialog open={importOpen} onOpenChange={setImportOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline">
                                        <Upload className="size-4" /> Import
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Import employees</DialogTitle>
                                        <DialogDescription>
                                            Upload an Excel or CSV file. Download the{' '}
                                            <a href="/import/employees/template" className="text-[#1e3a5f] underline">template</a>{' '}
                                            to see the required columns.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={submitImport} className="space-y-4">
                                        <input
                                            ref={fileRef}
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            className="w-full rounded-md border border-input p-2 text-sm"
                                            onChange={(e) => importForm.setData('file', e.target.files?.[0] ?? null)}
                                        />
                                        {importForm.errors.file && (
                                            <p className="text-xs text-destructive">{importForm.errors.file}</p>
                                        )}
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={importForm.processing || !importForm.data.file}>
                                                Upload &amp; import
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Button asChild variant="outline">
                                <Link href="/documents">
                                    Continue to documents
                                    <ArrowRight className="size-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader>
                            <CardDescription>Total records</CardDescription>
                            <CardTitle className="flex items-center gap-3 text-slate-950">
                                <Users className="size-5 text-[#1f4e79]" />
                                {employees.length}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader>
                            <CardDescription>Active employees</CardDescription>
                            <CardTitle className="flex items-center gap-3 text-slate-950">
                                <BriefcaseBusiness className="size-5 text-[#1f4e79]" />
                                {activeEmployees}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader>
                            <CardDescription>
                                Departments represented
                            </CardDescription>
                            <CardTitle className="flex items-center gap-3 text-slate-950">
                                <Building2 className="size-5 text-[#1f4e79]" />
                                {departments}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-950">
                            Employee registry
                        </CardTitle>
                        <CardDescription>
                            Click any employee row to view and manage their
                            full profile.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500">
                                        <th className="px-3 py-3 font-medium">
                                            Employee
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Department
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Position
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Employment
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Start Date
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="px-3 py-3 font-medium">
                                            <span className="sr-only">
                                                Actions
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {employees.map((employee) => (
                                        <tr
                                            key={employee.id}
                                            className="align-top"
                                        >
                                            <td className="px-3 py-4">
                                                <div className="font-medium text-slate-950">
                                                    {employee.full_name}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {employee.employee_number}
                                                </div>
                                                {employee.email && (
                                                    <div className="mt-1 text-xs text-slate-500">
                                                        {employee.email}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-3 py-4 text-slate-600">
                                                {employee.department}
                                            </td>
                                            <td className="px-3 py-4 text-slate-600">
                                                {employee.position}
                                            </td>
                                            <td className="px-3 py-4 text-slate-600">
                                                <div>
                                                    {employee.employment_type}
                                                </div>
                                                <div className="text-xs text-slate-500">
                                                    {employee.employment_status}
                                                </div>
                                            </td>
                                            <td className="px-3 py-4 text-slate-600">
                                                {employee.hired_at ?? '-'}
                                            </td>
                                            <td className="px-3 py-4">
                                                <Badge
                                                    variant={
                                                        employee.is_active
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {employee.is_active
                                                        ? 'Active'
                                                        : 'Archived'}
                                                </Badge>
                                            </td>
                                            <td className="px-3 py-4">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="sm"
                                                >
                                                    <Link
                                                        href={`/employees/${employee.id}`}
                                                    >
                                                        View
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

