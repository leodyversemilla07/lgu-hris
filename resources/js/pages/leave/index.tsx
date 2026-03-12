import { Head, Link, router } from '@inertiajs/react';
import {
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Plus,
    Search,
    XCircle,
} from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type LeaveRequestRecord = {
    id: number;
    employee_id: number;
    employee_name: string;
    leave_type: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
    saved_at: string;
    submitted_at: string | null;
    recorded_at: string;
};

type EmployeeOption = { value: string; label: string };
type LeaveTypeOption = { value: string; label: string };

type Props = {
    leaveRequests: LeaveRequestRecord[];
    employees: EmployeeOption[];
    leaveTypes: LeaveTypeOption[];
    canApprove: boolean;
    filters: { status?: string; leave_type_id?: string; employee_id?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Leave', href: '/leave' },
];

const ITEMS_PER_PAGE = 10;
const numberFormatter = new Intl.NumberFormat();

const statusConfig: Record<
    LeaveRequestRecord['status'],
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    draft: { label: 'Draft', variant: 'secondary' },
    submitted: { label: 'Pending', variant: 'outline' },
    approved: { label: 'Approved', variant: 'default' },
    rejected: { label: 'Rejected', variant: 'destructive' },
    cancelled: { label: 'Cancelled', variant: 'secondary' },
};

