import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import type { ReactNode } from 'react';
import InputError from '@/components/input-error';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    approve as approveLeave,
    cancel as cancelLeave,
    index as leaveIndex,
    show as leaveShow,
    submit as submitLeave,
} from '@/actions/App/Http/Controllers/LeaveController';

type LeaveRequestDetail = {
    id: number;
    uuid: string;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    leave_type: string;
    leave_type_id: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    reason: string | null;
    status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'cancelled';
    saved_at: string;
    submitted_at: string | null;
    actioned_by: string | null;
    actioned_at: string | null;
    remarks: string | null;
};

type ApprovalHistoryRecord = {
    id: number;
    action: 'submitted' | 'approved' | 'rejected' | 'cancelled';
    remarks: string | null;
    acted_by: string | null;
    acted_at: string;
};

type Props = {
    leaveRequest: LeaveRequestDetail;
    approvalHistory: ApprovalHistoryRecord[];
    canApprove: boolean;
    canSubmit: boolean;
    canCancel: boolean;
};

const statusConfig: Record<
    LeaveRequestDetail['status'],
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
        summary: string;
    }
> = {
    draft: {
        label: 'Draft',
        variant: 'secondary',
        summary: 'Saved and not yet submitted for approval.',
    },
    submitted: {
        label: 'Pending',
        variant: 'outline',
        summary: 'Waiting for final action.',
    },
    approved: {
        label: 'Approved',
        variant: 'default',
        summary: 'Approved and ready for scheduling.',
    },
    rejected: {
        label: 'Rejected',
        variant: 'destructive',
        summary: 'Closed without approval.',
    },
    cancelled: {
        label: 'Cancelled',
        variant: 'secondary',
        summary: 'Withdrawn before final approval.',
    },
};

