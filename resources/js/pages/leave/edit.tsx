import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Save,
    ShieldCheck,
} from 'lucide-react';
import { useEffect, useEffectEvent } from 'react';
import type { ReactNode } from 'react';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    index as leaveIndex,
    show as leaveShow,
    update as leaveUpdate,
} from '@/actions/App/Http/Controllers/LeaveController';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
    employee_number: string;
};

type LeaveTypeOption = {
    value: string;
    label: string;
    max_days_per_year: number | null;
    requires_approval: boolean;
};

type LeaveRequestDetail = {
    id: number;
    uuid: string;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    leave_type: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string | null;
    status: string;
    saved_at: string;
    submitted_at: string | null;
    actioned_by: string | null;
    actioned_at: string | null;
    remarks: string | null;
};

type BalanceMap = Record<
    string,
    Record<
        string,
        {
            total_days: number;
            used_days: number;
            remaining_days: number;
        }
    >
>;

type Props = {
    employees: EmployeeOption[];
    leaveTypes: LeaveTypeOption[];
    balances: BalanceMap;
    leaveRequest: LeaveRequestDetail;
    year: number;
};

const numberFormatter = new Intl.NumberFormat();

function toCalendarDate(value: string): Date | undefined {
    return value ? parseISO(value) : undefined;
}

