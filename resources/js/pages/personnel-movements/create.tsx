import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type SelectOption = { value: string; label: string };

type EmployeeOption = {
    value: string;
    label: string;
    department_id: string | null;
    position_id: string | null;
    employment_status_id: string | null;
};

type Props = {
    employees: EmployeeOption[];
    movementTypes: SelectOption[];
    departments: SelectOption[];
    positions: SelectOption[];
    employmentStatuses: SelectOption[];
    prefillEmployeeId?: string | null;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Personnel Movements', href: '/personnel-movements' },
    { title: 'Record movement', href: '/personnel-movements/create' },
];

export default function PersonnelMovementsCreate({
    employees,
    movementTypes,
    departments,
    positions,
    employmentStatuses,
    prefillEmployeeId,
}: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: prefillEmployeeId ?? '',
        movement_type_id: '',
        effective_date: '',
        from_department_id: '',
        to_department_id: '',
        from_position_id: '',
        to_position_id: '',
        from_employment_status_id: '',
        to_employment_status_id: '',
        order_number: '',
        remarks: '',
    });

    useEffect(() => {
        if (data.employee_id) {
            const emp = employees.find((e) => e.value === data.employee_id);
            if (emp) {
                setData((prev) => ({
                    ...prev,
                    from_department_id: emp.department_id ?? '',
                    from_position_id: emp.position_id ?? '',
                    from_employment_status_id: emp.employment_status_id ?? '',
                }));
            }
        }
    }, [data.employee_id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/personnel-movements');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Record Movement" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="space-y-3">
                        <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                            New record
                        </Badge>
                        <div className="space-y-2">
                            <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                Record personnel movement
                            </h1>
                            <p className="text-sm leading-6 text-slate-600">
                                Document a promotion, transfer, separation,
                                reappointment, or status change.
                            </p>
                        </div>
                    </div>
                </section>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                Movement details
                            </CardTitle>
                            <CardDescription>
                                Core information about this movement.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="employee_id">
                                    Employee{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.employee_id}
                                    onValueChange={(v) =>
                                        setData('employee_id', v)
                                    }
                                >
                                    <SelectTrigger id="employee_id">
                                        <SelectValue placeholder="Select employee" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employees.map((e) => (
                                            <SelectItem
                                                key={e.value}
                                                value={e.value}
                                            >
                                                {e.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.employee_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.employee_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="movement_type_id">
                                    Movement type{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.movement_type_id}
                                    onValueChange={(v) =>
                                        setData('movement_type_id', v)
                                    }
                                >
                                    <SelectTrigger id="movement_type_id">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {movementTypes.map((t) => (
                                            <SelectItem
                                                key={t.value}
                                                value={t.value}
                                            >
                                                {t.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.movement_type_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.movement_type_id}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="effective_date">
                                    Effective date{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="effective_date"
                                    type="date"
                                    value={data.effective_date}
                                    onChange={(e) =>
                                        setData('effective_date', e.target.value)
                                    }
                                />
                                {errors.effective_date && (
                                    <p className="text-xs text-red-500">
                                        {errors.effective_date}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="order_number">
                                    Order / appointment no.
                                </Label>
                                <Input
                                    id="order_number"
                                    value={data.order_number}
                                    onChange={(e) =>
                                        setData('order_number', e.target.value)
                                    }
                                    placeholder="e.g. CSC-001-2025"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                Positions &amp; departments
                            </CardTitle>
                            <CardDescription>
                                From / To values are optional — leave blank if
                                not applicable to this movement type.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>From department</Label>
                                    <Select
                                        value={data.from_department_id}
                                        onValueChange={(v) =>
                                            setData('from_department_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            {departments.map((d) => (
                                                <SelectItem
                                                    key={d.value}
                                                    value={d.value}
                                                >
                                                    {d.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>To department</Label>
                                    <Select
                                        value={data.to_department_id}
                                        onValueChange={(v) =>
                                            setData('to_department_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            {departments.map((d) => (
                                                <SelectItem
                                                    key={d.value}
                                                    value={d.value}
                                                >
                                                    {d.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>From position</Label>
                                    <Select
                                        value={data.from_position_id}
                                        onValueChange={(v) =>
                                            setData('from_position_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            {positions.map((p) => (
                                                <SelectItem
                                                    key={p.value}
                                                    value={p.value}
                                                >
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>To position</Label>
                                    <Select
                                        value={data.to_position_id}
                                        onValueChange={(v) =>
                                            setData('to_position_id', v)
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            {positions.map((p) => (
                                                <SelectItem
                                                    key={p.value}
                                                    value={p.value}
                                                >
                                                    {p.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label>From employment status</Label>
                                    <Select
                                        value={data.from_employment_status_id}
                                        onValueChange={(v) =>
                                            setData(
                                                'from_employment_status_id',
                                                v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            {employmentStatuses.map((s) => (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>To employment status</Label>
                                    <Select
                                        value={data.to_employment_status_id}
                                        onValueChange={(v) =>
                                            setData(
                                                'to_employment_status_id',
                                                v,
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="None" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">
                                                None
                                            </SelectItem>
                                            {employmentStatuses.map((s) => (
                                                <SelectItem
                                                    key={s.value}
                                                    value={s.value}
                                                >
                                                    {s.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                Remarks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                value={data.remarks}
                                onChange={(e) =>
                                    setData('remarks', e.target.value)
                                }
                                placeholder="Additional notes or context for this movement…"
                                rows={4}
                            />
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href="/personnel-movements">Cancel</Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save movement'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
