import { Head, Link, router } from '@inertiajs/react';
import { ArrowRightLeft, Clock, Plus } from 'lucide-react';
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type MovementRecord = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    movement_type: string;
    effective_date: string;
    order_number: string | null;
};

type SelectOption = { value: string; label: string };

type Props = {
    movements: MovementRecord[];
    employees: SelectOption[];
    movementTypes: SelectOption[];
    filters: { employee_id?: string; movement_type_id?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Personnel Movements', href: '/personnel-movements' },
];

export default function PersonnelMovementsIndex({
    movements,
    employees,
    movementTypes,
    filters,
}: Props) {
    const [employeeFilter, setEmployeeFilter] = useState(
        filters.employee_id ?? '',
    );
    const [typeFilter, setTypeFilter] = useState(
        filters.movement_type_id ?? '',
    );

    const applyFilters = (empId: string, typeId: string) => {
        const params: Record<string, string> = {};
        if (empId && empId !== 'all') params.employee_id = empId;
        if (typeId && typeId !== 'all') params.movement_type_id = typeId;
        router.get('/personnel-movements', params, {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnel Movements" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Personnel Movements
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Movement registry
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Complete history of promotions, transfers,
                                    separations, and status changes.
                                </p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/personnel-movements/create">
                                <Plus className="size-4" />
                                Record movement
                            </Link>
                        </Button>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-slate-950">
                                    All movements
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {movements.length} record
                                    {movements.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Select
                                    value={employeeFilter}
                                    onValueChange={(v) => {
                                        setEmployeeFilter(v);
                                        applyFilters(v, typeFilter);
                                    }}
                                >
                                    <SelectTrigger className="w-52">
                                        <SelectValue placeholder="All employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All employees
                                        </SelectItem>
                                        {employees.map((e) => (
                                            <SelectItem
                                                key={e.value}
                                                value={e.value}
                                            >
                                                {e.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={typeFilter}
                                    onValueChange={(v) => {
                                        setTypeFilter(v);
                                        applyFilters(employeeFilter, v);
                                    }}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All types
                                        </SelectItem>
                                        {movementTypes.map((t) => (
                                            <SelectItem
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {movements.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <ArrowRightLeft className="size-10" />
                                <p className="text-sm">
                                    No movements recorded yet.
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/personnel-movements/create">
                                        Record the first movement
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead>
                                        <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            <th className="px-3 py-3">
                                                Employee
                                            </th>
                                            <th className="px-3 py-3">
                                                Movement type
                                            </th>
                                            <th className="px-3 py-3">
                                                Effective date
                                            </th>
                                            <th className="px-3 py-3">
                                                Order no.
                                            </th>
                                            <th className="px-3 py-3">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {movements.map((m) => (
                                            <tr
                                                key={m.id}
                                                className="align-middle"
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="font-medium text-slate-900">
                                                        {m.employee_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {m.employee_number}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-slate-700">
                                                    {m.movement_type}
                                                </td>
                                                <td className="px-3 py-3 text-slate-700">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="size-3 text-slate-400" />
                                                        {m.effective_date}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-slate-500">
                                                    {m.order_number ?? (
                                                        <span className="italic text-slate-300">
                                                            —
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/personnel-movements/${m.id}`}
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
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

