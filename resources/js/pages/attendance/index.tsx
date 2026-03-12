import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    FileText,
    Plus,
    Users,
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
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
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
import AppLayout from '@/layouts/app-layout';
import type { Auth, BreadcrumbItem } from '@/types';

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
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
];

const numberFormatter = new Intl.NumberFormat();

function formatMinutes(minutes: number): string {
    if (minutes === 0) {
        return '—';
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
    }

    return `${remainingMinutes}m`;
}

export default function AttendanceIndex({ summaries, employees, filters }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const canManageAttendance = auth.user.permissions.includes('attendance.manage');
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, index) => currentYear - index);

    const [year, setYear] = useState(String(filters.year));
    const [month, setMonth] = useState(String(filters.month));
    const [employeeId, setEmployeeId] = useState(filters.employee_id);

    const selectedMonthLabel = MONTHS[Number.parseInt(month, 10) - 1] ?? MONTHS[0];
    const totalPresentDays = summaries.reduce((total, summary) => total + summary.days_present, 0);
    const totalAbsences = summaries.reduce((total, summary) => total + summary.days_absent, 0);
    const totalLateMinutes = summaries.reduce((total, summary) => total + summary.total_late_minutes, 0);
    const totalUndertimeMinutes = summaries.reduce((total, summary) => total + summary.total_undertime_minutes, 0);

    const summaryCards = [
        {
            title: 'Employees in view',
            value: numberFormatter.format(summaries.length),
            detail: `${numberFormatter.format(employees.length)} selectable employees in this scope`,
            hint: 'Scope',
            icon: Users,
        },
        {
            title: 'Present days',
            value: numberFormatter.format(totalPresentDays),
            detail: 'Accumulated present days for the selected period',
            hint: 'Attendance',
            icon: CalendarDays,
        },
        {
            title: 'Absences flagged',
            value: numberFormatter.format(totalAbsences),
            detail: `${numberFormatter.format(totalUndertimeMinutes)} undertime minutes recorded`,
            hint: 'Exceptions',
            icon: FileText,
        },
        {
            title: 'Late minutes',
            value: totalLateMinutes === 0 ? '—' : formatMinutes(totalLateMinutes),
            detail: 'Combined tardiness across all visible summaries',
            hint: 'Time',
            icon: Clock3,
        },
    ];

    function apply(nextYear: string, nextMonth: string, nextEmployeeId: string): void {
        const params: Record<string, string> = {
            year: nextYear,
            month: nextMonth,
        };

        if (nextEmployeeId && nextEmployeeId !== 'all') {
            params.employee_id = nextEmployeeId;
        }

        router.get('/attendance', params, {
            preserveState: true,
            replace: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Attendance" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Attendance
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Monthly attendance
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Review attendance summaries, late arrivals, absences, and undertime for the selected reporting window.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    {canManageAttendance ? (
                                        <Button asChild variant="outline">
                                            <Link href="/work-schedules">
                                                <CalendarDays data-icon="inline-start" />
                                                Manage schedules
                                            </Link>
                                        </Button>
                                    ) : null}
                                    {canManageAttendance ? (
                                        <Button asChild>
                                            <Link href="/attendance/log">
                                                <Plus data-icon="inline-start" />
                                                Log attendance
                                            </Link>
                                        </Button>
                                    ) : null}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
                            {summaryCards.map((item) => (
                                <Card key={item.title} className="@container/card shadow-xs">
                                    <CardHeader>
                                        <CardDescription>{item.title}</CardDescription>
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
                            <Card className="shadow-xs">
                                <CardHeader>
                                    <CardTitle>Attendance summary</CardTitle>
                                    <CardDescription>
                                        Filter the current attendance view by month, year, and employee without leaving the page.
                                    </CardDescription>
                                    <CardAction>
                                        <Badge variant="outline">
                                            {selectedMonthLabel} {year}
                                        </Badge>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-6">
                                    <div className="grid gap-3 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Month
                                            </p>
                                            <Select
                                                value={month}
                                                onValueChange={(value) => {
                                                    setMonth(value);
                                                    apply(year, value, employeeId);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {MONTHS.map((monthLabel, index) => (
                                                        <SelectItem key={monthLabel} value={String(index + 1)}>
                                                            {monthLabel}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Year
                                            </p>
                                            <Select
                                                value={year}
                                                onValueChange={(value) => {
                                                    setYear(value);
                                                    apply(value, month, employeeId);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {years.map((yearOption) => (
                                                        <SelectItem key={yearOption} value={String(yearOption)}>
                                                            {yearOption}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                                Employee
                                            </p>
                                            <Select
                                                value={employeeId || 'all'}
                                                onValueChange={(value) => {
                                                    const nextEmployeeId = value === 'all' ? '' : value;
                                                    setEmployeeId(nextEmployeeId);
                                                    apply(year, month, nextEmployeeId);
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="All employees" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="all">All employees</SelectItem>
                                                    {employees.map((employee) => (
                                                        <SelectItem key={employee.value} value={employee.value}>
                                                            {employee.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {summaries.length === 0 ? (
                                        <Empty>
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <CalendarDays />
                                                </EmptyMedia>
                                                <EmptyTitle>No attendance records yet</EmptyTitle>
                                                <EmptyDescription>
                                                    There are no monthly attendance summaries for the selected period and scope.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            {canManageAttendance ? (
                                                <EmptyContent>
                                                    <Button asChild variant="outline">
                                                        <Link href="/attendance/log">
                                                            Log the first attendance
                                                        </Link>
                                                    </Button>
                                                </EmptyContent>
                                            ) : null}
                                        </Empty>
                                    ) : (
                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Employee</TableHead>
                                                        <TableHead className="text-center">Present</TableHead>
                                                        <TableHead className="text-center">Absent</TableHead>
                                                        <TableHead className="text-center">Leave</TableHead>
                                                        <TableHead className="text-center">Holiday</TableHead>
                                                        <TableHead className="text-center">Rest</TableHead>
                                                        <TableHead>Late</TableHead>
                                                        <TableHead>Undertime</TableHead>
                                                        {canManageAttendance ? (
                                                            <TableHead className="text-right">Action</TableHead>
                                                        ) : null}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {summaries.map((summary) => (
                                                        <TableRow key={summary.id}>
                                                            <TableCell>
                                                                <div className="font-medium text-foreground">
                                                                    {summary.employee_name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {summary.employee_number}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {summary.days_present}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <span className={summary.days_absent > 0 ? 'font-medium text-destructive' : 'text-muted-foreground'}>
                                                                    {summary.days_absent}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {summary.days_leave}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                {summary.days_holiday}
                                                            </TableCell>
                                                            <TableCell className="text-center text-muted-foreground">
                                                                {summary.days_rest_day}
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className={summary.total_late_minutes > 0 ? 'text-amber-600' : 'text-muted-foreground'}>
                                                                    {formatMinutes(summary.total_late_minutes)}
                                                                </span>
                                                            </TableCell>
                                                            <TableCell className="text-muted-foreground">
                                                                {formatMinutes(summary.total_undertime_minutes)}
                                                            </TableCell>
                                                            {canManageAttendance ? (
                                                                <TableCell className="text-right">
                                                                    <Button asChild variant="ghost" size="sm">
                                                                        <Link href={`/attendance/log?employee_id=${summary.employee_id}&date=${summary.year}-${String(summary.month).padStart(2, '0')}-01`}>
                                                                            Log
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            ) : null}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
