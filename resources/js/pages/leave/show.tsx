import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type LeaveRequestDetail = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    leave_type: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string | null;
    status: 'submitted' | 'approved' | 'rejected' | 'cancelled';
    submitted_at: string;
    actioned_by: string | null;
    actioned_at: string | null;
    remarks: string | null;
};

type Props = {
    leaveRequest: LeaveRequestDetail;
};

const statusConfig: Record<string, { label: string; className: string }> = {
    submitted: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
    approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-slate-100 text-slate-600',
    },
};

export default function LeaveShow({ leaveRequest: lr }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Leave', href: '/leave' },
        { title: `Leave #${lr.id}`, href: `/leave/${lr.id}` },
    ];

    const [approvalAction, setApprovalAction] = useState<
        'approved' | 'rejected' | null
    >(null);
    const approvalForm = useForm({ action: '', remarks: '' });
    const cancelForm = useForm({});

    const openApproval = (action: 'approved' | 'rejected') => {
        setApprovalAction(action);
        approvalForm.setData('action', action);
        approvalForm.setData('remarks', '');
    };

    const submitApproval = () => {
        approvalForm.post(`/leave/${lr.id}/approve`, {
            onSuccess: () => setApprovalAction(null),
        });
    };

    const handleCancel = () => {
        cancelForm.patch(`/leave/${lr.id}/cancel`);
    };

    const st = statusConfig[lr.status] ?? statusConfig.submitted;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Leave Request #${lr.id}`} />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                {/* Header */}
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${st.className}`}
                            >
                                {st.label}
                            </span>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    Leave request #{lr.id}
                                </h1>
                                <p className="text-sm text-slate-600">
                                    {lr.employee_name} ·{' '}
                                    {lr.employee_number}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Button asChild variant="outline">
                                <a href="/leave">
                                    <ArrowLeft className="size-4" />
                                    Back
                                </a>
                            </Button>

                            {/* Approve / Reject buttons */}
                            {lr.status === 'submitted' && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => openApproval('rejected')}
                                    >
                                        <XCircle className="size-4" />
                                        Reject
                                    </Button>
                                    <Button
                                        className="bg-green-600 hover:bg-green-700"
                                        onClick={() => openApproval('approved')}
                                    >
                                        <CheckCircle className="size-4" />
                                        Approve
                                    </Button>
                                </>
                            )}

                            {/* Cancel button */}
                            {lr.status === 'submitted' && (
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="outline">
                                            Cancel request
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Cancel leave request?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will withdraw the leave
                                                request. This action cannot be
                                                undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>
                                                Keep it
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleCancel}
                                                disabled={cancelForm.processing}
                                            >
                                                Yes, cancel
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            )}
                        </div>
                    </div>
                </section>

                {/* Approval form panel (inline) */}
                {approvalAction && (
                    <Card
                        className={`border-2 shadow-sm ${approvalAction === 'approved' ? 'border-green-200 bg-green-50/60' : 'border-red-200 bg-red-50/60'}`}
                    >
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                {approvalAction === 'approved'
                                    ? 'Approve leave request'
                                    : 'Reject leave request'}
                            </CardTitle>
                            <CardDescription>
                                {approvalAction === 'approved'
                                    ? 'Confirming approval will deduct from the employee\'s leave balance.'
                                    : 'Provide a reason for rejecting this request.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="remarks">
                                    Remarks{' '}
                                    {approvalAction === 'rejected' && (
                                        <span className="text-xs text-slate-500">
                                            (recommended)
                                        </span>
                                    )}
                                </Label>
                                <Textarea
                                    id="remarks"
                                    rows={3}
                                    value={approvalForm.data.remarks}
                                    onChange={(e) =>
                                        approvalForm.setData(
                                            'remarks',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Optional remarks..."
                                />
                                <InputError
                                    message={approvalForm.errors.remarks}
                                />
                            </div>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setApprovalAction(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={submitApproval}
                                    disabled={approvalForm.processing}
                                    className={
                                        approvalAction === 'approved'
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }
                                >
                                    Confirm{' '}
                                    {approvalAction === 'approved'
                                        ? 'approval'
                                        : 'rejection'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Details */}
                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-950">
                            Request details
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                            <DetailField label="Employee" value={lr.employee_name} />
                            <DetailField
                                label="Employee No."
                                value={lr.employee_number}
                            />
                            <DetailField label="Leave type" value={lr.leave_type} />
                            <DetailField label="Start date" value={lr.start_date} />
                            <DetailField label="End date" value={lr.end_date} />
                            <DetailField
                                label="Days requested"
                                value={`${lr.days_requested} day${lr.days_requested !== 1 ? 's' : ''}`}
                            />
                            <DetailField
                                label="Filed on"
                                value={lr.submitted_at}
                            />
                            <DetailField
                                label="Reason"
                                value={lr.reason}
                                wide
                            />
                        </dl>
                    </CardContent>
                </Card>

                {/* Action record */}
                {lr.actioned_by && (
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                Decision
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                <DetailField
                                    label="Decision"
                                    value={
                                        <span
                                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.className}`}
                                        >
                                            {st.label}
                                        </span>
                                    }
                                />
                                <DetailField
                                    label="Actioned by"
                                    value={lr.actioned_by}
                                />
                                <DetailField
                                    label="Actioned on"
                                    value={lr.actioned_at}
                                />
                                {lr.remarks && (
                                    <DetailField
                                        label="Remarks"
                                        value={lr.remarks}
                                        wide
                                    />
                                )}
                            </dl>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}

function DetailField({
    label,
    value,
    wide,
}: {
    label: string;
    value: string | number | React.ReactNode | null | undefined;
    wide?: boolean;
}) {
    return (
        <div className={`space-y-1${wide ? ' sm:col-span-2' : ''}`}>
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                {label}
            </dt>
            <dd className="text-sm text-slate-900">
                {value ?? (
                    <span className="italic text-slate-400">Not provided</span>
                )}
            </dd>
        </div>
    );
}
