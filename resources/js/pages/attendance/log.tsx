import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Save,
    ShieldCheck,
    Upload,
} from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
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
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EmployeeOption = {
    value: string;
    label: string;
    work_schedule: {
        name: string;
        time_in: string;
        time_out: string;
    } | null;
};

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

const BIOMETRIC_HEADERS = [
    'employee_number',
    'log_date',
    'time_in',
    'time_out',
    'status',
    'device_name',
    'remarks',
    'minutes_late',
    'minutes_undertime',
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Attendance', href: '/attendance' },
    { title: 'Log attendance', href: '/attendance/log' },
];

const numberFormatter = new Intl.NumberFormat();

function toCalendarDate(value: string): Date | undefined {
    return value ? parseISO(value) : undefined;
}

function DatePickerField({
    value,
    onChange,
    placeholder,
    invalid = false,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    invalid?: boolean;
}): ReactNode {
    const selectedDate = toCalendarDate(value);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-invalid={invalid ? 'true' : 'false'}
                >
                    <CalendarDays data-icon="inline-start" />
                    {selectedDate ? format(selectedDate, 'PPP') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) =>
                        onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}): ReactNode {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function FormField({
    label,
    htmlFor,
    required = false,
    error,
    children,
}: {
    label: string;
    htmlFor?: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}): ReactNode {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required ? ' *' : null}
            </Label>
            {children}
            <InputError message={error} />
        </div>
    );
}

