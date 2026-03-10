import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { useEffect } from 'react';
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
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EmployeeOption = {
    value: string;
    label: string;
    employee_number: string;
};

type LeaveTypeOption = {
    value: string;
    label: string;
    max_days_per_year: number | null;
    requires_approval: boolean;
};

type BalanceMap = Record<
    string,
    Record<string, { total_days: number; used_days: number; remaining_days: number }>
>;

type Props = {
    employees: EmployeeOption[];
    leaveTypes: LeaveTypeOption[];
    balances: BalanceMap;
    year: number;
    preselectedEmployeeId: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave', href: '/leave' },
    { title: 'File leave request', href: '/leave/create' },
];

export default function LeaveCreate({
    employees,
    leaveTypes,
    balances,
    year,
    preselectedEmployeeId,
}: Props) {
    const form = useForm({
        employee_id: preselectedEmployeeId,
        leave_type_id: '',
        start_date: '',
        end_date: '',
        days_requested: '',
        reason: '',
    });

    const selectedType = leaveTypes.find(
        (t) => t.value === form.data.leave_type_id,
    );

    const balance =
        form.data.employee_id && form.data.leave_type_id
            ? balances[form.data.employee_id]?.[form.data.leave_type_id] ?? null
            : null;

    useEffect(() => {
        if (form.data.start_date && form.data.end_date) {
            const start = new Date(form.data.start_date);
            const end = new Date(form.data.end_date);
            if (end >= start) {
                const diffMs = end.getTime() - start.getTime();
                const diffDays =
                    Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
                form.setData('days_requested', String(diffDays));
            }
        }
    }, [form.data.start_date, form.data.end_date]);

    const handleSubmit = () => {
        form.post('/leave');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="File Leave Request" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Leave Management
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    File leave request
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Submit a leave request for{' '}
                                    {year}. Check available balances before
                                    filing.
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
                        <CardTitle className="text-slate-950">
                            Request details
                        </CardTitle>
                        <CardDescription>
                            Fill in the leave details. Days will be
                            auto-calculated from the selected date range.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-5 sm:grid-cols-2">
                            {/* Employee */}
                            <div className="space-y-1.5">
                                <Label>
                                    Employee{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={form.data.employee_id}
                                    onValueChange={(v) => {
                                        form.setData('employee_id', v);
                                        form.setData('leave_type_id', '');
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                <InputError
                                    message={form.errors.employee_id}
                                />
                            </div>

                            {/* Leave type */}
                            <div className="space-y-1.5">
                                <Label>
                                    Leave type{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={form.data.leave_type_id}
                                    onValueChange={(v) =>
                                        form.setData('leave_type_id', v)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
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
                                <InputError
                                    message={form.errors.leave_type_id}
                                />
                            </div>

                            {/* Balance display */}
                            {balance && (
                                <div className="sm:col-span-2">
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm">
                                        <CalendarDays className="size-4 text-[#1f4e79]" />
                                        <span className="font-medium text-slate-900">
                                            Balance ({year}):
                                        </span>
                                        <span className="text-slate-600">
                                            {balance.remaining_days} of{' '}
                                            {balance.total_days} days
                                            remaining
                                        </span>
                                        {selectedType?.max_days_per_year && (
                                            <span className="ml-auto text-xs text-slate-400">
                                                Max{' '}
                                                {selectedType.max_days_per_year}{' '}
                                                days/year
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Start date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="start_date">
                                    Start date{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="start_date"
                                    type="date"
                                    value={form.data.start_date}
                                    onChange={(e) =>
                                        form.setData(
                                            'start_date',
                                            e.target.value,
                                        )
                                    }
                                />
                                <InputError
                                    message={form.errors.start_date}
                                />
                            </div>

                            {/* End date */}
                            <div className="space-y-1.5">
                                <Label htmlFor="end_date">
                                    End date{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="end_date"
                                    type="date"
                                    value={form.data.end_date}
                                    min={form.data.start_date}
                                    onChange={(e) =>
                                        form.setData('end_date', e.target.value)
                                    }
                                />
                                <InputError message={form.errors.end_date} />
                            </div>

                            {/* Days requested */}
                            <div className="space-y-1.5">
                                <Label htmlFor="days_requested">
                                    Days requested{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="days_requested"
                                    type="number"
                                    min="0.5"
                                    step="0.5"
                                    value={form.data.days_requested}
                                    onChange={(e) =>
                                        form.setData(
                                            'days_requested',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Auto-calculated"
                                />
                                <InputError
                                    message={form.errors.days_requested}
                                />
                            </div>

                            {/* Reason */}
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="reason">Reason</Label>
                                <Textarea
                                    id="reason"
                                    value={form.data.reason}
                                    onChange={(e) =>
                                        form.setData('reason', e.target.value)
                                    }
                                    placeholder="Optional reason for the leave..."
                                    rows={3}
                                />
                                <InputError message={form.errors.reason} />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => history.back()}
                                type="button"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={form.processing}
                            >
                                Submit leave request
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