export default function LeaveShow({
    leaveRequest: leaveRequest,
    approvalHistory,
    canApprove,
    canSubmit,
    canCancel,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: dashboardIndex.url() },
        { title: 'Leave', href: leaveIndex.url() },
        {
            title: `Leave #${leaveRequest.id}`,
            href: leaveShow.url(leaveRequest.uuid),
        },
    ];

    const [approvalAction, setApprovalAction] = useState<
        'approved' | 'rejected' | null
    >(null);
    const approvalForm = useForm({ action: '', remarks: '' });
    const submitForm = useForm({});
    const cancelForm = useForm({});
    const status = statusConfig[leaveRequest.status];
    const isDraft = leaveRequest.status === 'draft';
    const lifecycleLabel = isDraft ? 'Saved on' : 'Filed on';
    const lifecycleValue = isDraft
        ? leaveRequest.saved_at
        : (leaveRequest.submitted_at ?? leaveRequest.saved_at);

    const summaryCards = [
        {
            title: 'Status',
            value: status.label,
            detail: status.summary,
            icon: Clock3,
        },
        {
            title: 'Leave type',
            value: leaveRequest.leave_type,
            detail: `Request #${leaveRequest.id}`,
            icon: FileText,
        },
        {
            title: 'Duration',
            value: `${leaveRequest.days_requested} day${leaveRequest.days_requested !== 1 ? 's' : ''}`,
            detail: `${leaveRequest.start_date} to ${leaveRequest.end_date}`,
            icon: CalendarDays,
        },
        {
            title: lifecycleLabel,
            value: lifecycleValue,
            detail: leaveRequest.employee_number,
            icon: CheckCircle2,
        },
    ];

    function openApproval(action: 'approved' | 'rejected'): void {
        setApprovalAction(action);
        approvalForm.setData('action', action);
        approvalForm.setData('remarks', '');
    }

    function submitApproval(): void {
        approvalForm.post(approveLeave.url(leaveRequest.uuid), {
            onSuccess: () => setApprovalAction(null),
        });
    }

    function handleSubmit(): void {
        submitForm.post(submitLeave.url(leaveRequest.uuid));
    }

    function handleCancel(): void {
        cancelForm.patch(cancelLeave.url(leaveRequest.uuid));
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Leave Request #${leaveRequest.id}`} />

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
                                        Leave request #{leaveRequest.id}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        Review the request details, current
                                        status, and the most recent action for{' '}
                                        {leaveRequest.employee_name}.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href={leaveIndex()}>
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to leave
                                        </Link>
                                    </Button>
                                    {canSubmit && isDraft && (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={submitForm.processing}
                                        >
                                            <CheckCircle2 data-icon="inline-start" />
                                            Submit draft
                                        </Button>
                                    )}
                                    {canApprove &&
                                        leaveRequest.status === 'submitted' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    onClick={() =>
                                                        openApproval('rejected')
                                                    }
                                                >
                                                    <XCircle data-icon="inline-start" />
                                                    Reject
                                                </Button>
                                                <Button
                                                    onClick={() =>
                                                        openApproval('approved')
                                                    }
                                                >
                                                    <CheckCircle2 data-icon="inline-start" />
                                                    Approve
                                                </Button>
                                            </>
                                        )}
                                    {canCancel && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline">
                                                    {isDraft
                                                        ? 'Discard draft'
                                                        : 'Cancel request'}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        {isDraft
                                                            ? 'Discard leave draft?'
                                                            : 'Cancel leave request?'}
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        {isDraft
                                                            ? 'This removes the saved draft from active work. This cannot be undone.'
                                                            : 'This withdraws the request before final action. This cannot be undone.'}
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        {isDraft
                                                            ? 'Keep draft'
                                                            : 'Keep request'}
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={handleCancel}
                                                        disabled={
                                                            cancelForm.processing
                                                        }
                                                    >
                                                        {isDraft
                                                            ? 'Yes, discard'
                                                            : 'Yes, cancel'}
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
                                <Card
                                    key={item.title}
                                    className="@container/card shadow-xs"
                                >
                                    <CardHeader>
                                        <CardDescription>
                                            {item.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl font-semibold @[250px]/card:text-3xl">
                                            {item.value}
                                        </CardTitle>
                                        <CardAction>
                                            <Badge variant="outline">
                                                <item.icon />
                                                Overview
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

                        <div className="grid gap-4 px-4 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-6">
                            <div className="flex flex-col gap-4">
                                {approvalAction && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>
                                                {approvalAction === 'approved'
                                                    ? 'Approve leave request'
                                                    : 'Reject leave request'}
                                            </CardTitle>
                                            <CardDescription>
                                                {approvalAction === 'approved'
                                                    ? 'Confirm the request and record any remarks for the employee.'
                                                    : 'Record the reason before closing the request.'}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label htmlFor="remarks">
                                                    Remarks
                                                </Label>
                                                <Textarea
                                                    id="remarks"
                                                    rows={4}
                                                    value={
                                                        approvalForm.data
                                                            .remarks
                                                    }
                                                    onChange={(event) =>
                                                        approvalForm.setData(
                                                            'remarks',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Add remarks for the final action"
                                                />
                                                <InputError
                                                    message={
                                                        approvalForm.errors
                                                            .remarks
                                                    }
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="justify-end gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setApprovalAction(null)
                                                }
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                onClick={submitApproval}
                                                disabled={
                                                    approvalForm.processing
                                                }
                                                variant={
                                                    approvalAction ===
                                                    'approved'
                                                        ? 'default'
                                                        : 'destructive'
                                                }
                                            >
                                                Confirm{' '}
                                                {approvalAction === 'approved'
                                                    ? 'approval'
                                                    : 'rejection'}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                )}

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Request details</CardTitle>
                                        <CardDescription>
                                            Core information recorded when this
                                            leave request was filed.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                                            <DetailField
                                                label="Employee"
                                                value={
                                                    leaveRequest.employee_name
                                                }
                                            />
                                            <DetailField
                                                label="Employee ID"
                                                value={
                                                    leaveRequest.employee_number
                                                }
                                            />
                                            <DetailField
                                                label="Leave type"
                                                value={leaveRequest.leave_type}
                                            />
                                            <DetailField
                                                label="Start date"
                                                value={leaveRequest.start_date}
                                            />
                                            <DetailField
                                                label="End date"
                                                value={leaveRequest.end_date}
                                            />
                                            <DetailField
                                                label="Days requested"
                                                value={`${leaveRequest.days_requested} day${leaveRequest.days_requested !== 1 ? 's' : ''}`}
                                            />
                                            <DetailField
                                                label={lifecycleLabel}
                                                value={lifecycleValue}
                                            />
                                            <DetailField
                                                label="Reason"
                                                value={leaveRequest.reason}
                                                wide
                                            />
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Decision record</CardTitle>
                                        <CardDescription>
                                            The latest processing outcome and
                                            any final remarks on the request.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
                                            <DetailField
                                                label="Current status"
                                                value={
                                                    <Badge
                                                        variant={status.variant}
                                                    >
                                                        {status.label}
                                                    </Badge>
                                                }
                                            />
                                            <DetailField
                                                label="Actioned by"
                                                value={leaveRequest.actioned_by}
                                            />
                                            <DetailField
                                                label="Actioned on"
                                                value={leaveRequest.actioned_at}
                                            />
                                            <DetailField
                                                label="Remarks"
                                                value={leaveRequest.remarks}
                                                wide
                                            />
                                        </dl>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Approval history</CardTitle>
                                        <CardDescription>
                                            Every recorded workflow action on
                                            this leave request.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {approvalHistory.length === 0 ? (
                                            <p className="text-sm text-muted-foreground">
                                                No workflow actions have been
                                                recorded yet.
                                            </p>
                                        ) : (
                                            <div className="flex flex-col gap-3">
                                                {approvalHistory.map(
                                                    (entry) => (
                                                        <div
                                                            key={entry.id}
                                                            className="rounded-lg border px-4 py-3"
                                                        >
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <div className="space-y-1">
                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                        <Badge variant="outline">
                                                                            {entry.action
                                                                                .charAt(
                                                                                    0,
                                                                                )
                                                                                .toUpperCase() +
                                                                                entry.action.slice(
                                                                                    1,
                                                                                )}
                                                                        </Badge>
                                                                        <span className="text-sm text-muted-foreground">
                                                                            {
                                                                                entry.acted_at
                                                                            }
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {entry.acted_by ??
                                                                            'System'}
                                                                    </p>
                                                                    {entry.remarks ? (
                                                                        <p className="text-sm text-foreground">
                                                                            {
                                                                                entry.remarks
                                                                            }
                                                                        </p>
                                                                    ) : null}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ),
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Request status</CardTitle>
                                        <CardDescription>
                                            A quick summary of where this leave
                                            request currently stands.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium">
                                                    Final status
                                                </span>
                                                <span className="text-sm text-muted-foreground">
                                                    {status.summary}
                                                </span>
                                            </div>
                                            <Badge variant={status.variant}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="grid gap-3">
                                            <SideItem
                                                label="Employee"
                                                value={
                                                    leaveRequest.employee_name
                                                }
                                            />
                                            <SideItem
                                                label="Reference"
                                                value={`Leave request #${leaveRequest.id}`}
                                            />
                                            <SideItem
                                                label="Schedule"
                                                value={`${leaveRequest.start_date} to ${leaveRequest.end_date}`}
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Processing guidance
                                        </CardTitle>
                                        <CardDescription>
                                            Use the action controls only while
                                            the request is still pending.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                        <p>
                                            Draft requests can be submitted or
                                            discarded, while submitted requests
                                            can still be approved, rejected, or
                                            cancelled based on your available
                                            permissions.
                                        </p>
                                        <p>
                                            Once a final action is recorded, the
                                            request remains available here as a
                                            read-only record.
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

function DetailField({
    label,
    value,
    wide = false,
}: {
    label: string;
    value: ReactNode | null | undefined;
    wide?: boolean;
}) {
    return (
        <div className={wide ? 'sm:col-span-2 xl:col-span-3' : undefined}>
            <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </dt>
            <dd className="mt-1 text-sm text-foreground">
                {value ?? (
                    <span className="text-muted-foreground italic">
                        Not provided
                    </span>
                )}
            </dd>
        </div>
    );
}

function SideItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-background p-3">
            <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {label}
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">
                {value}
            </div>
        </div>
    );
}
