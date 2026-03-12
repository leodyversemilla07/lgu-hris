import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRightLeft,
    Archive,
    Briefcase,
    Download,
    FileArchive,
    FileText,
    History,
    Link2,
    Lock,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    Upload,
    User,
    Wallet,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

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
    birth_date_formatted: string | null;
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
    hired_at_formatted: string | null;
    department: string;
    position: string;
    employment_type: string;
    employment_status: string;
    work_schedule: string | null;
    is_active: boolean;
    archived_at: string | null;
};

type Option = { value: string; label: string };

type DocumentRecord = {
    id: number;
    document_type: string;
    file_name: string;
    file_size_formatted: string;
    is_confidential: boolean;
    notes: string | null;
    uploaded_by: string;
    uploaded_at: string;
};

type DocumentTypeOption = {
    value: string;
    label: string;
    is_confidential: boolean;
};

type MovementRecord = {
    id: number;
    movement_type: string;
    effective_date: string;
    order_number: string | null;
    from_department: string | null;
    to_department: string | null;
    from_position: string | null;
    to_position: string | null;
    from_employment_status: string | null;
    to_employment_status: string | null;
    recorded_by: string | null;
};

type CompensationRecord = {
    grade: number;
    step: number;
    monthly_salary: string;
    allowances: string;
    deductions: string;
    effective_date: string;
} | null;

type HistoryChangeRecord = {
    label: string;
    from: string | null;
    to: string | null;
};

type HistoryRecord = {
    id: number;
    event_type: string;
    title: string;
    description: string | null;
    effective_date: string | null;
    recorded_by: string | null;
    recorded_at: string;
    changes: HistoryChangeRecord[];
    source_url: string | null;
};

type Props = {
    employee: EmployeeDetail;
    users: Option[];
    documents: DocumentRecord[];
    documentTypes: DocumentTypeOption[];
    movements: MovementRecord[];
    history: HistoryRecord[];
    compensation: CompensationRecord;
};

type SummaryCard = {
    title: string;
    value: string;
    detail: string;
    icon: LucideIcon;
};

