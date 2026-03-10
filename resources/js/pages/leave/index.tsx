import { Head, Link, router } from '@inertiajs/react';
import { CalendarDays, Clock, FileText, Plus } from 'lucide-react';
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

type LeaveRequestRecord = {
    id: number;
    employee_id: number;
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
    submitted_at: string;
};

type EmployeeOption = { value: string; label: string };
type LeaveTypeOption = { value: string; label: string };

type Props = {
    leaveRequests: LeaveRequestRecord[];
    employees: EmployeeOption[];
    leaveTypes: LeaveTypeOption[];
    canApprove: boolean;
    filters: { status?: string; leave_type_id?: string; employee_id?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave', href: '/leave' },
];

const statusConfig: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-slate-100 text-slate-600',
    },
};

export default function LeaveIndex({
    leaveRequests,
    employees,
    leaveTypes,
    canApprove,
    filters,
}: Props) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? '');
    const [typeFilter, setTypeFilter] = useState(filters.leave_type_id ?? '');
    const [employeeFilter, setEmployeeFilter] = useState(
        filters.employee_id ?? '',
    );

    const applyFilters = (
        status: string,
        typeId: string,
        employeeId: string,
    ) => {
        const params: Record<string, string> = {};
        if (status && status !== 'all') params.status = status;
        if (typeId && typeId !== 'all') params.leave_type_id = typeId;
        if (employeeId && employeeId !== 'all') params.employee_id = employeeId;
        router.get('/leave', params, { preserveState: true, replace: true });
    };

    const handleStatusChange = (v: string) => {
        setStatusFilter(v);
        applyFilters(v, typeFilter, employeeFilter);
    };
    const handleTypeChange = (v: string) => {
        setTypeFilter(v);
        applyFilters(statusFilter, v, employeeFilter);
    };
    const handleEmployeeChange = (v: string) => {
        setEmployeeFilter(v);
        applyFilters(statusFilter, typeFilter, v);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Leave Management
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Leave requests
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    {canApprove
                                        ? 'Review, approve, or reject employee leave requests.'
                                        : 'View your leave history and file new requests.'}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild>
                                <Link href="/leave/create">
                                    <Plus className="size-4" />
                                    File leave
                                </Link>
                            </Button>
                            {canApprove && (
                                <Button asChild variant="outline">
                                    <Link href="/leave-balances">
                                        <CalendarDays className="size-4" />
                                        Leave balances
                                    </Link>
                                </Button>
                            )}
                        </div>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-slate-950">
                                    {canApprove
                                        ? 'All requests'
                                        : 'My requests'}
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {leaveRequests.length} request
                                    {leaveRequests.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Select
                                    value={statusFilter}
                                    onValueChange={handleStatusChange}
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue placeholder="All statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>
                                        <SelectItem value="submitted">
                                            Pending
                                        </SelectItem>
                                        <SelectItem value="approved">
                                            Approved
                                        </SelectItem>
                                        <SelectItem value="rejected">
                                            Rejected
                                        </SelectItem>
                                        <SelectItem value="cancelled">
                                            Cancelled
                                        </SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select
                                    value={typeFilter}
                                    onValueChange={handleTypeChange}
                                >
                                    <SelectTrigger className="w-48">
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

                                {canApprove && (
                                    <Select
                                        value={employeeFilter}
                                        onValueChange={handleEmployeeChange}
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
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {leaveRequests.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <FileText className="size-10" />
                                <p className="text-sm">
                                    No leave requests found.
                                </p>
                                <Button asChild variant="outline" size="sm">
                                    <Link href="/leave/create">
                                        File your first leave request
                                    </Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead>
                                        <tr className="text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                                            {canApprove && (
                                                <th className="px-3 py-3">
                                                    Employee
                                                </th>
                                            )}
                                            <th className="px-3 py-3">
                                                Type
                                            </th>
                                            <th className="px-3 py-3">
                                                Dates
                                            </th>
                                            <th className="px-3 py-3">
                                                Days
                                            </th>
                                            <th className="px-3 py-3">
                                                Status
                                            </th>
                                            <th className="px-3 py-3">
                                                Filed
                                            </th>
                                            <th className="px-3 py-3">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {leaveRequests.map((lr) => {
                                            const st =
                                                statusConfig[lr.status] ??
                                                statusConfig.submitted;
                                            return (
                                                <tr
                                                    key={lr.id}
                                                    className="align-middle"
                                                >
                                                    {canApprove && (
                                                        <td className="px-3 py-3 font-medium text-slate-900">
                                                            {lr.employee_name}
                                                        </td>
                                                    )}
                                                    <td className="px-3 py-3 text-slate-700">
                                                        {lr.leave_type}
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-700">
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="size-3 text-slate-400" />
                                                            {lr.start_date}
                                                            {lr.start_date !==
                                                                lr.end_date &&
                                                                ` – ${lr.end_date}`}
                                                        </div>
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-700">
                                                        {lr.days_requested}d
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <span
                                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}
                                                        >
                                                            {st.label}
                                                        </span>
                                                    </td>
                                                    <td className="px-3 py-3 text-slate-500">
                                                        {lr.submitted_at}
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <Link
                                                                href={`/leave/${lr.id}`}
                                                            >
                                                                View
                                                            </Link>
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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

