import { Head, Link, useForm } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    PaginationState,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    Archive,
    ArrowRight,
    ArrowUpDown,
    BriefcaseBusiness,
    Building2,
    ChevronDown,
    Mail,
    Search,
    Upload,
    Users,
} from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import { index as documentsIndex } from '@/actions/App/Http/Controllers/DocumentController';
import {
    create as createEmployee,
    index as employeesIndex,
    show as showEmployee,
} from '@/actions/App/Http/Controllers/EmployeeController';
import { template as importEmployeesTemplate, store as importEmployees } from '@/actions/App/Http/Controllers/ImportController';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type EmployeeRecord = {
    id: number;
    uuid: string;
    employee_number: string;
    full_name: string;
    email: string | null;
    phone: string | null;
    department: string;
    position: string;
    employment_type: string;
    employment_status: string;
    hired_at: string | null;
    is_active: boolean;
};

type Props = {
    employees: EmployeeRecord[];
};

type StatusFilter = 'all' | 'active' | 'archived';

type ColumnMeta = {
    label: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex.url() },
    { title: 'Employees', href: employeesIndex.url() },
];

const ITEMS_PER_PAGE = 10;
const numberFormatter = new Intl.NumberFormat();

const baseEmployeeColumns: ColumnDef<EmployeeRecord>[] = [
    {
        accessorKey: 'employee_number',
        meta: { label: 'Employee ID' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Employee ID
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <div className="font-mono text-sm text-muted-foreground">
                {row.original.employee_number}
            </div>
        ),
    },
    {
        accessorKey: 'full_name',
        meta: { label: 'Employee' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Employee
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => {
            const employee = row.original;

            return (
                <div className="min-w-65">
                    <div className="flex flex-col gap-1">
                        <div className="font-medium">{employee.full_name}</div>
                        <div className="text-sm text-muted-foreground">
                            {employee.email ??
                                employee.phone ??
                                'No contact information'}
                        </div>
                    </div>
                </div>
            );
        },
        enableHiding: false,
    },
    {
        accessorKey: 'department',
        meta: { label: 'Department' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Department
                <ArrowUpDown />
            </Button>
        ),
    },
    {
        accessorKey: 'position',
        meta: { label: 'Position' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Position
                <ArrowUpDown />
            </Button>
        ),
    },
    {
        accessorKey: 'employment_status',
        meta: { label: 'Employment' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Employment
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => {
            const employee = row.original;

            return (
                <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{employee.employment_type}</Badge>
                    <Badge variant="secondary">
                        {employee.employment_status}
                    </Badge>
                </div>
            );
        },
    },
    {
        accessorKey: 'hired_at',
        meta: { label: 'Start date' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Start date
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) =>
            row.original.hired_at ?? (
                <span className="text-muted-foreground">Not set</span>
            ),
    },
    {
        accessorKey: 'is_active',
        meta: { label: 'Directory status' } satisfies ColumnMeta,
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() =>
                    column.toggleSorting(column.getIsSorted() === 'asc')
                }
            >
                Directory status
                <ArrowUpDown />
            </Button>
        ),
        cell: ({ row }) => (
            <Badge variant={row.original.is_active ? 'default' : 'outline'}>
                {row.original.is_active ? (
                    'Active'
                ) : (
                    <>
                        <Archive />
                        Archived
                    </>
                )}
            </Badge>
        ),
    },
    {
        id: 'actions',
        meta: { label: 'Action' } satisfies ColumnMeta,
        header: () => <div className="text-right">Action</div>,
        cell: ({ row }) => (
            <div className="text-right">
                <Button asChild variant="ghost" size="sm">
                    <Link href={showEmployee(row.original.uuid)}>
                        View profile
                        <ArrowRight data-icon="inline-end" />
                    </Link>
                </Button>
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
];

function paginationItems(
    currentPage: number,
    totalPages: number,
): Array<number | 'ellipsis'> {
    if (totalPages <= 5) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (currentPage <= 3) {
        return [1, 2, 3, 4, 'ellipsis', totalPages];
    }

    if (currentPage >= totalPages - 2) {
        return [
            1,
            'ellipsis',
            totalPages - 3,
            totalPages - 2,
            totalPages - 1,
            totalPages,
        ];
    }

    return [
        1,
        'ellipsis',
        currentPage - 1,
        currentPage,
        currentPage + 1,
        'ellipsis',
        totalPages,
    ];
}

export default function EmployeesIndex({ employees }: Props) {
    const activeEmployees = employees.filter(
        (employee) => employee.is_active,
    ).length;
    const archivedEmployees = employees.length - activeEmployees;
    const departments = new Set(
        employees.map((employee) => employee.department),
    ).size;
    const employeesWithEmail = employees.filter(
        (employee) => employee.email,
    ).length;

    const [importOpen, setImportOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [query, setQuery] = useState('');
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<number[]>(
        [],
    );
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: ITEMS_PER_PAGE,
    });
    const deferredQuery = useDeferredValue(query);
    const importForm = useForm<{ file: File | null }>({ file: null });

    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const hasFilters = normalizedQuery.length > 0 || statusFilter !== 'all';

    const filteredEmployees = employees.filter((employee) => {
        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'active'
                ? employee.is_active
                : !employee.is_active);

        if (!matchesStatus) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const searchableText = [
            employee.full_name,
            employee.employee_number,
            employee.email,
            employee.phone,
            employee.department,
            employee.position,
            employee.employment_type,
            employee.employment_status,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
    });

    useEffect(() => {
        setPagination((current) => ({ ...current, pageIndex: 0 }));
        setSelectedEmployeeIds([]);
    }, [normalizedQuery, statusFilter]);

    const selectedEmployeeIdsSet = new Set(selectedEmployeeIds);
    const selectedFilteredCount = filteredEmployees.filter((employee) =>
        selectedEmployeeIdsSet.has(employee.id),
    ).length;

    const columns: ColumnDef<EmployeeRecord>[] = [
        {
            id: 'select',
            header: ({ table }) => {
                const pageIds = table
                    .getRowModel()
                    .rows.map((row) => row.original.id);
                const allSelected =
                    pageIds.length > 0 &&
                    pageIds.every((employeeId) =>
                        selectedEmployeeIdsSet.has(employeeId),
                    );
                const someSelected = pageIds.some((employeeId) =>
                    selectedEmployeeIdsSet.has(employeeId),
                );

                return (
                    <Checkbox
                        checked={
                            allSelected || (someSelected && 'indeterminate')
                        }
                        onCheckedChange={(value) => {
                            setSelectedEmployeeIds((current) => {
                                if (value) {
                                    return Array.from(
                                        new Set([...current, ...pageIds]),
                                    );
                                }

                                return current.filter(
                                    (employeeId) =>
                                        !pageIds.includes(employeeId),
                                );
                            });
                        }}
                        aria-label="Select all"
                    />
                );
            },
            cell: ({ row }) => {
                const employeeId = row.original.id;

                return (
                    <Checkbox
                        checked={selectedEmployeeIdsSet.has(employeeId)}
                        onCheckedChange={(value) => {
                            setSelectedEmployeeIds((current) => {
                                if (value) {
                                    return current.includes(employeeId)
                                        ? current
                                        : [...current, employeeId];
                                }

                                return current.filter(
                                    (currentEmployeeId) =>
                                        currentEmployeeId !== employeeId,
                                );
                            });
                        }}
                        aria-label="Select row"
                    />
                );
            },
            enableSorting: false,
            enableHiding: false,
        },
        ...baseEmployeeColumns,
    ];

    const table = useReactTable({
        data: filteredEmployees,
        columns,
        getRowId: (row) => String(row.id),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: { sorting, columnVisibility, pagination },
    });

    const currentPage = table.getState().pagination.pageIndex + 1;
    const totalPages = Math.max(table.getPageCount(), 1);
    const visibleRows = table.getRowModel().rows.length;
    const pageStart =
        filteredEmployees.length === 0
            ? 0
            : table.getState().pagination.pageIndex *
                  table.getState().pagination.pageSize +
              1;
    const pageEnd =
        filteredEmployees.length === 0 ? 0 : pageStart + visibleRows - 1;

    const summaryCards = [
        {
            title: 'Total records',
            value: numberFormatter.format(employees.length),
            detail: `${numberFormatter.format(filteredEmployees.length)} in the current view`,
            hint: 'Directory',
            icon: Users,
        },
        {
            title: 'Active employees',
            value: numberFormatter.format(activeEmployees),
            detail: `${numberFormatter.format(archivedEmployees)} archived entries`,
            hint: 'Status',
            icon: BriefcaseBusiness,
        },
        {
            title: 'Departments covered',
            value: numberFormatter.format(departments),
            detail: 'Units currently represented in the registry',
            hint: 'Coverage',
            icon: Building2,
        },
        {
            title: 'With email',
            value: numberFormatter.format(employeesWithEmail),
            detail: `${numberFormatter.format(employees.length - employeesWithEmail)} without contact email`,
            hint: 'Reach',
            icon: Mail,
        },
    ];

    function submitImport(e: FormEvent): void {
        e.preventDefault();

        if (!importForm.data.file) {
            return;
        }

        importForm.post(importEmployees.url(), {
            forceFormData: true,
            onSuccess: () => {
                setImportOpen(false);
                importForm.reset();
            },
        });
    }

    function resetFilters(): void {
        setQuery('');
        setStatusFilter('all');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employees" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Workforce
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Employees
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Browse the employee directory, review
                                        assignment coverage, and jump into each
                                        record from a cleaner registry view.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild>
                                        <Link href={createEmployee()}>
                                            <Users data-icon="inline-start" />
                                            Add employee
                                        </Link>
                                    </Button>

                                    <Dialog
                                        open={importOpen}
                                        onOpenChange={setImportOpen}
                                    >
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <Upload data-icon="inline-start" />
                                                Import
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    Import employees
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Upload an Excel or CSV file.
                                                    Download the{' '}
                                                    <a
                                                        href={importEmployeesTemplate.url()}
                                                        className="font-medium underline underline-offset-4"
                                                    >
                                                        template
                                                    </a>{' '}
                                                    to confirm the required
                                                    columns.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <form
                                                onSubmit={submitImport}
                                                className="flex flex-col gap-4"
                                            >
                                                <Input
                                                    type="file"
                                                    accept=".xlsx,.xls,.csv"
                                                    onChange={(e) =>
                                                        importForm.setData(
                                                            'file',
                                                            e.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                                {importForm.errors.file && (
                                                    <p className="text-xs text-destructive">
                                                        {importForm.errors.file}
                                                    </p>
                                                )}
                                                <DialogFooter>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setImportOpen(
                                                                false,
                                                            );
                                                            importForm.reset();
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                    <Button
                                                        type="submit"
                                                        disabled={
                                                            importForm.processing ||
                                                            !importForm.data
                                                                .file
                                                        }
                                                    >
                                                        Upload and import
                                                    </Button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>

                                    <Button asChild variant="outline">
                                        <Link href={documentsIndex()}>
                                            Continue to documents
                                            <ArrowRight data-icon="inline-end" />
                                        </Link>
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
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>
                                            Employee directory
                                        </CardTitle>
                                        <CardDescription>
                                            Search by employee details, sort
                                            columns, and tailor the registry
                                            view by record status.
                                        </CardDescription>
                                    </div>
                                    <CardAction>
                                        <Badge variant="secondary">
                                            {numberFormatter.format(
                                                visibleRows,
                                            )}{' '}
                                            of{' '}
                                            {numberFormatter.format(
                                                employees.length,
                                            )}{' '}
                                            shown
                                        </Badge>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                                            <div className="relative w-full lg:min-w-sm">
                                                <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    value={query}
                                                    onChange={(event) =>
                                                        setQuery(
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Search employees, departments, or positions"
                                                    aria-label="Search employees"
                                                    className="pl-9"
                                                />
                                            </div>

                                            <ToggleGroup
                                                type="single"
                                                value={statusFilter}
                                                onValueChange={(value) => {
                                                    if (value) {
                                                        setStatusFilter(
                                                            value as StatusFilter,
                                                        );
                                                    }
                                                }}
                                                variant="outline"
                                            >
                                                <ToggleGroupItem value="all">
                                                    All
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="active">
                                                    Active
                                                </ToggleGroupItem>
                                                <ToggleGroupItem value="archived">
                                                    Archived
                                                </ToggleGroupItem>
                                            </ToggleGroup>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="outline">
                                                    Columns
                                                    <ChevronDown data-icon="inline-end" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                {table
                                                    .getAllColumns()
                                                    .filter((column) =>
                                                        column.getCanHide(),
                                                    )
                                                    .map((column) => {
                                                        const meta = column
                                                            .columnDef.meta as
                                                            | ColumnMeta
                                                            | undefined;

                                                        return (
                                                            <DropdownMenuCheckboxItem
                                                                key={column.id}
                                                                checked={column.getIsVisible()}
                                                                onCheckedChange={(
                                                                    value,
                                                                ) =>
                                                                    column.toggleVisibility(
                                                                        !!value,
                                                                    )
                                                                }
                                                            >
                                                                {meta?.label ??
                                                                    column.id}
                                                            </DropdownMenuCheckboxItem>
                                                        );
                                                    })}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    {filteredEmployees.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    {table
                                                        .getHeaderGroups()
                                                        .map((headerGroup) => (
                                                            <TableRow
                                                                key={
                                                                    headerGroup.id
                                                                }
                                                            >
                                                                {headerGroup.headers.map(
                                                                    (
                                                                        header,
                                                                    ) => (
                                                                        <TableHead
                                                                            key={
                                                                                header.id
                                                                            }
                                                                        >
                                                                            {header.isPlaceholder
                                                                                ? null
                                                                                : flexRender(
                                                                                      header
                                                                                          .column
                                                                                          .columnDef
                                                                                          .header,
                                                                                      header.getContext(),
                                                                                  )}
                                                                        </TableHead>
                                                                    ),
                                                                )}
                                                            </TableRow>
                                                        ))}
                                                </TableHeader>
                                                <TableBody>
                                                    {table
                                                        .getRowModel()
                                                        .rows.map((row) => (
                                                            <TableRow
                                                                key={row.id}
                                                                data-state={
                                                                    selectedEmployeeIdsSet.has(
                                                                        row
                                                                            .original
                                                                            .id,
                                                                    ) &&
                                                                    'selected'
                                                                }
                                                            >
                                                                {row
                                                                    .getVisibleCells()
                                                                    .map(
                                                                        (
                                                                            cell,
                                                                        ) => (
                                                                            <TableCell
                                                                                key={
                                                                                    cell.id
                                                                                }
                                                                            >
                                                                                {flexRender(
                                                                                    cell
                                                                                        .column
                                                                                        .columnDef
                                                                                        .cell,
                                                                                    cell.getContext(),
                                                                                )}
                                                                            </TableCell>
                                                                        ),
                                                                    )}
                                                            </TableRow>
                                                        ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <Empty className="min-h-70 border-border bg-muted/20">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <Users />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    {employees.length === 0
                                                        ? 'No employees yet'
                                                        : 'No matching employees'}
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    {employees.length === 0
                                                        ? 'Add a record or import a template to start building the employee directory.'
                                                        : 'Adjust the search or status filter to bring records back into view.'}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {employees.length === 0 ? (
                                                        <>
                                                            <Button asChild>
                                                                <Link href={createEmployee()}>
                                                                    <Users data-icon="inline-start" />
                                                                    Add employee
                                                                </Link>
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                onClick={() =>
                                                                    setImportOpen(
                                                                        true,
                                                                    )
                                                                }
                                                            >
                                                                <Upload data-icon="inline-start" />
                                                                Import employees
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={
                                                                resetFilters
                                                            }
                                                        >
                                                            Reset filters
                                                        </Button>
                                                    )}
                                                </div>
                                            </EmptyContent>
                                        </Empty>
                                    )}

                                    {hasFilters &&
                                        filteredEmployees.length > 0 && (
                                            <div className="flex justify-end">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                >
                                                    Reset filters
                                                </Button>
                                            </div>
                                        )}

                                    {filteredEmployees.length > 0 && (
                                        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                {numberFormatter.format(
                                                    selectedFilteredCount,
                                                )}{' '}
                                                of{' '}
                                                {numberFormatter.format(
                                                    filteredEmployees.length,
                                                )}{' '}
                                                row(s) selected. Showing{' '}
                                                {numberFormatter.format(
                                                    pageStart,
                                                )}{' '}
                                                to{' '}
                                                {numberFormatter.format(
                                                    pageEnd,
                                                )}{' '}
                                                of{' '}
                                                {numberFormatter.format(
                                                    filteredEmployees.length,
                                                )}{' '}
                                                employee records.
                                            </p>

                                            {totalPages > 1 && (
                                                <Pagination className="md:justify-end">
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                href="#"
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.preventDefault();
                                                                    table.previousPage();
                                                                }}
                                                                aria-disabled={
                                                                    !table.getCanPreviousPage()
                                                                }
                                                                className={
                                                                    table.getCanPreviousPage()
                                                                        ? undefined
                                                                        : 'pointer-events-none opacity-50'
                                                                }
                                                            />
                                                        </PaginationItem>
                                                        {paginationItems(
                                                            currentPage,
                                                            totalPages,
                                                        ).map((item, index) => (
                                                            <PaginationItem
                                                                key={`${item}-${index}`}
                                                            >
                                                                {item ===
                                                                'ellipsis' ? (
                                                                    <PaginationEllipsis />
                                                                ) : (
                                                                    <PaginationLink
                                                                        href="#"
                                                                        isActive={
                                                                            item ===
                                                                            currentPage
                                                                        }
                                                                        onClick={(
                                                                            event,
                                                                        ) => {
                                                                            event.preventDefault();
                                                                            table.setPageIndex(
                                                                                item -
                                                                                    1,
                                                                            );
                                                                        }}
                                                                    >
                                                                        {item}
                                                                    </PaginationLink>
                                                                )}
                                                            </PaginationItem>
                                                        ))}
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                href="#"
                                                                onClick={(
                                                                    event,
                                                                ) => {
                                                                    event.preventDefault();
                                                                    table.nextPage();
                                                                }}
                                                                aria-disabled={
                                                                    !table.getCanNextPage()
                                                                }
                                                                className={
                                                                    table.getCanNextPage()
                                                                        ? undefined
                                                                        : 'pointer-events-none opacity-50'
                                                                }
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            )}
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
