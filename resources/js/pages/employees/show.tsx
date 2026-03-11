import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRightLeft,
    Archive,
    Briefcase,
    Clock,
    Download,
    FileArchive,
    FileText,
    Lock,
    Pencil,
    Plus,
    RotateCcw,
    Trash2,
    Upload,
    User,
    Wallet,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InputError from '@/components/input-error';
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
    birth_date: string | null;
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
    hired_at: string | null;
    hired_at_formatted: string | null;
    department_id: string;
    department: string;
    position_id: string;
    position: string;
    employment_type_id: string;
    employment_type: string;
    employment_status_id: string;
    employment_status: string;
    is_active: boolean;
    archived_at: string | null;
};

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

type Props = {
    employee: EmployeeDetail;
    documents: DocumentRecord[];
    documentTypes: DocumentTypeOption[];
    movements: MovementRecord[];
    compensation: CompensationRecord;
};

export default function EmployeeShow({ employee, documents, documentTypes, movements, compensation }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: employee.full_name, href: `/employees/${employee.id}` },
    ];

    const archiveForm = useForm({});
    const restoreForm = useForm({});
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
    const deleteDocForm = useForm({});

    const handleArchive = (): void => {
        archiveForm.patch(`/employees/${employee.id}/archive`);
    };

    const handleRestore = (): void => {
        restoreForm.patch(`/employees/${employee.id}/restore`);
    };

    const selectedUploadType = documentTypes.find(
        (t) => t.value === uploadForm.data.document_type_id,
    );

    const handleUpload = (): void => {
        uploadForm.post('/documents', {
            forceFormData: true,
            onSuccess: () => {
                uploadForm.reset('document_type_id', 'file', 'notes', 'is_confidential');
            },
        });
    };

    const handleDeleteDocument = (documentId: number): void => {
        deleteDocForm.delete(`/documents/${documentId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={employee.full_name} />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge
                                className={
                                    employee.is_active
                                        ? 'bg-[#1f4e79] text-white hover:bg-[#1f4e79]'
                                        : 'bg-slate-400 text-white hover:bg-slate-400'
                                }
                            >
                                {employee.is_active ? 'Active' : 'Archived'}
                            </Badge>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    {employee.full_name}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {employee.employee_number} &middot;{' '}
                                    {employee.position} &middot;{' '}
                                    {employee.department}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Button asChild variant="outline">
                                <Link href="/employees">
                                    <ArrowLeft className="size-4" />
                                    Back to registry
                                </Link>
                            </Button>
                            <Button asChild>
                                <Link href={`/employees/${employee.id}/edit`}>
                                    <Pencil className="size-4" />
                                    Edit
                                </Link>
                            </Button>
                            {employee.is_active ? (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline">
                                            <Archive className="size-4" />
                                            Archive
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Archive employee record?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will mark{' '}
                                                {employee.full_name} as
                                                archived. The record will be
                                                retained and can be restored at
                                                any time.
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
                                            <RotateCcw className="size-4" />
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
                                                {employee.full_name} and mark
                                                them as an active employee
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
                </section>

                <Tabs defaultValue="personal">
                    <TabsList className="bg-white/80 border border-slate-200/75">
                        <TabsTrigger value="personal" className="gap-2">
                            <User className="size-4" />
                            Personal Info
                        </TabsTrigger>
                        <TabsTrigger value="employment" className="gap-2">
                            <Briefcase className="size-4" />
                            Employment Details
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="gap-2">
                            <FileText className="size-4" />
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="movements" className="gap-2">
                            <ArrowRightLeft className="size-4" />
                            Movement History
                        </TabsTrigger>
                        <TabsTrigger value="compensation" className="gap-2">
                            <Wallet className="size-4" />
                            Compensation
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="personal" className="mt-4 space-y-4">
                        <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-950">
                                    Personal information
                                </CardTitle>
                                <CardDescription>
                                    Identity and contact details for this
                                    employee record.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b pb-1">Basic Details</p>
                                    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                        <ProfileField label="First name" value={employee.first_name} />
                                        <ProfileField label="Middle name" value={employee.middle_name} />
                                        <ProfileField label="Last name" value={employee.last_name} />
                                        <ProfileField label="Suffix" value={employee.suffix} />
                                        <ProfileField label="Birth date" value={employee.birth_date_formatted} />
                                        <ProfileField label="Sex" value={employee.sex ? employee.sex.charAt(0).toUpperCase() + employee.sex.slice(1) : null} />
                                        <ProfileField label="Civil status" value={employee.civil_status ? employee.civil_status.charAt(0).toUpperCase() + employee.civil_status.slice(1) : null} />
                                        <ProfileField label="Email" value={employee.email} />
                                        <ProfileField label="Phone" value={employee.phone} />
                                    </dl>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b pb-1">Address</p>
                                    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                                        <ProfileField label="Street / Barangay" value={employee.address_street} />
                                        <ProfileField label="City / Municipality" value={employee.address_city} />
                                        <ProfileField label="Province" value={employee.address_province} />
                                        <ProfileField label="ZIP code" value={employee.address_zip} />
                                    </dl>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b pb-1">Government IDs</p>
                                    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                        <ProfileField label="TIN" value={employee.tin} />
                                        <ProfileField label="GSIS number" value={employee.gsis_number} />
                                        <ProfileField label="PhilHealth number" value={employee.philhealth_number} />
                                        <ProfileField label="Pag-IBIG number" value={employee.pagibig_number} />
                                        <ProfileField label="SSS number" value={employee.sss_number} />
                                    </dl>
                                </div>
                                <div>
                                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 border-b pb-1">Emergency Contact</p>
                                    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                                        <ProfileField label="Name" value={employee.emergency_contact_name} />
                                        <ProfileField label="Relationship" value={employee.emergency_contact_relationship} />
                                        <ProfileField label="Phone" value={employee.emergency_contact_phone} />
                                    </dl>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="employment" className="mt-4">
                        <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-950">
                                    Employment details
                                </CardTitle>
                                <CardDescription>
                                    Assignment, classification, and status
                                    information.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                    <ProfileField
                                        label="Employee number"
                                        value={employee.employee_number}
                                    />
                                    <ProfileField
                                        label="Department"
                                        value={employee.department}
                                    />
                                    <ProfileField
                                        label="Position"
                                        value={employee.position}
                                    />
                                    <ProfileField
                                        label="Employment type"
                                        value={employee.employment_type}
                                    />
                                    <ProfileField
                                        label="Employment status"
                                        value={employee.employment_status}
                                    />
                                    <ProfileField
                                        label="Start date"
                                        value={employee.hired_at_formatted}
                                    />
                                    {!employee.is_active &&
                                        employee.archived_at && (
                                            <ProfileField
                                                label="Archived on"
                                                value={employee.archived_at}
                                            />
                                        )}
                                </dl>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="documents" className="mt-4 space-y-4">
                        {/* Upload form */}
                        <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-950">
                                    Upload document
                                </CardTitle>
                                <CardDescription>
                                    Attach a file to this employee's record.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="doc-type">
                                            Document type{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Select
                                            value={
                                                uploadForm.data.document_type_id
                                            }
                                            onValueChange={(v) => {
                                                const type = documentTypes.find(
                                                    (t) => t.value === v,
                                                );
                                                uploadForm.setData(
                                                    'document_type_id',
                                                    v,
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
                                                <SelectValue placeholder="Select a type..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {documentTypes.map((t) => (
                                                    <SelectItem
                                                        key={t.value}
                                                        value={t.value}
                                                    >
                                                        {t.label}
                                                        {t.is_confidential && (
                                                            <Lock className="ml-1 inline size-3 text-amber-500" />
                                                        )}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                uploadForm.errors
                                                    .document_type_id
                                            }
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label htmlFor="doc-file">
                                            File{' '}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </Label>
                                        <Input
                                            id="doc-file"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                            onChange={(e) =>
                                                uploadForm.setData(
                                                    'file',
                                                    e.target.files?.[0] ?? null,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={uploadForm.errors.file}
                                        />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <Label htmlFor="doc-notes">Notes</Label>
                                        <Input
                                            id="doc-notes"
                                            value={uploadForm.data.notes}
                                            onChange={(e) =>
                                                uploadForm.setData(
                                                    'notes',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Optional notes..."
                                        />
                                        <InputError
                                            message={uploadForm.errors.notes}
                                        />
                                    </div>
                                </div>

                                {selectedUploadType?.is_confidential && (
                                    <p className="flex items-center gap-1.5 text-xs text-amber-600">
                                        <Lock className="size-3" />
                                        This document type is marked
                                        confidential.
                                    </p>
                                )}

                                <div className="flex justify-end">
                                    <Button
                                        onClick={handleUpload}
                                        disabled={uploadForm.processing}
                                    >
                                        <Upload className="size-4" />
                                        Upload document
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Document list */}
                        <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-950">
                                    Uploaded documents
                                </CardTitle>
                                <CardDescription>
                                    {documents.length} document
                                    {documents.length !== 1 ? 's' : ''} on
                                    file.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {documents.length === 0 ? (
                                    <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
                                        <FileArchive className="size-10" />
                                        <p className="text-sm">
                                            No documents uploaded yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between gap-4 py-3"
                                            >
                                                <div className="min-w-0 flex-1 space-y-0.5">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm font-medium text-slate-900 truncate">
                                                            {doc.document_type}
                                                        </span>
                                                        {doc.is_confidential && (
                                                            <Lock className="size-3 shrink-0 text-amber-500" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {doc.file_name} ·{' '}
                                                        {doc.file_size_formatted}{' '}
                                                        · {doc.uploaded_at} by{' '}
                                                        {doc.uploaded_by}
                                                    </p>
                                                    {doc.notes && (
                                                        <p className="text-xs text-slate-400 italic truncate">
                                                            {doc.notes}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex shrink-0 gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        asChild
                                                    >
                                                        <a
                                                            href={`/documents/${doc.id}/download`}
                                                        >
                                                            <Download className="size-4" />
                                                            Download
                                                        </a>
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger
                                                            asChild
                                                        >
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-600 hover:text-red-700"
                                                            >
                                                                <Trash2 className="size-4" />
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
                                                                    delete{' '}
                                                                    <strong>
                                                                        {
                                                                            doc.file_name
                                                                        }
                                                                    </strong>{' '}
                                                                    and cannot
                                                                    be undone.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>
                                                                    Cancel
                                                                </AlertDialogCancel>
                                                                <AlertDialogAction
                                                                    onClick={() =>
                                                                        handleDeleteDocument(
                                                                            doc.id,
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        deleteDocForm.processing
                                                                    }
                                                                    className="bg-red-600 hover:bg-red-700"
                                                                >
                                                                    Delete
                                                                    document
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="movements" className="mt-4">
                        <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-950">
                                            Movement history
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            All recorded promotions, transfers,
                                            and status changes.
                                        </CardDescription>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link
                                            href={`/personnel-movements/create?employee_id=${employee.id}`}
                                        >
                                            <Plus className="size-4" />
                                            Record movement
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {movements.length === 0 ? (
                                    <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                                        <ArrowRightLeft className="size-9" />
                                        <p className="text-sm">
                                            No movement records yet.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {movements.map((m) => (
                                            <div
                                                key={m.id}
                                                className="rounded-lg border border-slate-100 bg-slate-50/60 p-4"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Badge
                                                                variant="secondary"
                                                                className="text-xs"
                                                            >
                                                                {m.movement_type}
                                                            </Badge>
                                                            {m.order_number && (
                                                                <span className="text-xs text-slate-500">
                                                                    {m.order_number}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Clock className="size-3" />
                                                            {m.effective_date}
                                                        </div>
                                                    </div>
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                    >
                                                        <Link
                                                            href={`/personnel-movements/${m.id}`}
                                                        >
                                                            View details
                                                        </Link>
                                                    </Button>
                                                </div>
                                                <div className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                                                    {(m.from_position ||
                                                        m.to_position) && (
                                                        <div>
                                                            <p className="font-medium text-slate-500">
                                                                Position
                                                            </p>
                                                            <p className="text-slate-700">
                                                                {m.from_position ??
                                                                    '—'}{' '}
                                                                →{' '}
                                                                {m.to_position ??
                                                                    '—'}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(m.from_department ||
                                                        m.to_department) && (
                                                        <div>
                                                            <p className="font-medium text-slate-500">
                                                                Department
                                                            </p>
                                                            <p className="text-slate-700">
                                                                {m.from_department ??
                                                                    '—'}{' '}
                                                                →{' '}
                                                                {m.to_department ??
                                                                    '—'}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {(m.from_employment_status ||
                                                        m.to_employment_status) && (
                                                        <div>
                                                            <p className="font-medium text-slate-500">
                                                                Status
                                                            </p>
                                                            <p className="text-slate-700">
                                                                {m.from_employment_status ??
                                                                    '—'}{' '}
                                                                →{' '}
                                                                {m.to_employment_status ??
                                                                    '—'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="compensation" className="mt-4">
                        <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-slate-950">
                                            Salary &amp; compensation
                                        </CardTitle>
                                        <CardDescription className="mt-1">
                                            Current salary grade and
                                            compensation details.
                                        </CardDescription>
                                    </div>
                                    <Button asChild size="sm">
                                        <Link
                                            href={`/employees/${employee.id}/compensation`}
                                        >
                                            <Plus className="size-4" />
                                            Update salary grade
                                        </Link>
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {!compensation ? (
                                    <div className="flex flex-col items-center gap-3 py-10 text-slate-400">
                                        <Wallet className="size-9" />
                                        <p className="text-sm">
                                            No salary grade assigned yet.
                                        </p>
                                        <Button asChild variant="outline" size="sm">
                                            <Link
                                                href={`/employees/${employee.id}/compensation`}
                                            >
                                                Assign salary grade
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Salary grade / Step
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold text-slate-900">
                                                SG {compensation.grade}–
                                                {compensation.step}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Monthly salary
                                            </p>
                                            <p className="mt-1 text-2xl font-semibold text-slate-900">
                                                ₱{compensation.monthly_salary}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                Effective date
                                            </p>
                                            <p className="mt-1 text-lg font-medium text-slate-900">
                                                {compensation.effective_date}
                                            </p>
                                        </div>
                                        {parseFloat(String(compensation.allowances)) > 0 && (
                                            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Monthly allowances
                                                </p>
                                                <p className="mt-1 text-lg font-medium text-emerald-700">
                                                    +₱{parseFloat(String(compensation.allowances)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        )}
                                        {parseFloat(String(compensation.deductions)) > 0 && (
                                            <div className="rounded-lg border border-slate-100 bg-slate-50/60 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                                    Monthly deductions
                                                </p>
                                                <p className="mt-1 text-lg font-medium text-red-600">
                                                    -₱{parseFloat(String(compensation.deductions)).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </AppLayout>
    );
}

function ProfileField({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="space-y-1">
            <dt className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                {label}
            </dt>
            <dd className="text-sm text-slate-900">
                {value ?? (
                    <span className="text-slate-400 italic">Not provided</span>
                )}
            </dd>
        </div>
    );
}
