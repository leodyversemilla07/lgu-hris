import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type BalanceRow = {
    employee_id: string;
    employee_name: string;
    employee_number: string;
    leave_type_id: string;
    leave_type: string;
    max_days_per_year: number | null;
    total_days: number;
    used_days: number;
    remaining_days: number;
    balance_id: number | null;
};

type LeaveTypeOption = { value: string; label: string };

type Props = {
    rows: BalanceRow[];
    year: number;
    leaveTypes: LeaveTypeOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave', href: '/leave' },
    { title: 'Leave balances', href: '/leave-balances' },
];

export default function LeaveBalances({ rows, year, leaveTypes }: Props) {
    const [typeFilter, setTypeFilter] = useState('');

    const filtered =
        typeFilter && typeFilter !== 'all'
            ? rows.filter((r) => r.leave_type_id === typeFilter)
            : rows;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Balances" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Leave Management
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Leave balances — {year}
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Set and track leave day allocations for
                                    each employee and leave type.
                                </p>
                            </div>
                        </div>
                        <Button asChild variant="outline">
                            <a href="/leave">
                                <ArrowLeft className="size-4" />
                                Back to requests
                            </a>
                        </Button>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-slate-950">
                                    Balance registry
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Edit the total days column to set an
                                    employee's allocation.
                                </CardDescription>
                            </div>
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="All leave types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">
                                        All types
                                    </SelectItem>
                                    {leaveTypes.map((t) => (
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
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead>
                                    <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                        <th className="px-3 py-3">Employee</th>
                                        <th className="px-3 py-3">
                                            Leave type
                                        </th>
                                        <th className="px-3 py-3">
                                            Total days
                                        </th>
                                        <th className="px-3 py-3">Used</th>
                                        <th className="px-3 py-3">
                                            Remaining
                                        </th>
                                        <th className="px-3 py-3">
                                            <span className="sr-only">
                                                Save
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filtered.map((row) => (
                                        <BalanceEditRow
                                            key={`${row.employee_id}_${row.leave_type_id}`}
                                            row={row}
                                            year={year}
                                        />
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

function BalanceEditRow({ row, year }: { row: BalanceRow; year: number }) {
    const form = useForm({
        employee_id: row.employee_id,
        leave_type_id: row.leave_type_id,
        year: String(year),
        total_days: String(row.total_days),
    });

    const handleSave = () => {
        form.post('/leave-balances/upsert', {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const remaining = Number(form.data.total_days) - row.used_days;

    return (
        <tr className="align-middle">
            <td className="px-3 py-2">
                <div className="font-medium text-slate-900">
                    {row.employee_name}
                </div>
                <div className="text-xs text-slate-500">
                    {row.employee_number}
                </div>
            </td>
            <td className="px-3 py-2 text-slate-700">{row.leave_type}</td>
            <td className="px-3 py-2">
                <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={form.data.total_days}
                    onChange={(e) =>
                        form.setData('total_days', e.target.value)
                    }
                    className="w-24"
                />
            </td>
            <td className="px-3 py-2 text-slate-600">{row.used_days}</td>
            <td className="px-3 py-2">
                <span
                    className={
                        remaining < 0
                            ? 'font-medium text-red-600'
                            : 'text-slate-700'
                    }
                >
                    {remaining.toFixed(1)}
                </span>
            </td>
            <td className="px-3 py-2">
                <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={form.processing}
                >
                    <Save className="size-3.5" />
                    Save
                </Button>
            </td>
        </tr>
    );
}
