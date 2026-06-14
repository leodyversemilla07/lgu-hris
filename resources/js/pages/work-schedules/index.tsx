import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    CalendarClock,
    Clock3,
    Coffee,
    Pencil,
    Plus,
    PowerOff,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { index as attendanceIndex } from '@/actions/App/Http/Controllers/AttendanceController';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    destroy,
    index as workSchedulesIndex,
    store,
    update,
} from '@/actions/App/Http/Controllers/WorkScheduleController';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type WorkSchedule = {
    id: number;
    uuid: string;
    name: string;
    time_in: string;
    time_out: string;
    break_minutes: number;
    work_hours_per_day: number;
    is_active: boolean;
    employees_count: number;
    updated_at: string;
};

type WorkScheduleFormData = {
    name: string;
    time_in: string;
    time_out: string;
    break_minutes: string;
    work_hours_per_day: string;
    is_active: boolean;
};

type Props = {
    schedules: WorkSchedule[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex.url() },
    { title: 'Attendance', href: attendanceIndex.url() },
    { title: 'Work schedules', href: workSchedulesIndex.url() },
];

function formatTime(value: string): string {
    const [hoursText, minutes] = value.split(':');
    const hours = Number(hoursText);
    const period = hours >= 12 ? 'PM' : 'AM';
    const normalizedHours = hours % 12 || 12;

    return `${normalizedHours}:${minutes} ${period}`;
}

