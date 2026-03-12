import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import {
    ArrowRightLeft,
    CalendarDays,
    ClipboardList,
    Download,
    FileSpreadsheet,
    FileText,
    Users,
    Wallet,
} from 'lucide-react';
import { useState } from 'react';
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

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/reports' },
];

type SelectOption = { value: string; label: string };

type RecentExportRecord = {
    id: number;
    report_name: string;
    export_format: string;
    file_name: string;
    department: string | null;
    employee: string | null;
    exported_at: string;
    filters: Record<string, string>;
};

type Props = {
    departments: SelectOption[];
    employees: SelectOption[];
    leaveTypes: SelectOption[];
    years: SelectOption[];
    recentExports: RecentExportRecord[];
};

type ExportAction = {
    label: string;
    href: string;
    icon: typeof FileSpreadsheet;
};

function DatePickerField({
    value,
    onChange,
    placeholder,
}: {
    value?: Date;
    onChange: (value?: Date) => void;
    placeholder: string;
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                >
                    <CalendarDays data-icon="inline-start" />
                    {value ? format(value, 'PPP') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={value}
                    onSelect={onChange}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

function buildUrl(base: string, params: Record<string, string | undefined>) {
    const url = new URL(base, window.location.origin);

    Object.entries(params).forEach(([key, value]) => {
        if (value && value !== 'all') {
            url.searchParams.set(key, value);
        }
    });

    return url.pathname + url.search;
}

function downloadUrl(path: string): void {
    window.location.href = path;
}

function ExportButtons({ actions }: { actions: ExportAction[] }) {
    return (
        <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
                <Button
                    key={action.label}
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => downloadUrl(action.href)}
                >
                    <action.icon data-icon="inline-start" />
                    {action.label}
                </Button>
            ))}
        </div>
    );
}