export default function AttendanceLog({
    employees,
    prefillEmployeeId,
    prefillDate,
}: Props) {
    const form = useForm({
        employee_id: prefillEmployeeId ?? '',
        log_date: prefillDate ?? new Date().toISOString().slice(0, 10),
        time_in: '08:00',
        time_out: '17:00',
        status: 'present',
        minutes_late: '',
        minutes_undertime: '',
        remarks: '',
    });
    const biometricForm = useForm<{
        file: File | null;
        device_name: string;
    }>({
        file: null,
        device_name: '',
    });

    const selectedEmployee = employees.find(
        (employee) => employee.value === form.data.employee_id,
    );
    const showTimes = ['present', 'half_day'].includes(form.data.status);

    const summaryCards = [
        {
            title: 'Employees',
            value: numberFormatter.format(employees.length),
            detail: 'Active employees available for manual attendance entry.',
            icon: FileText,
        },
        {
            title: 'Entry mode',
            value: 'Manual',
            detail: 'Use this form for one-off logging and corrections.',
            icon: CheckCircle2,
        },
        {
            title: 'Status',
            value:
                STATUS_OPTIONS.find(
                    (status) => status.value === form.data.status,
                )?.label ?? 'Present',
            detail: showTimes
                ? 'Time in and time out inputs stay available.'
                : 'Time inputs are hidden for non-working-day statuses.',
            icon: Clock3,
        },
        {
            title: 'Schedule',
            value: selectedEmployee?.work_schedule?.name ?? 'Unassigned',
            detail: selectedEmployee?.work_schedule
                ? `${selectedEmployee.work_schedule.time_in} - ${selectedEmployee.work_schedule.time_out}`
                : 'Late and undertime stay manual when no schedule is assigned.',
            icon: CalendarDays,
        },
    ];

    function handleSubmit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        form.post('/attendance');
    }

    function handleBiometricUpload(): void {
        biometricForm.post('/attendance/biometric', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => biometricForm.reset(),
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Log Attendance" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <form
                        onSubmit={handleSubmit}
                        className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                    >
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Attendance
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Log attendance
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Record a manual attendance entry for a
                                        specific employee and date, with
                                        schedule-aware late and undertime
                                        defaults when available, or upload
                                        biometric exports for bulk processing.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href="/attendance">
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to monthly attendance
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <Save data-icon="inline-start" />
                                        Save attendance log
                                    </Button>
                                </div>
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
                                                Overview
                                            </Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardFooter className="text-sm text-muted-foreground">
                                        {item.detail}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="grid gap-6 px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="flex flex-col gap-6">
                                <FormSection
                                    title="Attendance details"
                                    description="Choose the employee, date, and attendance status, then encode work times or schedule adjustments when needed."
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="md:col-span-2">
                                            <FormField
                                                label="Employee"
                                                required
                                                error={form.errors.employee_id}
                                            >
                                                <Select
                                                    value={form.data.employee_id}
                                                    onValueChange={(value) =>
                                                        form.setData(
                                                            'employee_id',
                                                            value,
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger
                                                        id="employee_id"
                                                        className="w-full"
                                                        aria-invalid={
                                                            form.errors
                                                                .employee_id
                                                                ? 'true'
                                                                : 'false'
                                                        }
                                                    >
                                                        <SelectValue placeholder="Select employee" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {employees.map(
                                                                (employee) => (
                                                                    <SelectItem
                                                                        key={
                                                                            employee.value
                                                                        }
                                                                        value={
                                                                            employee.value
                                                                        }
                                                                    >
                                                                        {
                                                                            employee.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                            </FormField>
                                        </div>

                                        <FormField
                                            label="Date"
                                            htmlFor="log_date"
                                            required
                                            error={form.errors.log_date}
                                        >
                                            <DatePickerField
                                                value={form.data.log_date}
                                                onChange={(value) =>
                                                    form.setData('log_date', value)
                                                }
                                                placeholder="Pick attendance date"
                                                invalid={Boolean(form.errors.log_date)}
                                            />
                                        </FormField>

                                        <FormField
                                            label="Status"
                                            required
                                            error={form.errors.status}
                                        >
                                            <Select
                                                value={form.data.status}
                                                onValueChange={(value) => {
                                                    form.setData('status', value);

                                                    if (
                                                        ['present', 'half_day'].includes(
                                                            value,
                                                        )
                                                    ) {
                                                        form.setData(
                                                            'time_in',
                                                            form.data.time_in ||
                                                                '08:00',
                                                        );
                                                        form.setData(
                                                            'time_out',
                                                            form.data
                                                                .time_out ||
                                                                '17:00',
                                                        );

                                                        return;
                                                    }

                                                    form.setData('time_in', '');
                                                    form.setData('time_out', '');
                                                    form.setData(
                                                        'minutes_late',
                                                        '',
                                                    );
                                                    form.setData(
                                                        'minutes_undertime',
                                                        '',
                                                    );
                                                }}
                                            >
                                                <SelectTrigger
                                                    id="status"
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors.status
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {STATUS_OPTIONS.map(
                                                            (status) => (
                                                                <SelectItem
                                                                    key={
                                                                        status.value
                                                                    }
                                                                    value={
                                                                        status.value
                                                                    }
                                                                >
                                                                    {
                                                                        status.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>

                                        {showTimes ? (
                                            <>
                                                <FormField
                                                    label="Time in"
                                                    htmlFor="time_in"
                                                    error={form.errors.time_in}
                                                >
                                                    <Input
                                                        id="time_in"
                                                        type="time"
                                                        value={form.data.time_in}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'time_in',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        aria-invalid={
                                                            form.errors.time_in
                                                                ? 'true'
                                                                : 'false'
                                                        }
                                                    />
                                                </FormField>

                                                <FormField
                                                    label="Time out"
                                                    htmlFor="time_out"
                                                    error={form.errors.time_out}
                                                >
                                                    <Input
                                                        id="time_out"
                                                        type="time"
                                                        value={form.data.time_out}
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'time_out',
                                                                event.target
                                                                    .value,
                                                            )
                                                        }
                                                        aria-invalid={
                                                            form.errors
                                                                .time_out
                                                                ? 'true'
                                                                : 'false'
                                                        }
                                                    />
                                                </FormField>

                                                <div className="md:col-span-2 grid gap-4 md:grid-cols-2">
                                                    <FormField
                                                        label="Minutes late"
                                                        htmlFor="minutes_late"
                                                        error={
                                                            form.errors
                                                                .minutes_late
                                                        }
                                                    >
                                                        <Input
                                                            id="minutes_late"
                                                            type="number"
                                                            min="0"
                                                            max="480"
                                                            value={
                                                                form.data
                                                                    .minutes_late
                                                            }
                                                            onChange={(event) =>
                                                                form.setData(
                                                                    'minutes_late',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Auto"
                                                            aria-invalid={
                                                                form.errors
                                                                    .minutes_late
                                                                    ? 'true'
                                                                    : 'false'
                                                            }
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Leave blank to
                                                            calculate from the
                                                            assigned schedule.
                                                        </p>
                                                    </FormField>

                                                    <FormField
                                                        label="Minutes undertime"
                                                        htmlFor="minutes_undertime"
                                                        error={
                                                            form.errors
                                                                .minutes_undertime
                                                        }
                                                    >
                                                        <Input
                                                            id="minutes_undertime"
                                                            type="number"
                                                            min="0"
                                                            max="480"
                                                            value={
                                                                form.data
                                                                    .minutes_undertime
                                                            }
                                                            onChange={(event) =>
                                                                form.setData(
                                                                    'minutes_undertime',
                                                                    event
                                                                        .target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Auto"
                                                            aria-invalid={
                                                                form.errors
                                                                    .minutes_undertime
                                                                    ? 'true'
                                                                    : 'false'
                                                            }
                                                        />
                                                        <p className="text-xs text-muted-foreground">
                                                            Leave blank to
                                                            calculate from the
                                                            assigned schedule.
                                                        </p>
                                                    </FormField>
                                                </div>
                                            </>
                                        ) : null}

                                        <div className="md:col-span-2">
                                            <FormField
                                                label="Remarks"
                                                htmlFor="remarks"
                                                error={form.errors.remarks}
                                            >
                                                <Textarea
                                                    id="remarks"
                                                    value={form.data.remarks}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'remarks',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Optional notes for this attendance entry"
                                                    rows={4}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </FormSection>
                            </div>
                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Schedule guidance</CardTitle>
                                        <CardDescription>
                                            Review how this entry will behave
                                            before saving.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {selectedEmployee?.label ??
                                                    'No employee selected'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {selectedEmployee?.work_schedule
                                                    ? `Assigned schedule: ${selectedEmployee.work_schedule.name}`
                                                    : 'Select an employee to inspect their schedule defaults.'}
                                            </span>
                                        </div>

                                        {selectedEmployee?.work_schedule ? (
                                            <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                                <div className="flex items-center gap-2 font-medium text-foreground">
                                                    <CalendarDays className="size-4" />
                                                    {selectedEmployee.work_schedule.name}
                                                </div>
                                                <p className="mt-2">
                                                    {selectedEmployee
                                                        .work_schedule.time_in}{' '}
                                                    -{' '}
                                                    {selectedEmployee
                                                        .work_schedule.time_out}
                                                </p>
                                                <p className="mt-2">
                                                    Leaving late and undertime
                                                    blank will use this schedule
                                                    for auto-calculation.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                                                No work schedule is assigned.
                                                Late and undertime remain zero
                                                unless you enter them manually.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Before saving</CardTitle>
                                        <CardDescription>
                                            Quick checks before this entry is
                                            written to the attendance log.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-2">
                                            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Confirm the selected employee,
                                                date, and attendance status.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock3 className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                For present and half-day
                                                entries, time in and time out
                                                remain editable.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Blank late and undertime values
                                                use the assigned work schedule
                                                when available.
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={form.processing}
                                        >
                                            <Save data-icon="inline-start" />
                                            Save attendance log
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link href="/attendance">
                                                Cancel
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Biometric import</CardTitle>
                                        <CardDescription>
                                            Upload a CSV export from a biometric
                                            kiosk or timekeeping device. Use
                                            employee numbers so the system can
                                            match punches to employee records
                                            and recompute monthly summaries.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <FormField
                                            label="Biometric export file"
                                            htmlFor="biometric-file"
                                            required
                                            error={biometricForm.errors.file}
                                        >
                                            <Input
                                                id="biometric-file"
                                                type="file"
                                                accept=".csv,text/csv,.txt"
                                                onChange={(event) =>
                                                    biometricForm.setData(
                                                        'file',
                                                        event.target.files?.[0] ??
                                                            null,
                                                    )
                                                }
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Supported headers:{' '}
                                                {BIOMETRIC_HEADERS.join(', ')}
                                            </p>
                                        </FormField>

                                        <FormField
                                            label="Default device label"
                                            htmlFor="device_name"
                                            error={
                                                biometricForm.errors.device_name
                                            }
                                        >
                                            <Input
                                                id="device_name"
                                                value={
                                                    biometricForm.data
                                                        .device_name
                                                }
                                                onChange={(event) =>
                                                    biometricForm.setData(
                                                        'device_name',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Main biometric kiosk"
                                            />
                                        </FormField>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="button"
                                            className="w-full"
                                            disabled={
                                                biometricForm.processing
                                            }
                                            onClick={handleBiometricUpload}
                                        >
                                            <Upload data-icon="inline-start" />
                                            Import biometric CSV
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
