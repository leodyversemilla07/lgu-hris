import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    ArrowLeft,
    ArrowRightLeft,
    BriefcaseBusiness,
    CalendarDays,
    FileText,
    Save,
    ShieldCheck,
} from 'lucide-react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardAction,
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

type SelectOption = {
    value: string;
    label: string;
};

type EmployeeOption = {
    value: string;
    label: string;
    employee_number?: string;
    department_id: string | null;
    position_id: string | null;
    employment_status_id: string | null;
};

type Props = {
    employees: EmployeeOption[];
    movementTypes: SelectOption[];
    departments: SelectOption[];
    positions: SelectOption[];
    employmentStatuses: SelectOption[];
    prefillEmployeeId?: string | null;
};

type MovementFormData = {
    employee_id: string;
    movement_type_id: string;
    effective_date: string;
    from_department_id: string;
    to_department_id: string;
    from_position_id: string;
    to_position_id: string;
    from_employment_status_id: string;
    to_employment_status_id: string;
    order_number: string;
    remarks: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Personnel Movements', href: '/personnel-movements' },
    { title: 'Record movement', href: '/personnel-movements/create' },
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

function OptionalSelect({
    value,
    onValueChange,
    placeholder,
    options,
}: {
    value: string;
    onValueChange: (value: string) => void;
    placeholder: string;
    options: SelectOption[];
}): ReactNode {
    return (
        <Select value={value} onValueChange={onValueChange}>
            <SelectTrigger className="w-full">
                <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="none">None</SelectItem>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

export default function PersonnelMovementsCreate({
    employees,
    movementTypes,
    departments,
    positions,
    employmentStatuses,
    prefillEmployeeId,
}: Props) {
    const { data, setData, post, processing, errors } =
        useForm<MovementFormData>({
            employee_id: prefillEmployeeId ?? '',
            movement_type_id: '',
            effective_date: '',
            from_department_id: '',
            to_department_id: '',
            from_position_id: '',
            to_position_id: '',
            from_employment_status_id: '',
            to_employment_status_id: '',
            order_number: '',
            remarks: '',
        });

    const selectedEmployee = employees.find(
        (employee) => employee.value === data.employee_id,
    );
    const selectedMovementType = movementTypes.find(
        (type) => type.value === data.movement_type_id,
    );

    useEffect(() => {
        if (data.employee_id) {
            const employee = employees.find(
                (item) => item.value === data.employee_id,
            );

            if (employee) {
                setData((previous) => ({
                    ...previous,
                    from_department_id: employee.department_id ?? '',
                    from_position_id: employee.position_id ?? '',
                    from_employment_status_id:
                        employee.employment_status_id ?? '',
                }));
            }
        }
    }, [data.employee_id, employees, setData]);

    const summaryCards = [
        {
            title: 'Active employees',
            value: numberFormatter.format(employees.length),
            detail: 'Available employee records that can receive a movement entry.',
            hint: 'People',
            icon: BriefcaseBusiness,
        },
        {
            title: 'Movement types',
            value: numberFormatter.format(movementTypes.length),
            detail: 'Configured transfers, promotions, separations, and related actions.',
            hint: 'Catalog',
            icon: ArrowRightLeft,
        },
        {
            title: 'Reference sets',
            value: numberFormatter.format(
                departments.length +
                    positions.length +
                    employmentStatuses.length,
            ),
            detail: 'Department, position, and employment status options available for mapping.',
            hint: 'Options',
            icon: ShieldCheck,
        },
        {
            title: 'Current selection',
            value: selectedMovementType?.label ?? 'Not set',
            detail: 'Updates as you choose the movement type for this record.',
            hint: 'Record',
            icon: FileText,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Movement" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            post('/personnel-movements');
                        }}
                        className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                    >
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Personnel movements
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Record personnel movement
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Document a promotion, transfer,
                                        separation, reappointment, or status
                                        change using the same shared workflow
                                        layout as the rest of the HRIS.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href="/personnel-movements">
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to registry
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={processing}>
                                        <Save data-icon="inline-start" />
                                        Save movement
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
                                                {item.hint}
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
                                    title="Movement details"
                                    description="Core information about the movement record and the affected employee."
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <Label htmlFor="employee_id">
                                                Employee{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={data.employee_id}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'employee_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id="employee_id"
                                                    className="w-full"
                                                    aria-invalid={
                                                        errors.employee_id
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
                                            <InputError
                                                message={errors.employee_id}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label htmlFor="movement_type_id">
                                                Movement type{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={data.movement_type_id}
                                                onValueChange={(value) =>
                                                    setData(
                                                        'movement_type_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    id="movement_type_id"
                                                    className="w-full"
                                                    aria-invalid={
                                                        errors.movement_type_id
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {movementTypes.map(
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
                                                    errors.movement_type_id
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                Effective date{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <DatePickerField
                                                value={data.effective_date}
                                                onChange={(value) =>
                                                    setData(
                                                        'effective_date',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pick effective date"
                                                invalid={Boolean(
                                                    errors.effective_date,
                                                )}
                                            />
                                            <InputError
                                                message={errors.effective_date}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2 md:col-span-2">
                                            <Label htmlFor="order_number">
                                                Order / appointment no.
                                            </Label>
                                            <Input
                                                id="order_number"
                                                value={data.order_number}
                                                onChange={(event) =>
                                                    setData(
                                                        'order_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="e.g. CSC-001-2025"
                                            />
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="From and to references"
                                    description="Capture the department, position, and employment status transition for this movement."
                                >
                                    <div className="grid gap-6">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Label>From department</Label>
                                                <OptionalSelect
                                                    value={
                                                        data.from_department_id
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'from_department_id',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="None"
                                                    options={departments}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>To department</Label>
                                                <OptionalSelect
                                                    value={
                                                        data.to_department_id
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'to_department_id',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="None"
                                                    options={departments}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Label>From position</Label>
                                                <OptionalSelect
                                                    value={
                                                        data.from_position_id
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'from_position_id',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="None"
                                                    options={positions}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>To position</Label>
                                                <OptionalSelect
                                                    value={data.to_position_id}
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'to_position_id',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="None"
                                                    options={positions}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    From employment status
                                                </Label>
                                                <OptionalSelect
                                                    value={
                                                        data.from_employment_status_id
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'from_employment_status_id',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="None"
                                                    options={employmentStatuses}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>
                                                    To employment status
                                                </Label>
                                                <OptionalSelect
                                                    value={
                                                        data.to_employment_status_id
                                                    }
                                                    onValueChange={(value) =>
                                                        setData(
                                                            'to_employment_status_id',
                                                            value,
                                                        )
                                                    }
                                                    placeholder="None"
                                                    options={employmentStatuses}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Remarks"
                                    description="Add supporting context, notes, or administrative details for this movement record."
                                >
                                    <Textarea
                                        value={data.remarks}
                                        onChange={(event) =>
                                            setData(
                                                'remarks',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Additional notes or context for this movement"
                                        rows={5}
                                    />
                                </FormSection>
                            </div>

                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Movement snapshot</CardTitle>
                                        <CardDescription>
                                            Quick view of the selected employee
                                            and movement context before saving.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm font-medium">
                                                {selectedEmployee?.label ??
                                                    'No employee selected'}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {selectedEmployee?.employee_number
                                                    ? `Employee no. ${selectedEmployee.employee_number}`
                                                    : 'Select an employee to preload the current assignment.'}
                                            </span>
                                        </div>
                                        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                                            {selectedMovementType
                                                ? `${selectedMovementType.label} will be recorded using the values captured in the fields on this page.`
                                                : 'Choose a movement type to complete the movement record context.'}
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Before saving</CardTitle>
                                        <CardDescription>
                                            Core checks to keep the movement
                                            registry consistent.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-2">
                                            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Confirm the employee, movement
                                                type, and effective date.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <ArrowRightLeft className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Review from and to values
                                                carefully for transfers,
                                                promotions, and status changes.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <FileText className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Use order number and remarks to
                                                preserve the official movement
                                                context.
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={processing}
                                        >
                                            <Save data-icon="inline-start" />
                                            Save movement
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link href="/personnel-movements">
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
