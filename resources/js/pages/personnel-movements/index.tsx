import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Clock3,
    FileText,
    Plus,
    Search,
    Users,
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

type MovementRecord = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    movement_type: string;
    effective_date: string;
    order_number: string | null;
};

type SelectOption = { value: string; label: string };

type Props = {
    movements: MovementRecord[];
    employees: SelectOption[];
    movementTypes: SelectOption[];
    filters: { employee_id?: string; movement_type_id?: string };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Personnel Movements', href: '/personnel-movements' },
];

const ITEMS_PER_PAGE = 10;
const numberFormatter = new Intl.NumberFormat();

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

export default function PersonnelMovementsIndex({
    movements,
    employees,
    movementTypes,
    filters,
}: Props) {
    const [employeeFilter, setEmployeeFilter] = useState(
        filters.employee_id ?? 'all',
    );
    const [typeFilter, setTypeFilter] = useState(
        filters.movement_type_id ?? 'all',
    );
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const deferredQuery = useDeferredValue(query);

    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const employeesCovered = new Set(
        movements.map((movement) => movement.employee_id),
    ).size;
    const movementTypesUsed = new Set(
        movements.map((movement) => movement.movement_type),
    ).size;
    const withOrderNumber = movements.filter(
        (movement) => movement.order_number,
    ).length;

    const visibleMovements = movements.filter((movement) => {
        if (!normalizedQuery) {
            return true;
        }

        const searchableText = [
            movement.employee_name,
            movement.employee_number,
            movement.movement_type,
            movement.effective_date,
            movement.order_number,
        ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

        return searchableText.includes(normalizedQuery);
    });

    useEffect(() => {
        setPage(1);
    }, [normalizedQuery, employeeFilter, typeFilter]);

    const totalPages = Math.max(
        1,
        Math.ceil(visibleMovements.length / ITEMS_PER_PAGE),
    );
    const currentPage = Math.min(page, totalPages);
    const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedMovements = visibleMovements.slice(
        pageStartIndex,
        pageStartIndex + ITEMS_PER_PAGE,
    );
    const pageEndIndex =
        visibleMovements.length === 0
            ? 0
            : Math.min(
                  pageStartIndex + paginatedMovements.length,
                  visibleMovements.length,
              );

    const summaryCards = [
        {
            title: 'Movements in view',
            value: numberFormatter.format(visibleMovements.length),
            detail: `${numberFormatter.format(movements.length)} returned by the active server filters`,
            hint: 'Registry',
            icon: ArrowRightLeft,
        },
        {
            title: 'Employees covered',
            value: numberFormatter.format(employeesCovered),
            detail: 'Distinct employees represented in this registry',
            hint: 'Coverage',
            icon: Users,
        },
        {
            title: 'Movement types',
            value: numberFormatter.format(movementTypesUsed),
            detail: `${numberFormatter.format(movementTypes.length)} active movement categories available`,
            hint: 'Types',
            icon: FileText,
        },
        {
            title: 'With order no.',
            value: numberFormatter.format(withOrderNumber),
            detail: `${numberFormatter.format(movements.length - withOrderNumber)} entries without a reference number`,
            hint: 'Reference',
            icon: Clock3,
        },
    ];

    function applyFilters(empId: string, typeId: string): void {
        const params: Record<string, string> = {};

        if (empId && empId !== 'all') {
            params.employee_id = empId;
        }

        if (typeId && typeId !== 'all') {
            params.movement_type_id = typeId;
        }

        router.get('/personnel-movements', params, {
            preserveState: true,
            replace: true,
        });
    }

    function resetFilters(): void {
        setQuery('');
        setEmployeeFilter('all');
        setTypeFilter('all');
        router.get(
            '/personnel-movements',
            {},
            {
                preserveState: true,
                replace: true,
            },
        );
    }

    function goToPage(nextPage: number): void {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Personnel Movements" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Movements
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Movement registry
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Review promotions, transfers,
                                        separations, and status changes from a
                                        cleaner registry view.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild>
                                        <Link href="/personnel-movements/create">
                                            <Plus data-icon="inline-start" />
                                            Record movement
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
                                        <CardTitle>Movement registry</CardTitle>
                                        <CardDescription>
                                            Filter by employee or movement type,
                                            then use local search to narrow the
                                            current result set.
                                        </CardDescription>
                                    </div>
                                    <CardAction>
                                        <Badge variant="secondary">
                                            {numberFormatter.format(
                                                visibleMovements.length,
                                            )}{' '}
                                            of{' '}
                                            {numberFormatter.format(
                                                movements.length,
                                            )}{' '}
                                            shown
                                        </Badge>
                                    </CardAction>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                                value={query}
                                                onChange={(event) =>
                                                    setQuery(event.target.value)
                                                }
                                                placeholder="Search employee, number, type, date, or order no."
                                                aria-label="Search movements"
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select
                                            value={employeeFilter}
                                            onValueChange={(value) => {
                                                setEmployeeFilter(value);
                                                applyFilters(value, typeFilter);
                                            }}
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
                                                                {employee.label}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={typeFilter}
                                            onValueChange={(value) => {
                                                setTypeFilter(value);
                                                applyFilters(
                                                    employeeFilter,
                                                    value,
                                                );
                                            }}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All types
                                                    </SelectItem>
                                                    {movementTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.value}
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
                                    </div>

                                    {visibleMovements.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Employee
                                                        </TableHead>
                                                        <TableHead>
                                                            Movement type
                                                        </TableHead>
                                                        <TableHead>
                                                            Effective date
                                                        </TableHead>
                                                        <TableHead>
                                                            Order no.
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Action
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedMovements.map(
                                                        (movement) => (
                                                            <TableRow
                                                                key={
                                                                    movement.id
                                                                }
                                                            >
                                                                <TableCell className="min-w-[220px]">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="font-medium">
                                                                            {
                                                                                movement.employee_name
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {
                                                                                movement.employee_number
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge variant="outline">
                                                                        {
                                                                            movement.movement_type
                                                                        }
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock3 className="size-4 text-muted-foreground" />
                                                                        <span>
                                                                            {
                                                                                movement.effective_date
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    {movement.order_number ? (
                                                                        <Badge variant="secondary">
                                                                            {
                                                                                movement.order_number
                                                                            }
                                                                        </Badge>
                                                                    ) : (
                                                                        <span className="text-muted-foreground">
                                                                            No
                                                                            reference
                                                                        </span>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <Button
                                                                        asChild
                                                                        variant="ghost"
                                                                        size="sm"
                                                                    >
                                                                        <Link
                                                                            href={`/personnel-movements/${movement.id}`}
                                                                        >
                                                                            View
                                                                        </Link>
                                                                    </Button>
                                                                </TableCell>
                                                            </TableRow>
                                                        ),
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <Empty className="min-h-[280px] border-border bg-muted/20">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <ArrowRightLeft />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    {movements.length === 0
                                                        ? 'No movements yet'
                                                        : 'No matching movements'}
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    {movements.length === 0
                                                        ? 'Record the first personnel movement to start building the registry.'
                                                        : 'Adjust the search or reset the active filters to bring entries back into view.'}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {movements.length === 0 ? (
                                                        <Button asChild>
                                                            <Link href="/personnel-movements/create">
                                                                <Plus data-icon="inline-start" />
                                                                Record movement
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
                                        employeeFilter !== 'all' ||
                                        typeFilter !== 'all') &&
                                        visibleMovements.length > 0 && (
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

                                    {visibleMovements.length > 0 && (
                                        <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
                                            <p className="text-sm text-muted-foreground">
                                                Showing{' '}
                                                {numberFormatter.format(
                                                    pageStartIndex + 1,
                                                )}{' '}
                                                to{' '}
                                                {numberFormatter.format(
                                                    pageEndIndex,
                                                )}{' '}
                                                of{' '}
                                                {numberFormatter.format(
                                                    visibleMovements.length,
                                                )}{' '}
                                                personnel movements.
                                            </p>

                                            {visibleMovements.length >
                                                ITEMS_PER_PAGE && (
                                                <Pagination className="md:justify-end">
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                href="#"
                                                                onClick={(event) => {
                                                                    event.preventDefault();
                                                                    goToPage(
                                                                        currentPage -
                                                                            1,
                                                                    );
                                                                }}
                                                                aria-disabled={
                                                                    currentPage ===
                                                                    1
                                                                }
                                                                className={
                                                                    currentPage ===
                                                                    1
                                                                        ? 'pointer-events-none opacity-50'
                                                                        : undefined
                                                                }
                                                            />
                                                        </PaginationItem>
                                                        {paginationItems(
                                                            currentPage,
                                                            totalPages,
                                                        ).map(
                                                            (
                                                                item,
                                                                index,
                                                            ) => (
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
                                                                    goToPage(
                                                                        currentPage +
                                                                            1,
                                                                    );
                                                                }}
                                                                aria-disabled={
                                                                    currentPage ===
                                                                    totalPages
                                                                }
                                                                className={
                                                                    currentPage ===
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
