import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Download,
    FileArchive,
    FileText,
    Lock,
    Search,
    ShieldAlert,
    Trash2,
    Upload,
    Users,
} from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
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
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type DocumentRecord = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    document_type: string;
    file_name: string;
    file_size: number;
    file_size_formatted: string;
    mime_type: string;
    is_confidential: boolean;
    notes: string | null;
    uploaded_by: string;
    uploaded_at: string;
};

type EmployeeOption = {
    value: string;
    label: string;
    employee_number: string;
};

type DocumentTypeOption = {
    value: string;
    label: string;
    is_confidential: boolean;
};

type Props = {
    documents: DocumentRecord[];
    employees: EmployeeOption[];
    documentTypes: DocumentTypeOption[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Documents', href: '/documents' },
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

export default function DocumentsIndex({
    documents,
    employees,
    documentTypes,
}: Props) {
    const [employeeFilter, setEmployeeFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(1);
    const [showUploadForm, setShowUploadForm] = useState(false);
    const deferredQuery = useDeferredValue(query);

    const form = useForm<{
        employee_id: string;
        document_type_id: string;
        file: File | null;
        notes: string;
        is_confidential: boolean;
    }>({
        employee_id: '',
        document_type_id: '',
        file: null,
        notes: '',
        is_confidential: false,
    });

    const deleteForm = useForm({});

    const selectedType = documentTypes.find(
        (type) => type.value === form.data.document_type_id,
    );

    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const confidentialDocuments = documents.filter(
        (document) => document.is_confidential,
    ).length;
    const documentTypesInUse = new Set(
        documents.map((document) => document.document_type),
    ).size;
    const employeesCovered = new Set(
        documents.map((document) => document.employee_id),
    ).size;

    const filteredDocuments = documents.filter((document) => {
        const matchesEmployee =
            employeeFilter === 'all' ||
            String(document.employee_id) === employeeFilter;
        const matchesType =
            typeFilter === 'all' || document.document_type === typeFilter;

        if (!matchesEmployee || !matchesType) {
            return false;
        }

        if (!normalizedQuery) {
            return true;
        }

        const searchableText = [
            document.employee_name,
            document.employee_number,
            document.document_type,
            document.file_name,
            document.uploaded_by,
            document.notes,
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
        Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE),
    );
    const currentPage = Math.min(page, totalPages);
    const pageStartIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedDocuments = filteredDocuments.slice(
        pageStartIndex,
        pageStartIndex + ITEMS_PER_PAGE,
    );
    const pageEndIndex =
        filteredDocuments.length === 0
            ? 0
            : Math.min(
                  pageStartIndex + paginatedDocuments.length,
                  filteredDocuments.length,
              );

    const summaryCards = [
        {
            title: 'Total documents',
            value: numberFormatter.format(documents.length),
            detail: `${numberFormatter.format(filteredDocuments.length)} in the current view`,
            hint: 'Registry',
            icon: FileText,
        },
        {
            title: 'Confidential files',
            value: numberFormatter.format(confidentialDocuments),
            detail: `${numberFormatter.format(documents.length - confidentialDocuments)} standard access files`,
            hint: 'Restricted',
            icon: ShieldAlert,
        },
        {
            title: 'Employees covered',
            value: numberFormatter.format(employeesCovered),
            detail: 'Active personnel with at least one stored document',
            hint: 'Coverage',
            icon: Users,
        },
        {
            title: 'Types in use',
            value: numberFormatter.format(documentTypesInUse),
            detail: `${numberFormatter.format(documentTypes.length)} active document categories available`,
            hint: 'Catalog',
            icon: FileArchive,
        },
    ];

    function handleUpload(): void {
        form.post('/documents', {
            forceFormData: true,
            onSuccess: () => {
                setShowUploadForm(false);
                form.reset();
            },
        });
    }

    function handleDelete(documentId: number): void {
        deleteForm.delete(`/documents/${documentId}`);
    }

    function resetFilters(): void {
        setQuery('');
        setEmployeeFilter('all');
        setTypeFilter('all');
    }

    function goToPage(nextPage: number): void {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Records
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Documents
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Manage uploaded employee files, filter
                                        the registry, and keep confidential
                                        records clearly identified.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button
                                        type="button"
                                        onClick={() =>
                                            setShowUploadForm(
                                                (current) => !current,
                                            )
                                        }
                                    >
                                        <Upload data-icon="inline-start" />
                                        {showUploadForm
                                            ? 'Close upload'
                                            : 'Upload document'}
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/employees">
                                            Go to employees
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

                        {showUploadForm && (
                            <div className="px-4 lg:px-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Upload document</CardTitle>
                                        <CardDescription>
                                            Attach a file to an employee record
                                            and mark it confidential when access
                                            should be restricted.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-6">
                                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="employee_id">
                                                    Employee
                                                </Label>
                                                <Select
                                                    value={
                                                        form.data.employee_id
                                                    }
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
                                                    message={
                                                        form.errors.employee_id
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="document_type_id">
                                                    Document type
                                                </Label>
                                                <Select
                                                    value={
                                                        form.data
                                                            .document_type_id
                                                    }
                                                    onValueChange={(value) => {
                                                        const type =
                                                            documentTypes.find(
                                                                (item) =>
                                                                    item.value ===
                                                                    value,
                                                            );

                                                        form.setData(
                                                            'document_type_id',
                                                            value,
                                                        );

                                                        if (
                                                            type?.is_confidential
                                                        ) {
                                                            form.setData(
                                                                'is_confidential',
                                                                true,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id="document_type_id"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectGroup>
                                                            {documentTypes.map(
                                                                (type) => (
                                                                    <SelectItem
                                                                        key={
                                                                            type.value
                                                                        }
                                                                        value={
                                                                            type.value
                                                                        }
                                                                    >
                                                                        {
                                                                            type.label
                                                                        }
                                                                    </SelectItem>
                                                                ),
                                                            )}
                                                        </SelectGroup>
                                                    </SelectContent>
                                                </Select>
                                                <InputError
                                                    message={
                                                        form.errors
                                                            .document_type_id
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="file">
                                                    File
                                                </Label>
                                                <Input
                                                    id="file"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'file',
                                                            e.target
                                                                .files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={form.errors.file}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="notes">
                                                    Notes
                                                </Label>
                                                <Input
                                                    id="notes"
                                                    value={form.data.notes}
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'notes',
                                                            e.target.value,
                                                        )
                                                    }
                                                    placeholder="Optional note"
                                                />
                                                <InputError
                                                    message={form.errors.notes}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id="is_confidential"
                                                    checked={
                                                        form.data
                                                            .is_confidential
                                                    }
                                                    disabled={
                                                        selectedType?.is_confidential
                                                    }
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        form.setData(
                                                            'is_confidential',
                                                            checked === true,
                                                        )
                                                    }
                                                />
                                                <div className="flex flex-col gap-1">
                                                    <Label htmlFor="is_confidential">
                                                        Confidential access
                                                    </Label>
                                                    <p className="text-sm text-muted-foreground">
                                                        Restrict visibility to
                                                        authorized HR staff.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {selectedType?.is_confidential && (
                                                    <Badge variant="secondary">
                                                        <Lock />
                                                        Required by type
                                                    </Badge>
                                                )}
                                                <Badge
                                                    variant={
                                                        form.data
                                                            .is_confidential
                                                            ? 'default'
                                                            : 'outline'
                                                    }
                                                >
                                                    {form.data.is_confidential
                                                        ? 'Confidential'
                                                        : 'Standard access'}
                                                </Badge>
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowUploadForm(false);
                                                    form.reset();
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="button"
                                                onClick={handleUpload}
                                                disabled={form.processing}
                                            >
                                                <Upload data-icon="inline-start" />
                                                Upload document
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        <div className="px-4 lg:px-6">
                            <Card>
                                <CardHeader>
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>Document registry</CardTitle>
                                        <CardDescription>
                                            Search files, filter by employee or
                                            type, and download or remove
                                            records.
                                        </CardDescription>
                                    </div>
                                    <CardAction>
                                        <Badge variant="secondary">
                                            {numberFormatter.format(
                                                filteredDocuments.length,
                                            )}{' '}
                                            of{' '}
                                            {numberFormatter.format(
                                                documents.length,
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
                                                placeholder="Search employee, file name, uploader, or note"
                                                aria-label="Search documents"
                                                className="pl-9"
                                            />
                                        </div>

                                        <Select
                                            value={employeeFilter}
                                            onValueChange={setEmployeeFilter}
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
                                            onValueChange={setTypeFilter}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="All types" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectItem value="all">
                                                        All types
                                                    </SelectItem>
                                                    {documentTypes.map(
                                                        (type) => (
                                                            <SelectItem
                                                                key={type.value}
                                                                value={
                                                                    type.label
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

                                    {filteredDocuments.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>
                                                            Employee
                                                        </TableHead>
                                                        <TableHead>
                                                            Type
                                                        </TableHead>
                                                        <TableHead>
                                                            File
                                                        </TableHead>
                                                        <TableHead>
                                                            Uploaded
                                                        </TableHead>
                                                        <TableHead className="text-right">
                                                            Actions
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedDocuments.map(
                                                        (document) => (
                                                            <TableRow
                                                                key={
                                                                    document.id
                                                                }
                                                            >
                                                                <TableCell className="min-w-[220px]">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="font-medium">
                                                                            {
                                                                                document.employee_name
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {
                                                                                document.employee_number
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <Badge variant="outline">
                                                                            {
                                                                                document.document_type
                                                                            }
                                                                        </Badge>
                                                                        {document.is_confidential && (
                                                                            <Badge variant="secondary">
                                                                                <Lock />
                                                                                Confidential
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="min-w-[260px]">
                                                                    <div className="flex flex-col gap-1">
                                                                        <div className="flex items-center gap-2 font-medium">
                                                                            <FileText className="size-4 text-muted-foreground" />
                                                                            {
                                                                                document.file_name
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {
                                                                                document.file_size_formatted
                                                                            }
                                                                            {document.notes
                                                                                ? ` • ${document.notes}`
                                                                                : ''}
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <div className="flex flex-col gap-1">
                                                                        <div>
                                                                            {
                                                                                document.uploaded_at
                                                                            }
                                                                        </div>
                                                                        <div className="text-sm text-muted-foreground">
                                                                            {
                                                                                document.uploaded_by
                                                                            }
                                                                        </div>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex justify-end gap-2">
                                                                        <Button
                                                                            asChild
                                                                            variant="ghost"
                                                                            size="sm"
                                                                        >
                                                                            <a
                                                                                href={`/documents/${document.id}/download`}
                                                                            >
                                                                                <Download data-icon="inline-start" />
                                                                                Download
                                                                            </a>
                                                                        </Button>

                                                                        <AlertDialog>
                                                                            <AlertDialogTrigger
                                                                                asChild
                                                                            >
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="sm"
                                                                                >
                                                                                    <Trash2 data-icon="inline-start" />
                                                                                    Delete
                                                                                </Button>
                                                                            </AlertDialogTrigger>
                                                                            <AlertDialogContent>
                                                                                <AlertDialogHeader>
                                                                                    <AlertDialogTitle>
                                                                                        Delete
                                                                                        document?
                                                                                    </AlertDialogTitle>
                                                                                    <AlertDialogDescription>
                                                                                        This
                                                                                        will
                                                                                        permanently
                                                                                        remove{' '}
                                                                                        <strong>
                                                                                            {
                                                                                                document.file_name
                                                                                            }
                                                                                        </strong>{' '}
                                                                                        from
                                                                                        the
                                                                                        system.
                                                                                    </AlertDialogDescription>
                                                                                </AlertDialogHeader>
                                                                                <AlertDialogFooter>
                                                                                    <AlertDialogCancel>
                                                                                        Cancel
                                                                                    </AlertDialogCancel>
                                                                                    <AlertDialogAction
                                                                                        onClick={() =>
                                                                                            handleDelete(
                                                                                                document.id,
                                                                                            )
                                                                                        }
                                                                                        className="bg-destructive text-white hover:bg-destructive/90"
                                                                                    >
                                                                                        Delete
                                                                                    </AlertDialogAction>
                                                                                </AlertDialogFooter>
                                                                            </AlertDialogContent>
                                                                        </AlertDialog>
                                                                    </div>
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
                                                    <FileArchive />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    {documents.length === 0
                                                        ? 'No documents yet'
                                                        : 'No matching documents'}
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    {documents.length === 0
                                                        ? 'Upload the first employee file to start building the document registry.'
                                                        : 'Adjust the search or filters to bring matching records back into view.'}
                                                </EmptyDescription>
                                            </EmptyHeader>
                                            <EmptyContent>
                                                <div className="flex flex-wrap justify-center gap-2">
                                                    {documents.length === 0 ? (
                                                        <>
                                                            <Button
                                                                type="button"
                                                                onClick={() =>
                                                                    setShowUploadForm(
                                                                        true,
                                                                    )
                                                                }
                                                            >
                                                                <Upload data-icon="inline-start" />
                                                                Upload document
                                                            </Button>
                                                            <Button
                                                                asChild
                                                                variant="outline"
                                                            >
                                                                <Link href="/employees">
                                                                    <Users data-icon="inline-start" />
                                                                    View
                                                                    employees
                                                                </Link>
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

                                    {(query ||
                                        employeeFilter !== 'all' ||
                                        typeFilter !== 'all') &&
                                        filteredDocuments.length > 0 && (
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

                                    {filteredDocuments.length > 0 && (
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
                                                    filteredDocuments.length,
                                                )}{' '}
                                                document records.
                                            </p>

                                            {filteredDocuments.length >
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