function ScheduleForm({
    title,
    description,
    data,
    setData,
    errors,
}: {
    title: string;
    description: string;
    data: WorkScheduleFormData;
    setData: <K extends keyof WorkScheduleFormData>(
        key: K,
        value: WorkScheduleFormData[K],
    ) => void;
    errors: Partial<Record<keyof WorkScheduleFormData, string>>;
}) {
    return (
        <>
            <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
                <DialogDescription>{description}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="schedule-name">Schedule name</Label>
                    <Input
                        id="schedule-name"
                        value={data.name}
                        onChange={(event) =>
                            setData('name', event.target.value)
                        }
                        placeholder="Regular Office Hours"
                    />
                    {errors.name ? (
                        <p className="text-sm text-destructive">
                            {errors.name}
                        </p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="schedule-time-in">Time in</Label>
                    <Input
                        id="schedule-time-in"
                        type="time"
                        value={data.time_in}
                        onChange={(event) =>
                            setData('time_in', event.target.value)
                        }
                    />
                    {errors.time_in ? (
                        <p className="text-sm text-destructive">
                            {errors.time_in}
                        </p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="schedule-time-out">Time out</Label>
                    <Input
                        id="schedule-time-out"
                        type="time"
                        value={data.time_out}
                        onChange={(event) =>
                            setData('time_out', event.target.value)
                        }
                    />
                    {errors.time_out ? (
                        <p className="text-sm text-destructive">
                            {errors.time_out}
                        </p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="schedule-break">Break minutes</Label>
                    <Input
                        id="schedule-break"
                        type="number"
                        min="0"
                        max="240"
                        value={data.break_minutes}
                        onChange={(event) =>
                            setData('break_minutes', event.target.value)
                        }
                    />
                    {errors.break_minutes ? (
                        <p className="text-sm text-destructive">
                            {errors.break_minutes}
                        </p>
                    ) : null}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="schedule-hours">Work hours per day</Label>
                    <Input
                        id="schedule-hours"
                        type="number"
                        min="0.5"
                        max="24"
                        step="0.25"
                        value={data.work_hours_per_day}
                        onChange={(event) =>
                            setData('work_hours_per_day', event.target.value)
                        }
                    />
                    {errors.work_hours_per_day ? (
                        <p className="text-sm text-destructive">
                            {errors.work_hours_per_day}
                        </p>
                    ) : null}
                </div>
            </div>
        </>
    );
}

function CreateScheduleDialog() {
    const [open, setOpen] = useState(false);
    const form = useForm<WorkScheduleFormData>({
        name: '',
        time_in: '08:00',
        time_out: '17:00',
        break_minutes: '60',
        work_hours_per_day: '8',
        is_active: true,
    });

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        form.submit(store(), {
            onSuccess: () => {
                setOpen(false);
                form.reset();
                form.setData('time_in', '08:00');
                form.setData('time_out', '17:00');
                form.setData('break_minutes', '60');
                form.setData('work_hours_per_day', '8');
                form.setData('is_active', true);
            },
        });
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus data-icon="inline-start" />
                    Add work schedule
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit} className="space-y-6">
                    <ScheduleForm
                        title="Create work schedule"
                        description="Define the standard daily schedule available for employee assignment."
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save schedule
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditScheduleDialog({ schedule }: { schedule: WorkSchedule }) {
    const [open, setOpen] = useState(false);
    const form = useForm<WorkScheduleFormData>({
        name: schedule.name,
        time_in: schedule.time_in,
        time_out: schedule.time_out,
        break_minutes: String(schedule.break_minutes),
        work_hours_per_day: String(schedule.work_hours_per_day),
        is_active: schedule.is_active,
    });

    function submit(event: React.FormEvent): void {
        event.preventDefault();
        form.submit(update({ workSchedule: schedule.uuid }), {
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
                <form onSubmit={submit} className="space-y-6">
                    <ScheduleForm
                        title="Edit work schedule"
                        description="Update timing, break duration, or daily hour targets for this schedule."
                        data={form.data}
                        setData={form.setData}
                        errors={form.errors}
                    />
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function WorkSchedulesIndex({ schedules }: Props) {
    const activeSchedules = schedules.filter((schedule) => schedule.is_active);
    const assignedEmployees = schedules.reduce(
        (total, schedule) => total + schedule.employees_count,
        0,
    );
    const averageHours =
        activeSchedules.length > 0
            ? activeSchedules.reduce(
                  (total, schedule) => total + schedule.work_hours_per_day,
                  0,
              ) / activeSchedules.length
            : 0;

    function deactivateSchedule(schedule: WorkSchedule): void {
        if (
            !confirm(
                `Deactivate "${schedule.name}"? Existing employee assignments will be preserved.`,
            )
        ) {
            return;
        }

        router.delete(destroy({ workSchedule: schedule.uuid }));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Work Schedules" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,rgba(15,118,110,0.12),transparent_34%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#0f766e] text-white hover:bg-[#0f766e]">
                                Attendance setup
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Work schedules
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Maintain the schedule templates used when
                                    assigning employees to standard office or
                                    shifting hours.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild variant="outline">
                                <Link href={attendanceIndex()}>
                                    <CalendarClock data-icon="inline-start" />
                                    Back to attendance
                                </Link>
                            </Button>
                            <CreateScheduleDialog />
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardDescription>Active schedules</CardDescription>
                            <CardTitle className="text-3xl">
                                {activeSchedules.length}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600">
                            Schedule templates currently available in employee
                            forms.
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardDescription>
                                Assigned employees
                            </CardDescription>
                            <CardTitle className="text-3xl">
                                {assignedEmployees}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600">
                            Existing employee records linked to any saved
                            schedule.
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardDescription>
                                Average daily hours
                            </CardDescription>
                            <CardTitle className="text-3xl">
                                {averageHours.toFixed(2)}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600">
                            Average work-hours target across active schedule
                            templates.
                        </CardContent>
                    </Card>
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardDescription>Coverage</CardDescription>
                            <CardTitle className="text-3xl">
                                {activeSchedules.length > 0 ? 'Ready' : 'Setup'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600">
                            Employee assignment pages can use schedules as soon
                            as templates are configured.
                        </CardContent>
                    </Card>
                </div>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-950">
                            Schedule registry
                        </CardTitle>
                        <CardDescription>
                            Active schedules appear in employee assignment
                            forms. Deactivated schedules stay linked to
                            historical employee records.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Hours</TableHead>
                                    <TableHead>Break</TableHead>
                                    <TableHead>Employees</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Updated</TableHead>
                                    <TableHead className="w-28 text-right">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((schedule) => (
                                    <TableRow
                                        key={schedule.id}
                                        className={
                                            !schedule.is_active
                                                ? 'opacity-70'
                                                : ''
                                        }
                                    >
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-slate-950">
                                                    {schedule.name}
                                                </span>
                                                <span className="text-sm text-slate-500">
                                                    {formatTime(
                                                        schedule.time_in,
                                                    )}{' '}
                                                    to{' '}
                                                    {formatTime(
                                                        schedule.time_out,
                                                    )}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock3 className="size-4 text-slate-400" />
                                                {schedule.work_hours_per_day.toFixed(
                                                    2,
                                                )}{' '}
                                                hrs/day
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Coffee className="size-4 text-slate-400" />
                                                {schedule.break_minutes} mins
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Users className="size-4 text-slate-400" />
                                                {schedule.employees_count}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {schedule.is_active ? (
                                                <Badge>Active</Badge>
                                            ) : (
                                                <Badge variant="secondary">
                                                    Inactive
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-500">
                                            {schedule.updated_at}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-end gap-1">
                                                <EditScheduleDialog
                                                    schedule={schedule}
                                                />
                                                {schedule.is_active ? (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-muted-foreground hover:text-destructive"
                                                        onClick={() =>
                                                            deactivateSchedule(
                                                                schedule,
                                                            )
                                                        }
                                                    >
                                                        <PowerOff className="size-4" />
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {schedules.length === 0 ? (
                                    <TableRow>
                                        <TableCell
                                            colSpan={7}
                                            className="py-12 text-center text-sm text-slate-500"
                                        >
                                            No work schedules configured yet.
                                        </TableCell>
                                    </TableRow>
                                ) : null}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
