import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowRight,
    Download,
    FileArchive,
    FileText,
    Lock,
    Trash2,
    Upload,
} from 'lucide-react';
import { useState } from 'react';
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
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

export default function DocumentsIndex({
    documents,
    employees,
    documentTypes,
}: Props) {
    const [employeeFilter, setEmployeeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [showUploadForm, setShowUploadForm] = useState(false);

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
        (t) => t.value === form.data.document_type_id,
    );

    const filteredDocuments = documents.filter((doc) => {
        const matchesEmployee =
            !employeeFilter ||
            employeeFilter === 'all' ||
            String(doc.employee_id) === employeeFilter;
        const matchesType =
            !typeFilter ||
            typeFilter === 'all' ||
            doc.document_type === typeFilter;
        return matchesEmployee && matchesType;
    });

    const handleUpload = (): void => {
        form.post('/documents', {
            forceFormData: true,
            onSuccess: () => {
                setShowUploadForm(false);
                form.reset();
            },
        });
    };

    const handleDelete = (documentId: number): void => {
        deleteForm.delete(`/documents/${documentId}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Documents" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Document Management
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Employee documents
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-600">
                                    Secure storage and retrieval for appointment
                                    papers, service records, and other employee
                                    files.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button
                                onClick={() =>
                                    setShowUploadForm(!showUploadForm)
                                }
                            >
                                <Upload className="size-4" />
                                Upload document
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/employees">
                                    <ArrowRight className="size-4" />
                                    Go to employees
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {showUploadForm && (
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                Upload document
                            </CardTitle>
                            <CardDescription>
                                Attach a file to an employee's digital 201
                                record.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                                <div className="grid gap-2">
                                    <Label>Employee</Label>
                                    <Select
                                        value={form.data.employee_id}
                                        onValueChange={(value) =>
                                            form.setData('employee_id', value)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select employee" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {employees.map((employee) => (
                                                <SelectItem
                                                    key={employee.value}
                                                    value={employee.value}
                                                >
                                                    {employee.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.employee_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label>Document type</Label>
                                    <Select
                                        value={form.data.document_type_id}
                                        onValueChange={(value) => {
                                            const type = documentTypes.find(
                                                (t) => t.value === value,
                                            );
                                            form.setData('document_type_id', value);
                                            if (type?.is_confidential) {
                                                form.setData('is_confidential', true);
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {documentTypes.map((type) => (
                                                <SelectItem
                                                    key={type.value}
                                                    value={type.value}
                                                >
                                                    {type.label}
                                                    {type.is_confidential && (
                                                        <span className="ml-1 text-xs text-slate-400">
                                                            (confidential)
                                                        </span>
                                                    )}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError
                                        message={form.errors.document_type_id}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="file">File</Label>
                                    <Input
                                        id="file"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                        onChange={(e) =>
                                            form.setData(
                                                'file',
                                                e.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
                                    <InputError message={form.errors.file} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Input
                                        id="notes"
                                        value={form.data.notes}
                                        onChange={(e) =>
                                            form.setData('notes', e.target.value)
                                        }
                                        placeholder="Optional note"
                                    />
                                    <InputError message={form.errors.notes} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                                <div>
                                    <p className="text-sm font-medium text-slate-950">
                                        Confidential
                                        {selectedType?.is_confidential && (
                                            <span className="ml-2 text-xs text-amber-600">
                                                Required by document type
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Restrict visibility to authorized HR
                                        staff only.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant={
                                        form.data.is_confidential
                                            ? 'default'
                                            : 'outline'
                                    }
                                    onClick={() =>
                                        !selectedType?.is_confidential &&
                                        form.setData(
                                            'is_confidential',
                                            !form.data.is_confidential,
                                        )
                                    }
                                >
                                    {form.data.is_confidential
                                        ? 'Confidential'
                                        : 'Not confidential'}
                                </Button>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowUploadForm(false);
                                        form.reset();
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpload}
                                    disabled={form.processing}
                                >
                                    <Upload className="size-4" />
                                    Upload
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <CardTitle className="text-slate-950">
                                    Document registry
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    {filteredDocuments.length} document
                                    {filteredDocuments.length !== 1 ? 's' : ''}
                                </CardDescription>
                            </div>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Select
                                    value={employeeFilter}
                                    onValueChange={setEmployeeFilter}
                                >
                                    <SelectTrigger className="w-full sm:w-52">
                                        <SelectValue placeholder="All employees" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All employees
                                        </SelectItem>
                                        {employees.map((employee) => (
                                            <SelectItem
                                                key={employee.value}
                                                value={employee.value}
                                            >
                                                {employee.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={typeFilter}
                                    onValueChange={setTypeFilter}
                                >
                                    <SelectTrigger className="w-full sm:w-52">
                                        <SelectValue placeholder="All types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All types
                                        </SelectItem>
                                        {documentTypes.map((type) => (
                                            <SelectItem
                                                key={type.value}
                                                value={type.label}
                                            >
                                                {type.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {filteredDocuments.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
                                <FileArchive className="size-10" />
                                <p className="text-sm">No documents found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-slate-200 text-sm">
                                    <thead>
                                        <tr className="text-left text-slate-500">
                                            <th className="px-3 py-3 font-medium">
                                                Employee
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Type
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                File
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                Uploaded
                                            </th>
                                            <th className="px-3 py-3 font-medium">
                                                <span className="sr-only">
                                                    Actions
                                                </span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredDocuments.map((doc) => (
                                            <tr
                                                key={doc.id}
                                                className="align-middle"
                                            >
                                                <td className="px-3 py-3">
                                                    <div className="font-medium text-slate-950">
                                                        {doc.employee_name}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {doc.employee_number}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-1.5">
                                                        {doc.is_confidential && (
                                                            <Lock className="size-3.5 text-amber-500" />
                                                        )}
                                                        <span className="text-slate-700">
                                                            {doc.document_type}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-1.5 text-slate-700">
                                                        <FileText className="size-3.5 text-slate-400" />
                                                        {doc.file_name}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {doc.file_size_formatted}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="text-slate-700">
                                                        {doc.uploaded_at}
                                                    </div>
                                                    <div className="text-xs text-slate-400">
                                                        {doc.uploaded_by}
                                                    </div>
                                                </td>
                                                <td className="px-3 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            asChild
                                                            variant="ghost"
                                                            size="sm"
                                                        >
                                                            <a
                                                                href={`/documents/${doc.id}/download`}
                                                            >
                                                                <Download className="size-3.5" />
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
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    <Trash2 className="size-3.5" />
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
                                                                                doc.file_name
                                                                            }
                                                                        </strong>{' '}
                                                                        from the
                                                                        system.
                                                                        This
                                                                        action
                                                                        cannot
                                                                        be
                                                                        undone.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel>
                                                                        Cancel
                                                                    </AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                doc.id,
                                                                            )
                                                                        }
                                                                        className="bg-red-600 hover:bg-red-700"
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