function DatePickerField({
    value,
    onChange,
    placeholder,
    invalid = false,
    minDate,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    invalid?: boolean;
    minDate?: string;
}): ReactNode {
    const selectedDate = toCalendarDate(value);
    const minimumDate = minDate ? parseISO(minDate) : undefined;

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
                    disabled={(date) =>
                        minimumDate ? date < minimumDate : false
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

export default function LeaveEdit({
    employees,
    leaveTypes,
    balances,
    leaveRequest,
    year,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboardIndex.url() },
        { title: 'Leave', href: leaveIndex.url() },
        {
            title: `Leave #${leaveRequest.id}`,
            href: leaveShow.url(leaveRequest.uuid),
        },
        { title: 'Edit', href: '' },
    ];

    const form = useForm({
        employee_id: String(leaveRequest.employee_id),
        leave_type_id: leaveRequest.leave_type_id,
        start_date: leaveRequest.start_date
            ? format(parseISO(leaveRequest.start_date), 'yyyy-MM-dd')
            : '',
        end_date: leaveRequest.end_date
            ? format(parseISO(leaveRequest.end_date), 'yyyy-MM-dd')
            : '',
        days_requested: String(leaveRequest.days_requested),
        reason: leaveRequest.reason ?? '',
    });

    function handleSubmit(): void {
        form.patch(leaveUpdate.url(leaveRequest.uuid), {
            onSuccess: () => form.clearErrors(),
        });
    }

    const selectedEmployee = employees.find(
        (employee) => employee.value === form.data.employee_id,
    );
    const selectedType = leaveTypes.find(
        (type) => type.value === form.data.leave_type_id,
    );
    const balance =
        form.data.employee_id && form.data.leave_type_id
            ? (balances[form.data.employee_id]?.[form.data.leave_type_id] ??
              null)
            : null;

    const syncRequestedDays = useEffectEvent(
        (startDate: string, endDate: string): void => {
            const start = new Date(startDate);
            const end = new Date(endDate);

            if (end >= start) {
                const diffMs = end.getTime() - start.getTime();
                const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;

                form.setData('days_requested', String(diffDays));
            }
        },
    );

    useEffect(() => {
        if (form.data.start_date && form.data.end_date) {
            syncRequestedDays(form.data.start_date, form.data.end_date);
        }
    }, [form.data.end_date, form.data.start_date]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Leave #${leaveRequest.id}`} />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            handleSubmit();
                        }}
                        className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                    >
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Leave
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Edit leave request #{leaveRequest.id}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Update the details of this draft leave
                                        request. Changes are saved directly.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href={leaveShow.url(leaveRequest.uuid)}>
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to request
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <Save data-icon="inline-start" />
                                        Save changes
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="flex flex-col gap-6">
                                <FormSection
                                    title="Request details"
                                    description="Select the employee, choose the leave type, and define the requested period."
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                Employee{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={form.data.employee_id}
                                                onValueChange={(value) => {
                                                    form.setData(
                                                        'employee_id',
                                                        value,
                                                    );
                                                    form.setData(
                                                        'leave_type_id',
                                                        '',
                                                    );
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
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
                                            <InputError
                                                message={
                                                    form.errors.employee_id
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                Leave type{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={form.data.leave_type_id}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'leave_type_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select leave type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {leaveTypes.map(
                                                            (type) => (
                                                                <SelectItem
                                                                    key={
                                                                        type.value
                                                                    }
                                                                    value={
                                                                        type.value
                                                                    }
                                                                >
                                                                    {type.label}
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    form.errors.leave_type_id
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                Start date{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <DatePickerField
                                                value={form.data.start_date}
                                                onChange={(value) =>
                                                    form.setData(
                                                        'start_date',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pick start date"
                                                invalid={Boolean(
                                                    form.errors.start_date,
                                                )}
                                            />
                                            <InputError
                                                message={form.errors.start_date}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                End date{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <DatePickerField
                                                value={form.data.end_date}
                                                onChange={(value) =>
                                                    form.setData(
                                                        'end_date',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pick end date"
                                                invalid={Boolean(
                                                    form.errors.end_date,
                                                )}
                                                minDate={form.data.start_date}
                                            />
                                            <InputError
                                                message={form.errors.end_date}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="days_requested">
                                                Days requested{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                id="days_requested"
                                                type="number"
                                                min="0.5"
                                                step="0.5"
                                                value={form.data.days_requested}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'days_requested',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Auto-calculated"
                                            />
                                            <InputError
                                                message={
                                                    form.errors.days_requested
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <Label htmlFor="reason">
                                                Reason
                                            </Label>
                                            <Textarea
                                                id="reason"
                                                value={form.data.reason}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'reason',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Optional reason for the leave request"
                                                rows={4}
                                            />
                                            <InputError
                                                message={form.errors.reason}
                                            />
                                        </div>
                                    </div>
                                </FormSection>
                            </div>

                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Balance snapshot</CardTitle>
                                        <CardDescription>
                                            Review the employee and leave-type
                                            balance before saving.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {selectedEmployee?.label ??
                                                    'No employee selected'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {selectedEmployee
                                                    ? `Employee no. ${selectedEmployee.employee_number}`
                                                    : 'Choose an employee to load their leave balances.'}
                                            </span>
                                        </div>

                                        {balance ? (
                                            <div className="rounded-lg border bg-muted/30 p-4">
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <CalendarDays className="size-4" />
                                                    Balance for {year}
                                                </div>
                                                <div className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
                                                    <span>
                                                        Remaining:{' '}
                                                        {numberFormatter.format(
                                                            balance.remaining_days,
                                                        )}{' '}
                                                        of{' '}
                                                        {numberFormatter.format(
                                                            balance.total_days,
                                                        )}{' '}
                                                        days
                                                    </span>
                                                    <span>
                                                        Used:{' '}
                                                        {numberFormatter.format(
                                                            balance.used_days,
                                                        )}{' '}
                                                        days
                                                    </span>
                                                    {selectedType?.max_days_per_year ? (
                                                        <span>
                                                            Type limit:{' '}
                                                            {numberFormatter.format(
                                                                selectedType.max_days_per_year,
                                                            )}{' '}
                                                            days per year
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-lg border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
                                                Select an employee and leave
                                                type to show the current leave
                                                balance.
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Request summary</CardTitle>
                                        <CardDescription>
                                            Quick checks before saving.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-2">
                                            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Confirm the selected employee,
                                                leave type, and date range.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Clock3 className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Requested days are recalculated
                                                automatically when both dates
                                                are set.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                After saving, you can still
                                                submit or continue editing.
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
                                            Save changes
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link
                                                href={leaveShow.url(
                                                    leaveRequest.uuid,
                                                )}
                                            >
                                                Cancel
                                            </Link>
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
