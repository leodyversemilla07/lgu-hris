import { Head, Link, useForm } from '@inertiajs/react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EmployeeOption = { value: string; label: string };

type Props = {
    employees: EmployeeOption[];
    prefillEmployeeId?: string;
    prefillDate?: string;
};

const STATUS_OPTIONS = [
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'leave', label: 'On Leave' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'rest_day', label: 'Rest Day' },
    { value: 'half_day', label: 'Half Day' },
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
    { title: 'Log attendance', href: '/attendance/log' },
];

export default function AttendanceLog({
    employees,
    prefillEmployeeId,
    prefillDate,
}: Props) {
    const { data, setData, post, processing, errors } = useForm({
        employee_id: prefillEmployeeId ?? '',
        log_date: prefillDate ?? new Date().toISOString().slice(0, 10),
        time_in: '08:00',
        time_out: '17:00',
        status: 'present',
        minutes_late: '0',
        minutes_undertime: '0',
        remarks: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/attendance');
    };

    const showTimes = ['present', 'half_day'].includes(data.status);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Attendance" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="space-y-3">
                        <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                            Manual entry
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                Log attendance
                            </h1>
                            <p className="text-sm leading-6 text-slate-600">
                                Manually record an attendance entry for a
                                specific employee and date.
                            </p>
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                Attendance details
                            </CardTitle>
                            <CardDescription>
                                Select the employee and date, then fill in the
                                attendance information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="employee_id">
                                    Employee{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.employee_id}
                                    onValueChange={(v) =>
                                        setData('employee_id', v)
                                    }
                                >
                                    <SelectTrigger id="employee_id">
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
                                {errors.employee_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.employee_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="log_date">
                                    Date{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="log_date"
                                    type="date"
                                    value={data.log_date}
                                    onChange={(e) =>
                                        setData('log_date', e.target.value)
                                    }
                                />
                                {errors.log_date && (
                                    <p className="text-xs text-red-500">
                                        {errors.log_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="status">
                                    Status{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.status}
                                    onValueChange={(v) =>
                                        setData('status', v)
                                    }
                                >
                                    <SelectTrigger id="status">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map((s) => (
                                            <SelectItem
                                                key={s.value}
                                                value={s.value}
                                            >
                                                {s.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {showTimes && (
                                <>
                                    <div className="space-y-2">
                                        <Label htmlFor="time_in">
                                            Time in
                                        </Label>
                                        <Input
                                            id="time_in"
                                            type="time"
                                            value={data.time_in}
                                            onChange={(e) =>
                                                setData(
                                                    'time_in',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="time_out">
                                            Time out
                                        </Label>
                                        <Input
                                            id="time_out"
                                            type="time"
                                            value={data.time_out}
                                            onChange={(e) =>
                                                setData(
                                                    'time_out',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        {errors.time_out && (
                                            <p className="text-xs text-red-500">
                                                {errors.time_out}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minutes_late">
                                            Minutes late
                                        </Label>
                                        <Input
                                            id="minutes_late"
                                            type="number"
                                            min="0"
                                            max="480"
                                            value={data.minutes_late}
                                            onChange={(e) =>
                                                setData(
                                                    'minutes_late',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="minutes_undertime">
                                            Minutes undertime
                                        </Label>
                                        <Input
                                            id="minutes_undertime"
                                            type="number"
                                            min="0"
                                            max="480"
                                            value={data.minutes_undertime}
                                            onChange={(e) =>
                                                setData(
                                                    'minutes_undertime',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="remarks">Remarks</Label>
                                <Textarea
                                    id="remarks"
                                    value={data.remarks}
                                    onChange={(e) =>
                                        setData('remarks', e.target.value)
                                    }
                                    placeholder="Optional notes…"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href="/attendance">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save attendance log'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
