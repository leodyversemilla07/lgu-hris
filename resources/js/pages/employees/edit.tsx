import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    ArrowLeft,
    BriefcaseBusiness,
    Building2,
    CalendarDays,
    FilePenLine,
    Save,
    ShieldCheck,
} from 'lucide-react';
import type { ReactNode } from 'react';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Option = {
    value: string;
    label: string;
    department?: string;
    time_in?: string;
    time_out?: string;
    work_hours_per_day?: number;
};

type EmployeeDetail = {
    id: number;
    user_id: number | null;
    employee_number: string;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    suffix: string | null;
    sex: string | null;
    civil_status: string | null;
    full_name: string;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    address_street: string | null;
    address_city: string | null;
    address_province: string | null;
    address_zip: string | null;
    tin: string | null;
    gsis_number: string | null;
    philhealth_number: string | null;
    pagibig_number: string | null;
    sss_number: string | null;
    emergency_contact_name: string | null;
    emergency_contact_relationship: string | null;
    emergency_contact_phone: string | null;
    hired_at: string | null;
    department_id: string;
    position_id: string;
    employment_type_id: string;
    employment_status_id: string;
    work_schedule_id: string;
    is_active: boolean;
};

type Props = {
    employee: EmployeeDetail;
    departments: Option[];
    positions: Option[];
    employmentTypes: Option[];
    employmentStatuses: Option[];
    workSchedules: Option[];
};

type EmployeeFormData = {
    employee_number: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    suffix: string;
    sex: string;
    civil_status: string;
    email: string;
    phone: string;
    birth_date: string;
    address_street: string;
    address_city: string;
    address_province: string;
    address_zip: string;
    tin: string;
    gsis_number: string;
    philhealth_number: string;
    pagibig_number: string;
    sss_number: string;
    emergency_contact_name: string;
    emergency_contact_relationship: string;
    emergency_contact_phone: string;
    hired_at: string;
    department_id: string;
    position_id: string;
    employment_type_id: string;
    employment_status_id: string;
    work_schedule_id: string;
    is_active: boolean;
};

const SEX_OPTIONS = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
];

const CIVIL_STATUS_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' },
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
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