export default function EmployeeShow({
    employee,
    users,
    documents,
    documentTypes,
    movements,
    history,
    compensation,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: employee.full_name, href: `/employees/${employee.id}` },
    ];

    const archiveForm = useForm({});
    const restoreForm = useForm({});
    const deleteDocForm = useForm({});
    const uploadForm = useForm<{
        employee_id: string;
        document_type_id: string;
        file: File | null;
        notes: string;
        is_confidential: boolean;
    }>({
        employee_id: String(employee.id),
        document_type_id: '',
        file: null,
        notes: '',
        is_confidential: false,
    });
    const linkUserForm = useForm({
        user_id: employee.user_id ? String(employee.user_id) : '',
    });

    const linkedAccountLabel =
        users.find((user) => user.value === linkUserForm.data.user_id)?.label ??
        null;
    const selectedUploadType = documentTypes.find(
        (type) => type.value === uploadForm.data.document_type_id,
    );
    const selectedUploadFileName = uploadForm.data.file?.name ?? null;
    const employeeStatus = employee.is_active ? 'Active' : 'Archived';
    const linkedStatus = employee.user_id ? 'Linked' : 'Unlinked';
    const address = [
        employee.address_street,
        employee.address_city,
        employee.address_province,
        employee.address_zip,
    ]
        .filter(Boolean)
        .join(', ');
    const summaryCards: SummaryCard[] = [
        {
            title: 'Registry status',
            value: employeeStatus,
            detail: employee.employment_status,
            icon: Briefcase,
        },
        {
            title: 'Assignment',
            value: employee.department,
            detail: employee.position,
            icon: User,
        },
        {
            title: 'User access',
            value: linkedStatus,
            detail: employee.user_id
                ? 'Connected to a system account.'
                : 'No login account linked yet.',
            icon: Link2,
        },
        {
            title: 'Records',
            value: String(documents.length + movements.length + history.length),
            detail: `${documents.length} documents, ${movements.length} movements, and ${history.length} history entries`,
            icon: FileText,
        },
    ];

    function handleUpload(): void {
        uploadForm.post('/documents', {
            forceFormData: true,
            onSuccess: () => {
                uploadForm.reset(
                    'document_type_id',
                    'file',
                    'notes',
                    'is_confidential',
                );
            },
        });
    }

    function handleArchive(): void {
        archiveForm.patch(`/employees/${employee.id}/archive`);
    }

    function handleRestore(): void {
        restoreForm.patch(`/employees/${employee.id}/restore`);
    }

    function handleDeleteDocument(documentId: number): void {
        deleteDocForm.delete(`/documents/${documentId}`);
    }

    function handleLinkUser(): void {
        linkUserForm.patch(`/employees/${employee.id}/link-user`, {
            data: {
                user_id:
                    linkUserForm.data.user_id === '' ||
                    linkUserForm.data.user_id === '0'
                        ? null
                        : linkUserForm.data.user_id,
            },
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={employee.full_name} />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Employee profile
                                    </Badge>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <h1 className="text-2xl font-semibold tracking-tight">
                                            {employee.full_name}
                                        </h1>
                                        <Badge
                                            variant={
                                                employee.is_active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {employeeStatus}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {employee.employee_number} ·{' '}
                                        {employee.position} · {employee.department}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Employment type: {employee.employment_type}
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href="/employees">
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to registry
                                        </Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={`/employees/${employee.id}/edit`}>
                                            <Pencil data-icon="inline-start" />
                                            Edit employee
                                        </Link>
                                    </Button>
                                    {employee.is_active ? (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline">
                                                    <Archive data-icon="inline-start" />
                                                    Archive
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Archive employee record?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will keep{' '}
                                                        {employee.full_name} in
                                                        the registry but mark the
                                                        profile as archived.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleArchive}
                                                        disabled={
                                                            archiveForm.processing
                                                        }
                                                    >
                                                        Archive employee
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    ) : (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline">
                                                    <RotateCcw data-icon="inline-start" />
                                                    Restore
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Restore employee record?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will reactivate{' '}
                                                        {employee.full_name} and
                                                        make the profile active
                                                        again.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleRestore}
                                                        disabled={
                                                            restoreForm.processing
                                                        }
                                                    >
                                                        Restore employee
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
                            {summaryCards.map((item) => (
                                <Card key={item.title} className="@container/card">
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
                                                Snapshot
                                            </Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardFooter className="text-sm text-muted-foreground">
                                        {item.detail}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <Tabs defaultValue="personal" className="px-4 lg:px-6">
                            <TabsList
                                variant="line"
                                className="h-auto w-full flex-wrap justify-start rounded-none border-b bg-transparent p-0"
                            >
                                <TabsTrigger value="personal" className="px-4 py-3">
                                    <User className="size-4" />
                                    Personal
                                </TabsTrigger>
                                <TabsTrigger
                                    value="employment"
                                    className="px-4 py-3"
                                >
                                    <Briefcase className="size-4" />
                                    Employment
                                </TabsTrigger>
                                <TabsTrigger
                                    value="documents"
                                    className="px-4 py-3"
                                >
                                    <FileText className="size-4" />
                                    Documents
                                </TabsTrigger>
                                <TabsTrigger
                                    value="movements"
                                    className="px-4 py-3"
                                >
                                    <ArrowRightLeft className="size-4" />
                                    Movements
                                </TabsTrigger>
                                <TabsTrigger value="history" className="px-4 py-3">
                                    <History className="size-4" />
                                    History
                                </TabsTrigger>
                                <TabsTrigger
                                    value="compensation"
                                    className="px-4 py-3"
                                >
                                    <Wallet className="size-4" />
                                    Compensation
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="personal" className="mt-6">
                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Personal information
                                            </CardTitle>
                                            <CardDescription>
                                                Identity, contact, and statutory
                                                details attached to this employee
                                                profile.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-6">
                                            <Section
                                                title="Basic details"
                                                description="Core identity and contact fields used across the registry."
                                            >
                                                <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    <Field label="First name" value={employee.first_name} />
                                                    <Field label="Middle name" value={employee.middle_name} />
                                                    <Field label="Last name" value={employee.last_name} />
                                                    <Field label="Suffix" value={employee.suffix} />
                                                    <Field label="Birth date" value={employee.birth_date_formatted} />
                                                    <Field label="Sex" value={titleCase(employee.sex)} />
                                                    <Field label="Civil status" value={titleCase(employee.civil_status)} />
                                                    <Field label="Email" value={employee.email} />
                                                    <Field label="Phone" value={employee.phone} />
                                                </dl>
                                            </Section>

                                            <Separator />

                                            <Section
                                                title="Address"
                                                description="Primary address used for communication and employee records."
                                            >
                                                <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                                                    <Field label="Street / Barangay" value={employee.address_street} />
                                                    <Field label="City / Municipality" value={employee.address_city} />
                                                    <Field label="Province" value={employee.address_province} />
                                                    <Field label="ZIP code" value={employee.address_zip} />
                                                </dl>
                                            </Section>

                                            <Separator />

                                            <Section
                                                title="Government IDs"
                                                description="Compliance references used for payroll, benefits, and statutory reporting."
                                            >
                                                <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    <Field label="TIN" value={employee.tin} />
                                                    <Field label="GSIS number" value={employee.gsis_number} />
                                                    <Field label="PhilHealth number" value={employee.philhealth_number} />
                                                    <Field label="Pag-IBIG number" value={employee.pagibig_number} />
                                                    <Field label="SSS number" value={employee.sss_number} />
                                                </dl>
                                            </Section>
                                        </CardContent>
                                    </Card>

                                    <div className="flex flex-col gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Profile summary</CardTitle>
                                                <CardDescription>
                                                    Quick-reference details for
                                                    registry review.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-4">
                                                <Field label="Current assignment" value={`${employee.position} · ${employee.department}`} />
                                                <Field label="Work schedule" value={employee.work_schedule} />
                                                <Field label="Start date" value={employee.hired_at_formatted} />
                                                <Field label="Address" value={address || null} />
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Emergency contact</CardTitle>
                                                <CardDescription>
                                                    Primary contact for urgent
                                                    employee matters.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-4">
                                                <Field label="Name" value={employee.emergency_contact_name} />
                                                <Field label="Relationship" value={employee.emergency_contact_relationship} />
                                                <Field label="Phone" value={employee.emergency_contact_phone} />
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="employment" className="mt-6">
                                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                                    <div className="flex flex-col gap-6">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Employment details
                                                </CardTitle>
                                                <CardDescription>
                                                    Assignment, classification,
                                                    and registry status.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <dl className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                                                    <Field label="Employee number" value={employee.employee_number} />
                                                    <Field label="Department" value={employee.department} />
                                                    <Field label="Position" value={employee.position} />
                                                    <Field label="Employment type" value={employee.employment_type} />
                                                    <Field label="Employment status" value={employee.employment_status} />
                                                    <Field label="Work schedule" value={employee.work_schedule} />
                                                    <Field label="Start date" value={employee.hired_at_formatted} />
                                                    {!employee.is_active && employee.archived_at ? (
                                                        <Field label="Archived on" value={employee.archived_at} />
                                                    ) : null}
                                                </dl>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>
                                                    Linked user account
                                                </CardTitle>
                                                <CardDescription>
                                                    Connect this record to a
                                                    system account.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="flex flex-col gap-4">
                                                <div className="flex flex-col gap-2">
                                                    <Label htmlFor="employee-user">
                                                        User account
                                                    </Label>
                                                    <Select
                                                        value={linkUserForm.data.user_id}
                                                        onValueChange={(value) =>
                                                            linkUserForm.setData('user_id', value)
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            id="employee-user"
                                                            className="w-full"
                                                        >
                                                            <SelectValue placeholder="Select a user account" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="0">
                                                                    No linked account
                                                                </SelectItem>
                                                                {users.map((user) => (
                                                                    <SelectItem key={user.value} value={user.value}>
                                                                        {user.label}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="flex flex-col gap-2 sm:flex-row">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        onClick={handleLinkUser}
                                                        disabled={linkUserForm.processing}
                                                    >
                                                        Save link
                                                    </Button>
                                                    <p className="text-sm text-muted-foreground">
                                                        {linkedAccountLabel ??
                                                            'No system account is currently connected.'}
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Registry lifecycle</CardTitle>
                                            <CardDescription>
                                                Current standing of this employee
                                                record in the HRIS.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-4">
                                            <Field label="Registry status" value={employeeStatus} />
                                            <Field label="Employment status" value={employee.employment_status} />
                                            <Field label="Work schedule" value={employee.work_schedule} />
                                            <Field label="User access" value={linkedStatus} />
                                            <Field label="Documents on file" value={String(documents.length)} />
                                            <Field label="Movement records" value={String(movements.length)} />
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="documents" className="mt-6">
                                <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Upload document</CardTitle>
                                            <CardDescription>
                                                Add a supporting file to this
                                                employee record.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="doc-type">
                                                    Document type
                                                </Label>
                                                <Select
                                                    value={
                                                        uploadForm.data
                                                            .document_type_id
                                                    }
                                                    onValueChange={(value) => {
                                                        const type =
                                                            documentTypes.find(
                                                                (item) =>
                                                                    item.value ===
                                                                    value,
                                                            );
                                                        uploadForm.setData(
                                                            'document_type_id',
                                                            value,
                                                        );
                                                        if (type) {
                                                            uploadForm.setData(
                                                                'is_confidential',
                                                                type.is_confidential,
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <SelectTrigger
                                                        id="doc-type"
                                                        className="w-full"
                                                    >
                                                        <SelectValue placeholder="Select a document type" />
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
                                                        uploadForm.errors
                                                            .document_type_id
                                                    }
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="doc-file">
                                                    File
                                                </Label>
                                                <Input
                                                    id="doc-file"
                                                    type="file"
                                                    className="sr-only"
                                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                                    onChange={(event) =>
                                                        uploadForm.setData(
                                                            'file',
                                                            event.target.files?.[0] ??
                                                                null,
                                                        )
                                                    }
                                                />
                                                <Empty className="gap-4 rounded-xl border border-dashed bg-muted/20 p-5">
                                                    <EmptyHeader>
                                                        <EmptyMedia variant="icon">
                                                            <Upload />
                                                        </EmptyMedia>
                                                        <EmptyTitle>
                                                            {selectedUploadFileName
                                                                ? 'File selected'
                                                                : 'Choose a file to upload'}
                                                        </EmptyTitle>
                                                        <EmptyDescription>
                                                            {selectedUploadFileName
                                                                ? selectedUploadFileName
                                                                : 'Supported formats: PDF, JPG, PNG, DOC, and DOCX.'}
                                                        </EmptyDescription>
                                                    </EmptyHeader>
                                                    <EmptyContent>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                type="button"
                                                                variant="outline"
                                                                asChild
                                                            >
                                                                <Label htmlFor="doc-file">
                                                                    Select file
                                                                </Label>
                                                            </Button>
                                                            {selectedUploadFileName ? (
                                                                <Button
                                                                    type="button"
                                                                    variant="ghost"
                                                                    onClick={() =>
                                                                        uploadForm.setData(
                                                                            'file',
                                                                            null,
                                                                        )
                                                                    }
                                                                >
                                                                    Clear
                                                                </Button>
                                                            ) : null}
                                                        </div>
                                                    </EmptyContent>
                                                </Empty>
                                                <InputError
                                                    message={uploadForm.errors.file}
                                                />
                                            </div>

                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="doc-notes">
                                                    Notes
                                                </Label>
                                                <Input
                                                    id="doc-notes"
                                                    value={uploadForm.data.notes}
                                                    onChange={(event) =>
                                                        uploadForm.setData(
                                                            'notes',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Optional notes"
                                                />
                                                <InputError
                                                    message={uploadForm.errors.notes}
                                                />
                                            </div>

                                            {selectedUploadType?.is_confidential ? (
                                                <Badge
                                                    variant="secondary"
                                                    className="w-fit"
                                                >
                                                    <Lock />
                                                    Confidential document type
                                                </Badge>
                                            ) : null}
                                        </CardContent>
                                        <CardFooter>
                                            <Button
                                                type="button"
                                                onClick={handleUpload}
                                                disabled={uploadForm.processing}
                                            >
                                                <Upload data-icon="inline-start" />
                                                Upload document
                                            </Button>
                                        </CardFooter>
                                    </Card>

                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                Uploaded documents
                                            </CardTitle>
                                            <CardDescription>
                                                {documents.length} document
                                                {documents.length === 1
                                                    ? ''
                                                    : 's'}{' '}
                                                currently stored for this
                                                profile.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {documents.length === 0 ? (
                                                <Empty>
                                                    <EmptyHeader>
                                                        <EmptyMedia variant="icon">
                                                            <FileArchive />
                                                        </EmptyMedia>
                                                        <EmptyTitle>
                                                            No documents uploaded
                                                        </EmptyTitle>
                                                        <EmptyDescription>
                                                            Add a supporting file
                                                            from the upload panel
                                                            to start building
                                                            this employee&apos;s
                                                            records.
                                                        </EmptyDescription>
                                                    </EmptyHeader>
                                                </Empty>
                                            ) : (
                                                <div className="flex flex-col gap-3">
                                                    {documents.map((document) => (
                                                        <Card
                                                            key={document.id}
                                                            className="gap-4 py-4"
                                                        >
                                                            <CardContent className="flex flex-col gap-4 px-4 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <span className="font-medium">
                                                                            {
                                                                                document.document_type
                                                                            }
                                                                        </span>
                                                                        {document.is_confidential ? (
                                                                            <Badge variant="secondary">
                                                                                <Lock />
                                                                                Confidential
                                                                            </Badge>
                                                                        ) : null}
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {
                                                                            document.file_name
                                                                        }{' '}
                                                                        ·{' '}
                                                                        {
                                                                            document.file_size_formatted
                                                                        }
                                                                    </p>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Uploaded{' '}
                                                                        {
                                                                            document.uploaded_at
                                                                        }{' '}
                                                                        by{' '}
                                                                        {
                                                                            document.uploaded_by
                                                                        }
                                                                    </p>
                                                                    {document.notes ? (
                                                                        <p className="text-sm text-muted-foreground">
                                                                            {
                                                                                document.notes
                                                                            }
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <Button
                                                                        asChild
                                                                        variant="outline"
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
                                                                        <AlertDialogTrigger asChild>
                                                                            <Button
                                                                                variant="outline"
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
                                                                                    This will
                                                                                    permanently
                                                                                    remove{' '}
                                                                                    {
                                                                                        document.file_name
                                                                                    }
                                                                                    .
                                                                                </AlertDialogDescription>
                                                                            </AlertDialogHeader>
                                                                            <AlertDialogFooter>
                                                                                <AlertDialogCancel>
                                                                                    Cancel
                                                                                </AlertDialogCancel>
                                                                                <AlertDialogAction
                                                                                    variant="destructive"
                                                                                    onClick={() =>
                                                                                        handleDeleteDocument(
                                                                                            document.id,
                                                                                        )
                                                                                    }
                                                                                    disabled={
                                                                                        deleteDocForm.processing
                                                                                    }
                                                                                >
                                                                                    Delete
                                                                                    document
                                                                                </AlertDialogAction>
                                                                            </AlertDialogFooter>
                                                                        </AlertDialogContent>
                                                                    </AlertDialog>
                                                                </div>
                                                            </CardContent>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="movements" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Movement history</CardTitle>
                                        <CardDescription>
                                            Promotions, transfers, and other
                                            personnel actions recorded for this
                                            employee.
                                        </CardDescription>
                                        <CardAction>
                                            <Button asChild size="sm">
                                                <Link
                                                    href={`/personnel-movements/create?employee_id=${employee.id}`}
                                                >
                                                    <Plus data-icon="inline-start" />
                                                    Record movement
                                                </Link>
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        {movements.length === 0 ? (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <ArrowRightLeft />
                                                    </EmptyMedia>
                                                    <EmptyTitle>
                                                        No movement records yet
                                                    </EmptyTitle>
                                                    <EmptyDescription>
                                                        Personnel actions will
                                                        appear here once a
                                                        transfer, promotion, or
                                                        status change is
                                                        recorded.
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {movements.map((movement) => (
                                                    <Card
                                                        key={movement.id}
                                                        className="gap-4 py-4"
                                                    >
                                                        <CardContent className="flex flex-col gap-4 px-4">
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Badge variant="secondary">
                                                                            {
                                                                                movement.movement_type
                                                                            }
                                                                        </Badge>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {
                                                                                movement.effective_date
                                                                            }
                                                                        </span>
                                                                        {movement.order_number ? (
                                                                            <span className="text-sm text-muted-foreground">
                                                                                {
                                                                                    movement.order_number
                                                                                }
                                                                            </span>
                                                                        ) : null}
                                                                    </div>
                                                                    <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                                                                        <MovementField
                                                                            label="Position"
                                                                            from={movement.from_position}
                                                                            to={movement.to_position}
                                                                        />
                                                                        <MovementField
                                                                            label="Department"
                                                                            from={movement.from_department}
                                                                            to={movement.to_department}
                                                                        />
                                                                        <MovementField
                                                                            label="Status"
                                                                            from={movement.from_employment_status}
                                                                            to={movement.to_employment_status}
                                                                        />
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        Recorded
                                                                        by{' '}
                                                                        {movement.recorded_by ??
                                                                            'System'}
                                                                    </p>
                                                                </div>
                                                                <Button
                                                                    asChild
                                                                    variant="outline"
                                                                    size="sm"
                                                                >
                                                                    <Link
                                                                        href={`/personnel-movements/${movement.id}`}
                                                                    >
                                                                        View
                                                                        details
                                                                    </Link>
                                                                </Button>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="history" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Employment history</CardTitle>
                                        <CardDescription>
                                            Registry milestones, employment profile changes, and personnel actions for this employee.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {history.length === 0 ? (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <History />
                                                    </EmptyMedia>
                                                    <EmptyTitle>
                                                        No employment history yet
                                                    </EmptyTitle>
                                                    <EmptyDescription>
                                                        Timeline entries will appear here as the employee profile changes over time.
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                            </Empty>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {history.map((entry) => (
                                                    <Card
                                                        key={entry.id}
                                                        className="gap-4 py-4"
                                                    >
                                                        <CardContent className="flex flex-col gap-4 px-4">
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="flex flex-col gap-2">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Badge variant="outline">
                                                                            {titleCase(
                                                                                entry.event_type.replaceAll(
                                                                                    '_',
                                                                                    ' ',
                                                                                ),
                                                                            )}
                                                                        </Badge>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {entry.effective_date ??
                                                                                entry.recorded_at}
                                                                        </span>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <h3 className="text-sm font-medium text-foreground">
                                                                            {entry.title}
                                                                        </h3>
                                                                        {entry.description ? (
                                                                            <p className="text-sm text-muted-foreground">
                                                                                {entry.description}
                                                                            </p>
                                                                        ) : null}
                                                                        <p className="text-sm text-muted-foreground">
                                                                            Recorded by{' '}
                                                                            {entry.recorded_by ??
                                                                                'System'}{' '}
                                                                            on {entry.recorded_at}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                {entry.source_url ? (
                                                                    <Button
                                                                        asChild
                                                                        variant="outline"
                                                                        size="sm"
                                                                    >
                                                                        <Link href={entry.source_url}>
                                                                            View source
                                                                        </Link>
                                                                    </Button>
                                                                ) : null}
                                                            </div>

                                                            {entry.changes.length > 0 ? (
                                                                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                                                                    {entry.changes.map((change) => (
                                                                        <MovementField
                                                                            key={`${entry.id}-${change.label}`}
                                                                            label={change.label}
                                                                            from={change.from}
                                                                            to={change.to}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            ) : null}
                                                        </CardContent>
                                                    </Card>
                                                ))}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="compensation" className="mt-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Salary and compensation
                                        </CardTitle>
                                        <CardDescription>
                                            Current salary grade and monthly
                                            compensation figures assigned to this
                                            employee.
                                        </CardDescription>
                                        <CardAction>
                                            <Button asChild size="sm">
                                                <Link
                                                    href={`/employees/${employee.id}/compensation`}
                                                >
                                                    <Plus data-icon="inline-start" />
                                                    Update salary grade
                                                </Link>
                                            </Button>
                                        </CardAction>
                                    </CardHeader>
                                    <CardContent>
                                        {!compensation ? (
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <Wallet />
                                                    </EmptyMedia>
                                                    <EmptyTitle>
                                                        No salary grade assigned
                                                    </EmptyTitle>
                                                    <EmptyDescription>
                                                        Assign a salary grade to
                                                        populate compensation
                                                        details on this page.
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                                <EmptyContent>
                                                    <Button
                                                        asChild
                                                        variant="outline"
                                                    >
                                                        <Link
                                                            href={`/employees/${employee.id}/compensation`}
                                                        >
                                                            Assign salary grade
                                                        </Link>
                                                    </Button>
                                                </EmptyContent>
                                            </Empty>
                                        ) : (
                                            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                                                <MetricCard
                                                    label="Salary grade"
                                                    value={`SG ${compensation.grade}-${compensation.step}`}
                                                    detail="Current salary grade and step."
                                                />
                                                <MetricCard
                                                    label="Monthly salary"
                                                    value={`₱${compensation.monthly_salary}`}
                                                    detail="Base monthly salary."
                                                />
                                                <MetricCard
                                                    label="Effective date"
                                                    value={compensation.effective_date}
                                                    detail="Current pay setup date."
                                                />
                                                <MetricCard
                                                    label="Allowances"
                                                    value={formatCurrency(Number(compensation.allowances))}
                                                    detail="Recurring monthly allowances."
                                                />
                                                <MetricCard
                                                    label="Deductions"
                                                    value={formatCurrency(Number(compensation.deductions))}
                                                    detail="Recurring monthly deductions."
                                                />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function Section({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="text-sm font-medium">{title}</h2>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            {children}
        </div>
    );
}

function Field({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex flex-col gap-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </dt>
            <dd className="text-sm text-foreground">
                {value ? value : <span className="text-muted-foreground">Not provided</span>}
            </dd>
        </div>
    );
}

function MovementField({
    label,
    from,
    to,
}: {
    label: string;
    from: string | null;
    to: string | null;
}) {
    if (!from && !to) {
        return null;
    }

    return (
        <div className="flex flex-col gap-1">
            <span className="font-medium text-foreground">{label}</span>
            <span>
                {from ?? '—'} → {to ?? '—'}
            </span>
        </div>
    );
}

function MetricCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}) {
    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            <span className="text-sm text-muted-foreground">{detail}</span>
        </div>
    );
}

function titleCase(value: string | null): string | null {
    if (!value) {
        return null;
    }

    return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatCurrency(value: number): string {
    return `₱${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}
