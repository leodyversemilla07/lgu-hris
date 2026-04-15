import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Save,
    Search,
    ShieldCheck,
    WalletCards,
} from 'lucide-react';
import { useDeferredValue, useState } from 'react';
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
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    index as leaveBalancesIndex,
    upsert as upsertLeaveBalance,
} from '@/actions/App/Http/Controllers/LeaveBalanceController';
import { index as leaveIndex } from '@/actions/App/Http/Controllers/LeaveController';

type BalanceRow = {
    employee_id: string;
    employee_name: string;
    employee_number: string;
    leave_type_id: string;
    leave_type: string;
    max_days_per_year: number | null;
    total_days: number;
    used_days: number;
    remaining_days: number;
    balance_id: number | null;
};

type LeaveTypeOption = {
    value: string;
    label: string;
};

type Props = {
    rows: BalanceRow[];
    year: number;
    leaveTypes: LeaveTypeOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex.url() },
    { title: 'Leave', href: leaveIndex.url() },
    { title: 'Leave balances', href: leaveBalancesIndex.url() },
];

const numberFormatter = new Intl.NumberFormat();

export default function LeaveBalances({ rows, year, leaveTypes }: Props) {
    const [typeFilter, setTypeFilter] = useState('all');
    const [query, setQuery] = useState('');
    const deferredQuery = useDeferredValue(query);

    const normalizedQuery = deferredQuery.trim().toLowerCase();

    const filteredRows = rows.filter((row) => {
        const matchesType =
            typeFilter === 'all' || row.leave_type_id === typeFilter;

        if (!matchesType) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const searchableText = [
            row.employee_name,
            row.employee_number,
            row.leave_type,
        ]
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
    });

    const employeesCovered = new Set(rows.map((row) => row.employee_id)).size;
    const configuredBalances = rows.filter((row) => row.total_days > 0).length;
    const negativeBalances = rows.filter(
        (row) => row.remaining_days < 0,
    ).length;
    const totalAllocated = rows.reduce((sum, row) => sum + row.total_days, 0);

    const summaryCards = [
        {
            title: 'Employees covered',
            value: numberFormatter.format(employeesCovered),
            detail: `${numberFormatter.format(rows.length)} employee and leave-type combinations in view`,
            hint: 'Coverage',
            icon: ShieldCheck,
        },
        {
            title: 'Configured balances',
            value: numberFormatter.format(configuredBalances),
            detail: 'Rows with a total-day allocation already set',
            hint: 'Configured',
            icon: WalletCards,
        },
        {
            title: 'Allocated days',
            value: numberFormatter.format(totalAllocated),
            detail: 'Total leave days assigned across all visible rows',
            hint: 'Allocation',
            icon: CalendarDays,
        },
        {
            title: 'Negative balances',
            value: numberFormatter.format(negativeBalances),
            detail: 'Rows where used days currently exceed total allocation',
            hint: 'Attention',
            icon: Save,
        },
    ];

    function resetFilters(): void {
        setQuery('');
        setTypeFilter('all');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Balances" />

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
                                        Leave balances
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Set and review employee leave
                                        allocations for {year} from the same
                                        shared table layout used across the
                                        updated HRIS.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href={leaveIndex()}>
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to requests
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
                                    <CardFooter className="text-sm text-muted-foreground">
                                        {item.detail}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="px-4 lg:px-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>Balance registry</CardTitle>
                                        <CardDescription>
                                            Filter the registry, then update
                                            total days inline for each employee
                                            and leave type.
                                        </CardDescription>
                                    </div>
                                    <CardAction>
                                        <Badge variant="secondary">
                                            {numberFormatter.format(
                                                filteredRows.length,
                                            )}{' '}
                                            of{' '}
                                            {numberFormatter.format(
                                                rows.length,
                                            )}{' '}
                                            shown
                                        </Badge>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={query}
                                                onChange={(event) =>
                                                    setQuery(event.target.value)
                                                }
                                                placeholder="Search employee number, employee name, or leave type"
                                                aria-label="Search leave balances"
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select
                                            value={typeFilter}
                                            onValueChange={setTypeFilter}
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
                                    </div>

                                    {filteredRows.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableCaption>
                                                    Balance registry for{' '}
                                                    {numberFormatter.format(
                                                        filteredRows.length,
                                                    )}{' '}
                                                    leave balance rows.
                                                </TableCaption>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Employee
                                                        </TableHead>
                                                        <TableHead>
                                                            Leave type
                                                        </TableHead>
                                                        <TableHead>
                                                            Total days
                                                        </TableHead>
                                                        <TableHead>
                                                            Used
                                                        </TableHead>
                                                        <TableHead>
                                                            Remaining
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Action
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredRows.map((row) => (
                                                        <BalanceEditRow
                                                            key={`${row.employee_id}_${row.leave_type_id}`}
                                                            row={row}
                                                            year={year}
                                                        />
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <Empty className="min-h-70 border-border bg-muted/20">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <WalletCards />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    No matching balances
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    Adjust the search or leave
                                                    type filter to bring leave
                                                    balance rows back into view.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={resetFilters}
                                                >
                                                    Reset filters
                                                </Button>
                                            </EmptyContent>
                                        </Empty>
                                    )}

                                    {(query || typeFilter !== 'all') &&
                                    filteredRows.length > 0 ? (
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
                                    ) : null}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function BalanceEditRow({ row, year }: { row: BalanceRow; year: number }) {
    const form = useForm({
        employee_id: row.employee_id,
        leave_type_id: row.leave_type_id,
        year: String(year),
        total_days: String(row.total_days),
    });

    const remaining = Number(form.data.total_days || 0) - row.used_days;

    return (
        <TableRow>
            <TableCell className="min-w-60">
                <div className="flex flex-col gap-1">
                    <div className="font-medium">{row.employee_name}</div>
                    <div className="text-sm text-muted-foreground">
                        {row.employee_number}
                    </div>
                </div>
            </TableCell>
            <TableCell>
                <div className="flex flex-col gap-1">
                    <span>{row.leave_type}</span>
                    {row.max_days_per_year ? (
                        <span className="text-sm text-muted-foreground">
                            Limit:{' '}
                            {numberFormatter.format(row.max_days_per_year)}{' '}
                            days/year
                        </span>
                    ) : null}
                </div>
            </TableCell>
            <TableCell>
                <div className="flex max-w-28 flex-col gap-1">
                    <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={form.data.total_days}
                        onChange={(event) =>
                            form.setData('total_days', event.target.value)
                        }
                    />
                </div>
            </TableCell>
            <TableCell>{numberFormatter.format(row.used_days)}</TableCell>
            <TableCell>
                <span
                    className={
                        remaining < 0
                            ? 'font-medium text-destructive'
                            : 'text-foreground'
                    }
                >
                    {remaining.toFixed(1)}
                </span>
            </TableCell>
            <TableCell className="text-right">
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                        form.post(upsertLeaveBalance.url(), {
                            preserveState: true,
                            preserveScroll: true,
                        })
                    }
                    disabled={form.processing}
                >
                    <Save data-icon="inline-start" />
                    Save
                </Button>
            </TableCell>
        </TableRow>
    );
}
