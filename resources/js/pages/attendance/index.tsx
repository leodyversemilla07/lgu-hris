import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Clock, Plus } from 'lucide-react';
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

type Summary = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    year: number;
    month: number;
    days_present: number;
    days_absent: number;
    days_leave: number;
    days_holiday: number;
    days_rest_day: number;
    total_late_minutes: number;
    total_undertime_minutes: number;
};

type EmployeeOption = {
    value: string;
    label: string;
    employee_number: string;
};

type Filters = {
    year: number;
    month: number;
    employee_id: string;
};

type Props = {
    summaries: Summary[];
    employees: EmployeeOption[];
    filters: Filters;
};

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
];

function fmt(minutes: number): string {
    if (minutes === 0) return '—';
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function AttendanceIndex({ summaries, employees, filters }: Props) {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    const [year, setYear] = useState(String(filters.year));
    const [month, setMonth] = useState(String(filters.month));
    const [employeeId, setEmployeeId] = useState(filters.employee_id);

    const apply = (y: string, m: string, emp: string) => {
        const params: Record<string, string> = { year: y, month: m };
        if (emp && emp !== 'all') params.employee_id = emp;
        router.get('/attendance', params, { preserveState: true, replace: true });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Attendance
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Monthly attendance
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Monthly summaries of employee attendance,
                                    late arrivals, and undertime.
                                </p>
                            </div>
                        </div>
                        <Button asChild>
                            <Link href="/attendance/log">
                                <Plus className="size-4" />
                                Log attendance
                            </Link>
                        </Button>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-slate-950">
                                    {MONTHS[parseInt(month) - 1]} {year}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {summaries.length} employee
                                    {summaries.length !== 1 ? 's' : ''} with
                                    attendance records
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Select
                                    value={month}
                                    onValueChange={(v) => {
                                        setMonth(v);
                                        apply(year, v, employeeId);
                                    }}
                                >
                                    <SelectTrigger className="w-36">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map((m, i) => (
                                            <SelectItem
                                                key={i + 1}
                                                value={String(i + 1)}
                                            >
                                                {m}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={year}
                                    onValueChange={(v) => {
                                        setYear(v);
                                        apply(v, month, employeeId);
                                    }}
                                >
                                    <SelectTrigger className="w-28">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {years.map((y) => (
                                            <SelectItem
                                                key={y}
                                                value={String(y)}
                                            >
                                                {y}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={employeeId || 'all'}
                                    onValueChange={(v) => {
                                        const val = v === 'all' ? '' : v;
                                        setEmployeeId(val);
                                        apply(year, month, val);
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
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {summaries.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <CalendarDays className="size-10" />
                                <p className="text-sm">
                                    No attendance records for this period.
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/attendance/log">
                                        Log the first attendance
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
                                            <th className="px-3 py-3 text-center">
                                                Present
                                            </th>
                                            <th className="px-3 py-3 text-center">
                                                Absent
                                            </th>
                                            <th className="px-3 py-3 text-center">
                                                Leave
                                            </th>
                                            <th className="px-3 py-3 text-center">
                                                Holiday
                                            </th>
                                            <th className="px-3 py-3 text-center">
                                                Rest
                                            </th>
                                            <th className="px-3 py-3">
                                                <span className="flex items-center gap-1">
                                                    <Clock className="size-3" />
                                                    Late
                                                </span>
                                            </th>
                                            <th className="px-3 py-3">
                                                Undertime
                                            </th>
                                            <th className="px-3 py-3">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {summaries.map((s) => (
                                            <tr key={s.id} className="align-middle">
                                                <td className="px-3 py-3">
                                                    <div className="font-medium text-slate-900">
                                                        {s.employee_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {s.employee_number}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3 text-center text-slate-700">
                                                    {s.days_present}
                                                </td>
                                                <td className="px-3 py-3 text-center">
                                                    <span
                                                        className={
                                                            s.days_absent > 0
                                                                ? 'font-medium text-red-600'
                                                                : 'text-slate-400'
                                                        }
                                                    >
                                                        {s.days_absent}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-center text-slate-700">
                                                    {s.days_leave}
                                                </td>
                                                <td className="px-3 py-3 text-center text-slate-700">
                                                    {s.days_holiday}
                                                </td>
                                                <td className="px-3 py-3 text-center text-slate-400">
                                                    {s.days_rest_day}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <span
                                                        className={
                                                            s.total_late_minutes > 0
                                                                ? 'text-amber-600'
                                                                : 'text-slate-400'
                                                        }
                                                    >
                                                        {fmt(s.total_late_minutes)}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-slate-500">
                                                    {fmt(s.total_undertime_minutes)}
                                                </td>
                                                <td className="px-3 py-3">
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/attendance/log?employee_id=${s.employee_id}&date=${s.year}-${String(s.month).padStart(2, '0')}-01`}
                                                        >
                                                            Log
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