export default function LeaveIndex({
    leaveRequests,
    employees,
    leaveTypes,
    canApprove,
    filters,
}: Props) {
    const [statusFilter, setStatusFilter] = useState(filters.status ?? 'all');
    const [typeFilter, setTypeFilter] = useState(
        filters.leave_type_id ?? 'all',
    );
    const [employeeFilter, setEmployeeFilter] = useState(
        filters.employee_id ?? 'all',
    );
    const [query, setQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const deferredQuery = useDeferredValue(query);

    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const submittedCount = leaveRequests.filter(
        (request) => request.status === 'submitted',
    ).length;
    const approvedCount = leaveRequests.filter(
        (request) => request.status === 'approved',
    ).length;
    const rejectedCount = leaveRequests.filter(
        (request) => request.status === 'rejected',
    ).length;
    const requestedDays = leaveRequests.reduce(
        (total, request) => total + request.days_requested,
        0,
    );

    const visibleLeaveRequests = leaveRequests.filter((request) => {
        if (!normalizedQuery) {
            return true;
        }

        const searchableText = [
            request.employee_name,
            request.leave_type,
            request.start_date,
            request.end_date,
            request.recorded_at,
            statusConfig[request.status].label,
        ]
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [normalizedQuery, leaveRequests.length]);

    const totalPages = Math.max(
        1,
        Math.ceil(visibleLeaveRequests.length / ITEMS_PER_PAGE),
    );
    const page = Math.min(currentPage, totalPages);
    const pageStartIndex = (page - 1) * ITEMS_PER_PAGE;
    const paginatedLeaveRequests = visibleLeaveRequests.slice(
        pageStartIndex,
        pageStartIndex + ITEMS_PER_PAGE,
    );

    const summaryCards = [
        {
            title: 'Requests in view',
            value: numberFormatter.format(visibleLeaveRequests.length),
            detail: `${numberFormatter.format(leaveRequests.length)} returned by the current server filters`,
            hint: 'Queue',
            icon: FileText,
        },
        {
            title: 'Pending approvals',
            value: numberFormatter.format(submittedCount),
            detail: `${numberFormatter.format(approvedCount)} already approved`,
            hint: 'Pending',
            icon: Clock3,
        },
        {
            title: 'Approved requests',
            value: numberFormatter.format(approvedCount),
            detail: `${numberFormatter.format(rejectedCount)} rejected or declined`,
            hint: 'Decisions',
            icon: CheckCircle2,
        },
        {
            title: 'Days requested',
            value: numberFormatter.format(requestedDays),
            detail: 'Total leave days represented in this list',
            hint: 'Duration',
            icon: CalendarDays,
        },
    ];

    function applyFilters(
        status: string,
        typeId: string,
        employeeId: string,
    ): void {
        const params: Record<string, string> = {};

        if (status && status !== 'all') {
            params.status = status;
        }

        if (typeId && typeId !== 'all') {
            params.leave_type_id = typeId;
        }

        if (employeeId && employeeId !== 'all') {
            params.employee_id = employeeId;
        }

        router.get('/leave', params, {
            preserveState: true,
            replace: true,
        });
    }

    function handleStatusChange(value: string): void {
        setStatusFilter(value);
        setCurrentPage(1);
        applyFilters(value, typeFilter, employeeFilter);
    }

    function handleTypeChange(value: string): void {
        setTypeFilter(value);
        setCurrentPage(1);
        applyFilters(statusFilter, value, employeeFilter);
    }

    function handleEmployeeChange(value: string): void {
        setEmployeeFilter(value);
        setCurrentPage(1);
        applyFilters(statusFilter, typeFilter, value);
    }

    function resetFilters(): void {
        setQuery('');
        setCurrentPage(1);
        setStatusFilter('all');
        setTypeFilter('all');
        setEmployeeFilter('all');
        router.get('/leave', {}, { preserveState: true, replace: true });
    }

    function goToPage(nextPage: number): void {
        setCurrentPage(Math.min(Math.max(nextPage, 1), totalPages));
    }

    function paginationItems(): Array<number | 'ellipsis'> {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        if (page <= 3) {
            return [1, 2, 3, 4, 'ellipsis', totalPages];
        }

        if (page >= totalPages - 2) {
            return [1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages];
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Leave
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Leave requests
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {canApprove
                                            ? 'Review filed requests, filter the queue, and move into approvals without the older custom layout.'
                                            : 'Track your leave history and file new requests from a cleaner request list.'}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild>
                                        <Link href="/leave/create">
                                            <Plus data-icon="inline-start" />
                                            File leave
                                        </Link>
                                    </Button>
                                    {canApprove && (
                                        <Button asChild variant="outline">
                                            <Link href="/leave-balances">
                                                <CalendarDays data-icon="inline-start" />
                                                Leave balances
                                            </Link>
                                        </Button>
                                    )}
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
                                            {canApprove
                                                ? 'Request queue'
                                                : 'My requests'}
                                        </CardTitle>
                                        <CardDescription>
                                            Filter by status and leave type,
                                            then use the search field to narrow
                                            the current result set.
                                        </CardDescription>
                                    </div>
                                    <CardAction>
                                        <Badge variant="secondary">
                                            {numberFormatter.format(
                                                visibleLeaveRequests.length,
                                            )}{' '}
                                            of{' '}
                                            {numberFormatter.format(
                                                leaveRequests.length,
                                            )}{' '}
                                            shown
                                        </Badge>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px] xl:grid-cols-[minmax(0,1fr)_180px_220px_240px]">
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={query}
                                                onChange={(event) =>
                                                    setQuery(event.target.value)
                                                }
                                                placeholder="Search employee, leave type, dates, or status"
                                                aria-label="Search leave requests"
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select
                                            value={statusFilter}
                                            onValueChange={handleStatusChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All statuses" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All statuses
                                                    </SelectItem>
                                                    <SelectItem value="draft">
                                                        Draft
                                                    </SelectItem>
                                                    <SelectItem value="submitted">
                                                        Pending
                                                    </SelectItem>
                                                    <SelectItem value="approved">
                                                        Approved
                                                    </SelectItem>
                                                    <SelectItem value="rejected">
                                                        Rejected
                                                    </SelectItem>
                                                    <SelectItem value="cancelled">
                                                        Cancelled
                                                    </SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={typeFilter}
                                            onValueChange={handleTypeChange}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All leave types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All types
                                                    </SelectItem>
                                                    {leaveTypes.map((type) => (
                                                        <SelectItem
                                                            key={type.value}
                                                            value={type.value}
                                                        >
                                                            {type.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        {canApprove && (
                                            <Select
                                                value={employeeFilter}
                                                onValueChange={
                                                    handleEmployeeChange
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="All employees" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="all">
                                                            All employees
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
                                                                    {
                                                                        employee.label
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    </div>

                                    {visibleLeaveRequests.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {canApprove && (
                                                            <TableHead>
                                                                Employee
                                                            </TableHead>
                                                        )}
                                                        <TableHead>
                                                            Leave type
                                                        </TableHead>
                                                        <TableHead>
                                                            Schedule
                                                        </TableHead>
                                                        <TableHead>
                                                            Days
                                                        </TableHead>
                                                        <TableHead>
                                                            Status
                                                        </TableHead>
                                                        <TableHead>
                                                            Recorded
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Action
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedLeaveRequests.map(
                                                        (leaveRequest) => {
                                                            const status =
                                                                statusConfig[
                                                                    leaveRequest
                                                                        .status
                                                                ];

                                                            return (
                                                                <TableRow
                                                                    key={
                                                                        leaveRequest.id
                                                                    }
                                                                >
                                                                    {canApprove && (
                                                                        <TableCell className="min-w-[220px] font-medium">
                                                                            {
                                                                                leaveRequest.employee_name
                                                                            }
                                                                        </TableCell>
                                                                    )}
                                                                    <TableCell>
                                                                        {
                                                                            leaveRequest.leave_type
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="min-w-[220px]">
                                                                        <div className="flex items-center gap-2">
                                                                            <Clock3 className="size-4 text-muted-foreground" />
                                                                            <span>
                                                                                {
                                                                                    leaveRequest.start_date
                                                                                }
                                                                                {leaveRequest.start_date !==
                                                                                    leaveRequest.end_date &&
                                                                                    ` - ${leaveRequest.end_date}`}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge variant="outline">
                                                                            {numberFormatter.format(
                                                                                leaveRequest.days_requested,
                                                                            )}{' '}
                                                                            day
                                                                            {leaveRequest.days_requested !==
                                                                            1
                                                                                ? 's'
                                                                                : ''}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        <Badge
                                                                            variant={
                                                                                status.variant
                                                                            }
                                                                        >
                                                                            {leaveRequest.status ===
                                                                            'rejected' ? (
                                                                                <XCircle />
                                                                            ) : leaveRequest.status ===
                                                                              'approved' ? (
                                                                                <CheckCircle2 />
                                                                            ) : leaveRequest.status ===
                                                                              'submitted' ? (
                                                                                <Clock3 />
                                                                            ) : leaveRequest.status ===
                                                                              'draft' ? (
                                                                                <FileText />
                                                                            ) : (
                                                                                <CalendarDays />
                                                                            )}
                                                                            {
                                                                                status.label
                                                                            }
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell>
                                                                        {
                                                                            leaveRequest.recorded_at
                                                                        }
                                                                    </TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button
                                                                            asChild
                                                                            variant="ghost"
                                                                            size="sm"
                                                                        >
                                                                            <Link
                                                                                href={`/leave/${leaveRequest.id}`}
                                                                            >
                                                                                View
                                                                            </Link>
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            );
                                                        },
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <Empty className="min-h-[280px] border-border bg-muted/20">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <FileText />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    {leaveRequests.length === 0
                                                        ? 'No leave requests yet'
                                                        : 'No matching requests'}
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    {leaveRequests.length === 0
                                                        ? 'File a new leave request to start building the request history.'
                                                        : 'Adjust the search or reset the current filters to bring requests back into view.'}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {leaveRequests.length ===
                                                    0 ? (
                                                        <Button asChild>
                                                            <Link href="/leave/create">
                                                                <Plus data-icon="inline-start" />
                                                                File leave
                                                            </Link>
                                                        </Button>
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

                                    {(query ||
                                        statusFilter !== 'all' ||
                                        typeFilter !== 'all' ||
                                        employeeFilter !== 'all') &&
                                        visibleLeaveRequests.length > 0 && (
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

                                    {visibleLeaveRequests.length > 0 && (
                                        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Showing{' '}
                                                {numberFormatter.format(
                                                    pageStartIndex + 1,
                                                )}{' '}
                                                to{' '}
                                                {numberFormatter.format(
                                                    Math.min(
                                                        pageStartIndex +
                                                            paginatedLeaveRequests.length,
                                                        visibleLeaveRequests.length,
                                                    ),
                                                )}{' '}
                                                of{' '}
                                                {numberFormatter.format(
                                                    visibleLeaveRequests.length,
                                                )}{' '}
                                                leave requests.
                                            </p>

                                            {visibleLeaveRequests.length >
                                                ITEMS_PER_PAGE && (
                                                <Pagination className="md:justify-end">
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                href="#"
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    goToPage(page - 1);
                                                                }}
                                                                aria-disabled={
                                                                    page === 1
                                                                }
                                                                className={
                                                                    page === 1
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : undefined
                                                                }
                                                            />
                                                        </PaginationItem>
                                                        {paginationItems().map(
                                                            (item, index) => (
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
                                                                                page
                                                                            }
                                                                            onClick={(event) => {
                                                                                event.preventDefault();
                                                                                goToPage(
                                                                                    item,
                                                                                );
                                                                            }}
                                                                        >
                                                                            {
                                                                                item
                                                                            }
                                                                        </PaginationLink>
                                                                    )}
                                                                </PaginationItem>
                                                            ),
                                                        )}
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                href="#"
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    goToPage(page + 1);
                                                                }}
                                                                aria-disabled={
                                                                    page ===
                                                                    totalPages
                                                                }
                                                                className={
                                                                    page ===
                                                                    totalPages
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : undefined
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