export default function ReportsIndex({
    departments,
    employees,
    leaveTypes,
    years,
    recentExports,
}: Props) {
    const [masterlistDept, setMasterlistDept] = useState('all');
    const [masterlistStatus, setMasterlistStatus] = useState('active');
    const [plantillaDept, setPlantillaDept] = useState('all');
    const [leaveYear, setLeaveYear] = useState(
        String(new Date().getFullYear()),
    );
    const [leaveDept, setLeaveDept] = useState('all');
    const [leaveEmployee, setLeaveEmployee] = useState('all');
    const [payrollDept, setPayrollDept] = useState('all');
    const [payrollEmployee, setPayrollEmployee] = useState('all');
    const [attendYear, setAttendYear] = useState(
        String(new Date().getFullYear()),
    );
    const [attendMonth, setAttendMonth] = useState('all');
    const [attendDept, setAttendDept] = useState('all');
    const [movDateFrom, setMovDateFrom] = useState<Date>();
    const [movDateTo, setMovDateTo] = useState<Date>();
    const [movDept, setMovDept] = useState('all');
    const [movEmployee, setMovEmployee] = useState('all');
    const [srEmployee, setSrEmployee] = useState('');

    const months = [
        { value: '1', label: 'January' },
        { value: '2', label: 'February' },
        { value: '3', label: 'March' },
        { value: '4', label: 'April' },
        { value: '5', label: 'May' },
        { value: '6', label: 'June' },
        { value: '7', label: 'July' },
        { value: '8', label: 'August' },
        { value: '9', label: 'September' },
        { value: '10', label: 'October' },
        { value: '11', label: 'November' },
        { value: '12', label: 'December' },
    ];

    const summaryCards = [
        {
            title: 'Departments',
            value: departments.length.toLocaleString(),
            detail: 'Active department filters available across exports',
            hint: 'Filters',
            icon: Users,
        },
        {
            title: 'Employees',
            value: employees.length.toLocaleString(),
            detail: 'Current active employees available for report selection',
            hint: 'People',
            icon: FileText,
        },
        {
            title: 'Leave types',
            value: leaveTypes.length.toLocaleString(),
            detail: 'Reference leave categories available in the system',
            hint: 'Catalog',
            icon: CalendarDays,
        },
        {
            title: 'Year presets',
            value: years.length.toLocaleString(),
            detail: 'Available reporting years exposed to the export workspace',
            hint: 'Periods',
            icon: ClipboardList,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex max-w-4xl flex-col gap-2">
                                <Badge variant="outline" className="w-fit">
                                    Exports
                                </Badge>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    Reports
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Generate compliance-ready exports from a
                                    single workspace. Every panel keeps the
                                    existing export routes and query structure
                                    while moving the page onto the shared UI
                                    system.
                                </p>
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
                                    <CardTitle>
                                        Recent export activity
                                    </CardTitle>
                                    <CardDescription>
                                        The last five reports you generated from
                                        this workspace.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentExports.length === 0 ? (
                                        <div className="rounded-lg border border-dashed px-4 py-6 text-sm text-muted-foreground">
                                            No exports recorded yet for your
                                            account.
                                        </div>
                                    ) : (
                                        <div className="grid gap-3">
                                            {recentExports.map((exportItem) => (
                                                <div
                                                    key={exportItem.id}
                                                    className="flex flex-col gap-3 rounded-lg border px-4 py-3 md:flex-row md:items-start md:justify-between"
                                                >
                                                    <div className="space-y-1">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span className="text-sm font-medium text-foreground">
                                                                {
                                                                    exportItem.report_name
                                                                }
                                                            </span>
                                                            <Badge variant="outline">
                                                                {
                                                                    exportItem.export_format
                                                                }
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                exportItem.file_name
                                                            }
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {exportItem.employee ??
                                                                exportItem.department ??
                                                                'Organization-wide export'}
                                                        </p>
                                                    </div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {exportItem.exported_at}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid gap-4 px-4 lg:px-6 xl:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users />
                                        Personnel Masterlist
                                    </CardTitle>
                                    <CardDescription>
                                        Full list of employees with department,
                                        position, and active-status filtering.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Department
                                        </div>
                                        <Select
                                            value={masterlistDept}
                                            onValueChange={setMasterlistDept}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Departments
                                                    </SelectItem>
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
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Status
                                        </div>
                                        <Select
                                            value={masterlistStatus}
                                            onValueChange={setMasterlistStatus}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
                                                    <SelectItem value="active">
                                                        Active only
                                                    </SelectItem>
                                                    <SelectItem value="inactive">
                                                        Inactive only
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <ExportButtons
                                        actions={[
                                            {
                                                label: 'Excel',
                                                href: buildUrl(
                                                    '/exports/masterlist/excel',
                                                    {
                                                        department_id:
                                                            masterlistDept,
                                                        status: masterlistStatus,
                                                    },
                                                ),
                                                icon: FileSpreadsheet,
                                            },
                                            {
                                                label: 'CSV',
                                                href: buildUrl(
                                                    '/exports/masterlist/csv',
                                                    {
                                                        department_id:
                                                            masterlistDept,
                                                        status: masterlistStatus,
                                                    },
                                                ),
                                                icon: Download,
                                            },
                                            {
                                                label: 'PDF',
                                                href: buildUrl(
                                                    '/exports/masterlist/pdf',
                                                    {
                                                        department_id:
                                                            masterlistDept,
                                                        status: masterlistStatus,
                                                    },
                                                ),
                                                icon: FileText,
                                            },
                                        ]}
                                    />
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ClipboardList />
                                        Plantilla of Personnel
                                    </CardTitle>
                                    <CardDescription>
                                        Authorized positions with incumbents and
                                        vacancy status.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Department
                                        </div>
                                        <Select
                                            value={plantillaDept}
                                            onValueChange={setPlantillaDept}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Departments
                                                    </SelectItem>
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
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <ExportButtons
                                        actions={[
                                            {
                                                label: 'Excel',
                                                href: buildUrl(
                                                    '/exports/plantilla/excel',
                                                    {
                                                        department_id:
                                                            plantillaDept,
                                                    },
                                                ),
                                                icon: FileSpreadsheet,
                                            },
                                            {
                                                label: 'CSV',
                                                href: buildUrl(
                                                    '/exports/plantilla/csv',
                                                    {
                                                        department_id:
                                                            plantillaDept,
                                                    },
                                                ),
                                                icon: Download,
                                            },
                                            {
                                                label: 'PDF',
                                                href: buildUrl(
                                                    '/exports/plantilla/pdf',
                                                    {
                                                        department_id:
                                                            plantillaDept,
                                                    },
                                                ),
                                                icon: FileText,
                                            },
                                        ]}
                                    />
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays />
                                        Leave Ledger
                                    </CardTitle>
                                    <CardDescription>
                                        Leave requests filtered by year,
                                        department, or employee.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Year
                                        </div>
                                        <Select
                                            value={leaveYear}
                                            onValueChange={setLeaveYear}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {years.map((year) => (
                                                        <SelectItem
                                                            key={year.value}
                                                            value={year.value}
                                                        >
                                                            {year.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Department
                                        </div>
                                        <Select
                                            value={leaveDept}
                                            onValueChange={setLeaveDept}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Departments
                                                    </SelectItem>
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
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <div className="text-sm font-medium">
                                            Employee
                                        </div>
                                        <Select
                                            value={leaveEmployee}
                                            onValueChange={setLeaveEmployee}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Employees
                                                    </SelectItem>
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
                                                                {employee.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <ExportButtons
                                        actions={[
                                            {
                                                label: 'Excel',
                                                href: buildUrl(
                                                    '/exports/leave-ledger/excel',
                                                    {
                                                        year: leaveYear,
                                                        department_id:
                                                            leaveDept,
                                                        employee_id:
                                                            leaveEmployee,
                                                    },
                                                ),
                                                icon: FileSpreadsheet,
                                            },
                                            {
                                                label: 'CSV',
                                                href: buildUrl(
                                                    '/exports/leave-ledger/csv',
                                                    {
                                                        year: leaveYear,
                                                        department_id:
                                                            leaveDept,
                                                        employee_id:
                                                            leaveEmployee,
                                                    },
                                                ),
                                                icon: Download,
                                            },
                                            {
                                                label: 'PDF',
                                                href: buildUrl(
                                                    '/exports/leave-ledger/pdf',
                                                    {
                                                        year: leaveYear,
                                                        department_id:
                                                            leaveDept,
                                                        employee_id:
                                                            leaveEmployee,
                                                    },
                                                ),
                                                icon: FileText,
                                            },
                                        ]}
                                    />
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Wallet />
                                        Payroll Support Register
                                    </CardTitle>
                                    <CardDescription>
                                        Current compensation and statutory IDs
                                        used for payroll preparation and
                                        compliance references.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Department
                                        </div>
                                        <Select
                                            value={payrollDept}
                                            onValueChange={setPayrollDept}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Departments
                                                    </SelectItem>
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
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Employee
                                        </div>
                                        <Select
                                            value={payrollEmployee}
                                            onValueChange={setPayrollEmployee}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Employees
                                                    </SelectItem>
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
                                                                {employee.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <ExportButtons
                                        actions={[
                                            {
                                                label: 'Excel',
                                                href: buildUrl(
                                                    '/exports/payroll-support/excel',
                                                    {
                                                        department_id:
                                                            payrollDept,
                                                        employee_id:
                                                            payrollEmployee,
                                                    },
                                                ),
                                                icon: FileSpreadsheet,
                                            },
                                            {
                                                label: 'CSV',
                                                href: buildUrl(
                                                    '/exports/payroll-support/csv',
                                                    {
                                                        department_id:
                                                            payrollDept,
                                                        employee_id:
                                                            payrollEmployee,
                                                    },
                                                ),
                                                icon: Download,
                                            },
                                            {
                                                label: 'PDF',
                                                href: buildUrl(
                                                    '/exports/payroll-support/pdf',
                                                    {
                                                        department_id:
                                                            payrollDept,
                                                        employee_id:
                                                            payrollEmployee,
                                                    },
                                                ),
                                                icon: FileText,
                                            },
                                        ]}
                                    />
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <CalendarDays />
                                        Attendance Summary
                                    </CardTitle>
                                    <CardDescription>
                                        Monthly attendance exports with year,
                                        month, and department filters.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-3">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Year
                                        </div>
                                        <Select
                                            value={attendYear}
                                            onValueChange={setAttendYear}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {years.map((year) => (
                                                        <SelectItem
                                                            key={year.value}
                                                            value={year.value}
                                                        >
                                                            {year.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Month
                                        </div>
                                        <Select
                                            value={attendMonth}
                                            onValueChange={setAttendMonth}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All Months
                                                    </SelectItem>
                                                    {months.map((month) => (
                                                        <SelectItem
                                                            key={month.value}
                                                            value={month.value}
                                                        >
                                                            {month.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Department
                                        </div>
                                        <Select
                                            value={attendDept}
                                            onValueChange={setAttendDept}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
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
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <ExportButtons
                                        actions={[
                                            {
                                                label: 'Excel',
                                                href: buildUrl(
                                                    '/exports/attendance/excel',
                                                    {
                                                        year: attendYear,
                                                        month: attendMonth,
                                                        department_id:
                                                            attendDept,
                                                    },
                                                ),
                                                icon: FileSpreadsheet,
                                            },
                                            {
                                                label: 'CSV',
                                                href: buildUrl(
                                                    '/exports/attendance/csv',
                                                    {
                                                        year: attendYear,
                                                        month: attendMonth,
                                                        department_id:
                                                            attendDept,
                                                    },
                                                ),
                                                icon: Download,
                                            },
                                            {
                                                label: 'PDF',
                                                href: buildUrl(
                                                    '/exports/attendance/pdf',
                                                    {
                                                        year: attendYear,
                                                        month: attendMonth,
                                                        department_id:
                                                            attendDept,
                                                    },
                                                ),
                                                icon: FileText,
                                            },
                                        ]}
                                    />
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <ArrowRightLeft />
                                        Personnel Movements
                                    </CardTitle>
                                    <CardDescription>
                                        Transfers, promotions, and separations
                                        by date range, department, or employee.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-4 md:grid-cols-2">
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            From date
                                        </div>
                                        <DatePickerField
                                            value={movDateFrom}
                                            onChange={setMovDateFrom}
                                            placeholder="Pick from date"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            To date
                                        </div>
                                        <DatePickerField
                                            value={movDateTo}
                                            onChange={setMovDateTo}
                                            placeholder="Pick to date"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Department
                                        </div>
                                        <Select
                                            value={movDept}
                                            onValueChange={setMovDept}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
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
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Employee
                                        </div>
                                        <Select
                                            value={movEmployee}
                                            onValueChange={setMovEmployee}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All
                                                    </SelectItem>
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
                                                                {employee.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <ExportButtons
                                        actions={[
                                            {
                                                label: 'Excel',
                                                href: buildUrl(
                                                    '/exports/movements/excel',
                                                    {
                                                        date_from: movDateFrom
                                                            ? format(
                                                                  movDateFrom,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : undefined,
                                                        date_to: movDateTo
                                                            ? format(
                                                                  movDateTo,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : undefined,
                                                        department_id: movDept,
                                                        employee_id:
                                                            movEmployee,
                                                    },
                                                ),
                                                icon: FileSpreadsheet,
                                            },
                                            {
                                                label: 'CSV',
                                                href: buildUrl(
                                                    '/exports/movements/csv',
                                                    {
                                                        date_from: movDateFrom
                                                            ? format(
                                                                  movDateFrom,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : undefined,
                                                        date_to: movDateTo
                                                            ? format(
                                                                  movDateTo,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : undefined,
                                                        department_id: movDept,
                                                        employee_id:
                                                            movEmployee,
                                                    },
                                                ),
                                                icon: Download,
                                            },
                                            {
                                                label: 'PDF',
                                                href: buildUrl(
                                                    '/exports/movements/pdf',
                                                    {
                                                        date_from: movDateFrom
                                                            ? format(
                                                                  movDateFrom,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : undefined,
                                                        date_to: movDateTo
                                                            ? format(
                                                                  movDateTo,
                                                                  'yyyy-MM-dd',
                                                              )
                                                            : undefined,
                                                        department_id: movDept,
                                                        employee_id:
                                                            movEmployee,
                                                    },
                                                ),
                                                icon: FileText,
                                            },
                                        ]}
                                    />
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <FileText />
                                        Service Record
                                    </CardTitle>
                                    <CardDescription>
                                        Generate the individual PDF service
                                        record with compensation and movement
                                        history.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col gap-2">
                                        <div className="text-sm font-medium">
                                            Select employee
                                        </div>
                                        <Select
                                            value={srEmployee}
                                            onValueChange={setSrEmployee}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choose employee" />
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
                                                                {employee.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={!srEmployee}
                                        onClick={() =>
                                            srEmployee &&
                                            downloadUrl(
                                                `/exports/service-record/${srEmployee}/pdf`,
                                            )
                                        }
                                    >
                                        <FileText data-icon="inline-start" />
                                        Download PDF
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
