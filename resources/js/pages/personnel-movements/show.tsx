import { Head, Link } from '@inertiajs/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { show as showEmployee } from '@/actions/App/Http/Controllers/EmployeeController';
import { index as movementsIndex } from '@/actions/App/Http/Controllers/PersonnelMovementController';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type MovementDetail = {
    id: number;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    movement_type: string;
    effective_date: string;
    order_number: string | null;
    from_department: string | null;
    to_department: string | null;
    from_position: string | null;
    to_position: string | null;
    from_employment_status: string | null;
    to_employment_status: string | null;
    remarks: string | null;
    recorded_by: string | null;
    recorded_at: string;
};

type Props = { movement: MovementDetail };

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Personnel Movements', href: '/personnel-movements' },
    { title: 'Movement detail', href: '#' },
];

function Row({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) {
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="min-w-48 text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
            </span>
            <span className="text-sm text-slate-900">
                {value ?? (
                    <span className="text-slate-400 italic">Not specified</span>
                )}
            </span>
        </div>
    );
}

function ArrowRow({
    label,
    from,
    to,
}: {
    label: string;
    from: string | null;
    to: string | null;
}) {
    if (!from && !to) return null;
    return (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
            <span className="min-w-48 text-xs font-medium tracking-wide text-slate-500 uppercase">
                {label}
            </span>
            <span className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-slate-500 italic">{from ?? 'N/A'}</span>
                <span className="text-slate-400">→</span>
                <span className="font-medium text-slate-900">
                    {to ?? 'N/A'}
                </span>
            </span>
        </div>
    );
}

export default function PersonnelMovementsShow({ movement }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Movement – ${movement.employee_name}`} />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,rgba(31,78,121,0.14),transparent_35%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                {movement.movement_type}
                            </Badge>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    {movement.employee_name}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {movement.employee_number}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button asChild variant="outline">
                                <Link href={movementsIndex()}>
                                    ← All movements
                                </Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href={showEmployee(movement.employee_id)}>
                                    View employee
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-950">
                            Movement record
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 divide-y divide-slate-100">
                        <div className="space-y-3 pb-4">
                            <Row
                                label="Movement type"
                                value={movement.movement_type}
                            />
                            <Row
                                label="Effective date"
                                value={movement.effective_date}
                            />
                            <Row
                                label="Order / appointment no."
                                value={movement.order_number}
                            />
                        </div>
                        <div className="space-y-3 py-4">
                            <ArrowRow
                                label="Department"
                                from={movement.from_department}
                                to={movement.to_department}
                            />
                            <ArrowRow
                                label="Position"
                                from={movement.from_position}
                                to={movement.to_position}
                            />
                            <ArrowRow
                                label="Employment status"
                                from={movement.from_employment_status}
                                to={movement.to_employment_status}
                            />
                        </div>
                        {movement.remarks && (
                            <div className="space-y-2 py-4">
                                <span className="text-xs font-medium tracking-wide text-slate-500 uppercase">
                                    Remarks
                                </span>
                                <p className="text-sm whitespace-pre-wrap text-slate-800">
                                    {movement.remarks}
                                </p>
                            </div>
                        )}
                        <div className="space-y-3 pt-4">
                            <Row
                                label="Recorded by"
                                value={movement.recorded_by}
                            />
                            <Row
                                label="Recorded at"
                                value={movement.recorded_at}
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