export default function EditEmployee({
    employee,
    departments,
    positions,
    employmentTypes,
    employmentStatuses,
    workSchedules,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: employee.full_name, href: `/employees/${employee.id}` },
        { title: 'Edit', href: `/employees/${employee.id}/edit` },
    ];

    const form = useForm<EmployeeFormData>({
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        middle_name: employee.middle_name ?? '',
        last_name: employee.last_name,
        suffix: employee.suffix ?? '',
        sex: employee.sex ?? '',
        civil_status: employee.civil_status ?? '',
        email: employee.email ?? '',
        phone: employee.phone ?? '',
        birth_date: employee.birth_date ?? '',
        address_street: employee.address_street ?? '',
        address_city: employee.address_city ?? '',
        address_province: employee.address_province ?? '',
        address_zip: employee.address_zip ?? '',
        tin: employee.tin ?? '',
        gsis_number: employee.gsis_number ?? '',
        philhealth_number: employee.philhealth_number ?? '',
        pagibig_number: employee.pagibig_number ?? '',
        sss_number: employee.sss_number ?? '',
        emergency_contact_name: employee.emergency_contact_name ?? '',
        emergency_contact_relationship:
            employee.emergency_contact_relationship ?? '',
        emergency_contact_phone: employee.emergency_contact_phone ?? '',
        hired_at: employee.hired_at ?? '',
        department_id: employee.department_id,
        position_id: employee.position_id,
        employment_type_id: employee.employment_type_id,
        employment_status_id: employee.employment_status_id,
        work_schedule_id: employee.work_schedule_id,
        is_active: employee.is_active,
    });

    const filteredPositions = form.data.department_id
        ? positions.filter(
              (position) =>
                  departments.find(
                      (department) =>
                          department.value === form.data.department_id,
                  )?.label === position.department,
          )
        : positions;
    const selectedWorkSchedule = workSchedules.find(
        (workSchedule) => workSchedule.value === form.data.work_schedule_id,
    );

    const summaryCards = [
        {
            title: 'Edit scope',
            value: '5',
            detail: 'Personal, address, IDs, emergency contact, and assignment.',
            icon: FilePenLine,
        },
        {
            title: 'Reference options',
            value: numberFormatter.format(
                departments.length +
                    positions.length +
                    employmentTypes.length +
                    employmentStatuses.length +
                    workSchedules.length,
            ),
            detail: 'Live department, position, type, status, and schedule lists.',
            icon: Building2,
        },
        {
            title: 'Required fields',
            value: '8',
            detail: 'Core identity and employment values must stay complete.',
            icon: ShieldCheck,
        },
        {
            title: 'Record status',
            value: form.data.is_active ? 'Active' : 'Archived',
            detail: 'You can keep the profile active or mark it archived.',
            icon: BriefcaseBusiness,
        },
    ];

    function submit(): void {
        form.put(`/employees/${employee.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit - ${employee.full_name}`} />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <form
                        onSubmit={(event) => {
                            event.preventDefault();
                            submit();
                        }}
                        className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                    >
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Employee update
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Edit employee record
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {employee.full_name} ·{' '}
                                        {employee.employee_number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Update identity details, government IDs,
                                        and assignment data while keeping the
                                        record aligned with the rest of the
                                        HRIS.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={`/employees/${employee.id}`}
                                        >
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to profile
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

                        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
                            {summaryCards.map((item) => (
                                <Card
                                    key={item.title}
                                    className="@container/card"
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
                                    title="Personal information"
                                    description="Identity, civil profile, and contact details that appear across records and reports."
                                >
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <FormField
                                            label="Employee number"
                                            htmlFor="employee_number"
                                            required
                                            error={form.errors.employee_number}
                                        >
                                            <Input
                                                id="employee_number"
                                                value={
                                                    form.data.employee_number
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'employee_number',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="EMP-1002"
                                                aria-invalid={
                                                    form.errors.employee_number
                                                        ? 'true'
                                                        : 'false'
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="First name"
                                            htmlFor="first_name"
                                            required
                                            error={form.errors.first_name}
                                        >
                                            <Input
                                                id="first_name"
                                                value={form.data.first_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'first_name',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    form.errors.first_name
                                                        ? 'true'
                                                        : 'false'
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Middle name"
                                            htmlFor="middle_name"
                                            error={form.errors.middle_name}
                                        >
                                            <Input
                                                id="middle_name"
                                                value={form.data.middle_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'middle_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Last name"
                                            htmlFor="last_name"
                                            required
                                            error={form.errors.last_name}
                                        >
                                            <Input
                                                id="last_name"
                                                value={form.data.last_name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'last_name',
                                                        event.target.value,
                                                    )
                                                }
                                                aria-invalid={
                                                    form.errors.last_name
                                                        ? 'true'
                                                        : 'false'
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Suffix"
                                            htmlFor="suffix"
                                            error={form.errors.suffix}
                                        >
                                            <Input
                                                id="suffix"
                                                value={form.data.suffix}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'suffix',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Jr., Sr., III"
                                            />
                                        </FormField>
                                        <FormField
                                            label="Birth date"
                                            htmlFor="birth_date"
                                            error={form.errors.birth_date}
                                        >
                                            <DatePickerField
                                                value={form.data.birth_date}
                                                onChange={(value) =>
                                                    form.setData(
                                                        'birth_date',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pick birth date"
                                                invalid={Boolean(
                                                    form.errors.birth_date,
                                                )}
                                            />
                                        </FormField>
                                        <FormField
                                            label="Sex"
                                            error={form.errors.sex}
                                        >
                                            <Select
                                                value={form.data.sex}
                                                onValueChange={(value) =>
                                                    form.setData('sex', value)
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors.sex
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select sex" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {SEX_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField
                                            label="Civil status"
                                            error={form.errors.civil_status}
                                        >
                                            <Select
                                                value={form.data.civil_status}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'civil_status',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors.civil_status
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select civil status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {CIVIL_STATUS_OPTIONS.map(
                                                            (option) => (
                                                                <SelectItem
                                                                    key={
                                                                        option.value
                                                                    }
                                                                    value={
                                                                        option.value
                                                                    }
                                                                >
                                                                    {
                                                                        option.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField
                                            label="Email"
                                            htmlFor="email"
                                            error={form.errors.email}
                                        >
                                            <Input
                                                id="email"
                                                type="email"
                                                value={form.data.email}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Phone"
                                            htmlFor="phone"
                                            error={form.errors.phone}
                                        >
                                            <Input
                                                id="phone"
                                                value={form.data.phone}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="09XX-XXX-XXXX"
                                            />
                                        </FormField>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Address"
                                    description="Primary residence and locality information used for employee contact records."
                                >
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <div className="md:col-span-2 xl:col-span-4">
                                            <FormField
                                                label="Street / Barangay"
                                                htmlFor="address_street"
                                                error={
                                                    form.errors.address_street
                                                }
                                            >
                                                <Input
                                                    id="address_street"
                                                    value={
                                                        form.data.address_street
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'address_street',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="123 Rizal St., Brgy. San Juan"
                                                />
                                            </FormField>
                                        </div>
                                        <FormField
                                            label="City / Municipality"
                                            htmlFor="address_city"
                                            error={form.errors.address_city}
                                        >
                                            <Input
                                                id="address_city"
                                                value={form.data.address_city}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'address_city',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Province"
                                            htmlFor="address_province"
                                            error={form.errors.address_province}
                                        >
                                            <Input
                                                id="address_province"
                                                value={
                                                    form.data.address_province
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'address_province',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="ZIP code"
                                            htmlFor="address_zip"
                                            error={form.errors.address_zip}
                                        >
                                            <Input
                                                id="address_zip"
                                                value={form.data.address_zip}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'address_zip',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="0000"
                                            />
                                        </FormField>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Government IDs"
                                    description="Statutory identifiers used for payroll, benefits, and compliance references."
                                >
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                        <FormField
                                            label="TIN"
                                            htmlFor="tin"
                                            error={form.errors.tin}
                                        >
                                            <Input
                                                id="tin"
                                                value={form.data.tin}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'tin',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="000-000-000-000"
                                            />
                                        </FormField>
                                        <FormField
                                            label="GSIS number"
                                            htmlFor="gsis_number"
                                            error={form.errors.gsis_number}
                                        >
                                            <Input
                                                id="gsis_number"
                                                value={form.data.gsis_number}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'gsis_number',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="PhilHealth number"
                                            htmlFor="philhealth_number"
                                            error={
                                                form.errors.philhealth_number
                                            }
                                        >
                                            <Input
                                                id="philhealth_number"
                                                value={
                                                    form.data.philhealth_number
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'philhealth_number',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Pag-IBIG number"
                                            htmlFor="pagibig_number"
                                            error={form.errors.pagibig_number}
                                        >
                                            <Input
                                                id="pagibig_number"
                                                value={form.data.pagibig_number}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'pagibig_number',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="SSS number"
                                            htmlFor="sss_number"
                                            error={form.errors.sss_number}
                                        >
                                            <Input
                                                id="sss_number"
                                                value={form.data.sss_number}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'sss_number',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Emergency contact"
                                    description="Primary contact person and relationship for urgent employee situations."
                                >
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <FormField
                                            label="Name"
                                            htmlFor="emergency_contact_name"
                                            error={
                                                form.errors
                                                    .emergency_contact_name
                                            }
                                        >
                                            <Input
                                                id="emergency_contact_name"
                                                value={
                                                    form.data
                                                        .emergency_contact_name
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'emergency_contact_name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </FormField>
                                        <FormField
                                            label="Relationship"
                                            htmlFor="emergency_contact_relationship"
                                            error={
                                                form.errors
                                                    .emergency_contact_relationship
                                            }
                                        >
                                            <Input
                                                id="emergency_contact_relationship"
                                                value={
                                                    form.data
                                                        .emergency_contact_relationship
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'emergency_contact_relationship',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Spouse, Parent, Sibling"
                                            />
                                        </FormField>
                                        <FormField
                                            label="Phone"
                                            htmlFor="emergency_contact_phone"
                                            error={
                                                form.errors
                                                    .emergency_contact_phone
                                            }
                                        >
                                            <Input
                                                id="emergency_contact_phone"
                                                value={
                                                    form.data
                                                        .emergency_contact_phone
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'emergency_contact_phone',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="09XX-XXX-XXXX"
                                            />
                                        </FormField>
                                    </div>
                                </FormSection>

                                <FormSection
                                    title="Employment details"
                                    description="Assignment, employment classification, and start date used by the registry and downstream modules."
                                >
                                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                        <FormField
                                            label="Start date"
                                            htmlFor="hired_at"
                                            required
                                            error={form.errors.hired_at}
                                        >
                                            <DatePickerField
                                                value={form.data.hired_at}
                                                onChange={(value) =>
                                                    form.setData(
                                                        'hired_at',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pick start date"
                                                invalid={Boolean(
                                                    form.errors.hired_at,
                                                )}
                                            />
                                        </FormField>
                                        <FormField
                                            label="Department"
                                            required
                                            error={form.errors.department_id}
                                        >
                                            <Select
                                                value={form.data.department_id}
                                                onValueChange={(value) => {
                                                    form.setData(
                                                        'department_id',
                                                        value,
                                                    );
                                                    form.setData(
                                                        'position_id',
                                                        '',
                                                    );
                                                }}
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors
                                                            .department_id
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {departments.map(
                                                            (department) => (
                                                                <SelectItem
                                                                    key={
                                                                        department.value
                                                                    }
                                                                    value={
                                                                        department.value
                                                                    }
                                                                >
                                                                    {
                                                                        department.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField
                                            label="Position"
                                            required
                                            error={form.errors.position_id}
                                        >
                                            <Select
                                                value={form.data.position_id}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'position_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors.position_id
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {filteredPositions.map(
                                                            (position) => (
                                                                <SelectItem
                                                                    key={
                                                                        position.value
                                                                    }
                                                                    value={
                                                                        position.value
                                                                    }
                                                                >
                                                                    {
                                                                        position.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField
                                            label="Employment type"
                                            required
                                            error={
                                                form.errors.employment_type_id
                                            }
                                        >
                                            <Select
                                                value={
                                                    form.data.employment_type_id
                                                }
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'employment_type_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors
                                                            .employment_type_id
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {employmentTypes.map(
                                                            (
                                                                employmentType,
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        employmentType.value
                                                                    }
                                                                    value={
                                                                        employmentType.value
                                                                    }
                                                                >
                                                                    {
                                                                        employmentType.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField
                                            label="Employment status"
                                            required
                                            error={
                                                form.errors.employment_status_id
                                            }
                                        >
                                            <Select
                                                value={
                                                    form.data
                                                        .employment_status_id
                                                }
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'employment_status_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors
                                                            .employment_status_id
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {employmentStatuses.map(
                                                            (
                                                                employmentStatus,
                                                            ) => (
                                                                <SelectItem
                                                                    key={
                                                                        employmentStatus.value
                                                                    }
                                                                    value={
                                                                        employmentStatus.value
                                                                    }
                                                                >
                                                                    {
                                                                        employmentStatus.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                        <FormField
                                            label="Work schedule"
                                            error={form.errors.work_schedule_id}
                                        >
                                            <Select
                                                value={
                                                    form.data
                                                        .work_schedule_id ||
                                                    'none'
                                                }
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'work_schedule_id',
                                                        value === 'none'
                                                            ? ''
                                                            : value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger
                                                    className="w-full"
                                                    aria-invalid={
                                                        form.errors
                                                            .work_schedule_id
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                >
                                                    <SelectValue placeholder="Select schedule" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="none">
                                                            No assigned schedule
                                                        </SelectItem>
                                                        {workSchedules.map(
                                                            (workSchedule) => (
                                                                <SelectItem
                                                                    key={
                                                                        workSchedule.value
                                                                    }
                                                                    value={
                                                                        workSchedule.value
                                                                    }
                                                                >
                                                                    {
                                                                        workSchedule.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            {selectedWorkSchedule ? (
                                                <p className="text-xs text-muted-foreground">
                                                    {
                                                        selectedWorkSchedule.time_in
                                                    }{' '}
                                                    -{' '}
                                                    {
                                                        selectedWorkSchedule.time_out
                                                    }{' '}
                                                    |{' '}
                                                    {
                                                        selectedWorkSchedule.work_hours_per_day
                                                    }{' '}
                                                    hrs/day
                                                </p>
                                            ) : null}
                                        </FormField>
                                    </div>
                                </FormSection>
                            </div>

                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Record status</CardTitle>
                                        <CardDescription>
                                            Control whether this employee stays
                                            active or is marked archived.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <Badge
                                            variant={
                                                form.data.is_active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                            className="w-fit"
                                        >
                                            {form.data.is_active
                                                ? 'Active'
                                                : 'Archived'}
                                        </Badge>
                                        <p className="text-sm text-muted-foreground">
                                            Toggle this only when the employee
                                            record needs to move out of the
                                            active registry.
                                        </p>
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            type="button"
                                            variant={
                                                form.data.is_active
                                                    ? 'outline'
                                                    : 'default'
                                            }
                                            onClick={() =>
                                                form.setData(
                                                    'is_active',
                                                    !form.data.is_active,
                                                )
                                            }
                                        >
                                            {form.data.is_active
                                                ? 'Mark as archived'
                                                : 'Mark as active'}
                                        </Button>
                                    </CardFooter>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Before saving</CardTitle>
                                        <CardDescription>
                                            Complete the required identity and
                                            assignment fields before updating
                                            the employee profile.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                        <div className="flex items-start gap-2">
                                            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Confirm employee number, first
                                                name, last name, and start date.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <Building2 className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Keep the department, position,
                                                and schedule assignment aligned.
                                            </span>
                                        </div>
                                        <div className="flex items-start gap-2">
                                            <BriefcaseBusiness className="mt-0.5 size-4 shrink-0" />
                                            <span>
                                                Review employment type and
                                                status before submitting.
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
                                                href={`/employees/${employee.id}`}
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
