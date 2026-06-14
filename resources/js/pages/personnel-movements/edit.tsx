import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { ArrowLeft, CalendarDays, Save } from 'lucide-react';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    index as movementsIndex,
    show as movementShow,
    update as movementUpdate,
} from '@/actions/App/Http/Controllers/PersonnelMovementController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Option = { value: string; label: string };

type MovementDetail = {
    id: number;
    uuid: string;
    employee_id: number;
    employee_name: string;
    employee_number: string;
    movement_type: string;
    movement_type_id: string;
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

type Props = {
    movement: MovementDetail;
    employees: (Option & {
        employee_number: string;
        department_id: string;
        position_id: string;
        employment_status_id: string;
    })[];
    movementTypes: Option[];
    departments: Option[];
    positions: Option[];
    employmentStatuses: Option[];
};

export default function MovementEdit({
    movement,
    movementTypes,
    departments,
    positions,
}: Props) {
    const form = useForm({
        employee_id: String(movement.employee_id),
        movement_type_id: movement.movement_type_id,
        effective_date: movement.effective_date,
        order_number: movement.order_number ?? '',
        from_department_id: '',
        to_department_id: '',
        from_position_id: '',
        to_position_id: '',
        from_employment_status_id: '',
        to_employment_status_id: '',
        remarks: movement.remarks ?? '',
    });

    function handleSubmit(): void {
        form.patch(movementUpdate.url(movement.uuid));
    }

    function toCalendarDate(value: string): Date | undefined {
        return value ? parseISO(value) : undefined;
    }

    return (
        <AppLayout
            breadcrumbs={
                [
                    { title: 'Dashboard', href: dashboardIndex.url() },
                    { title: 'Movements', href: movementsIndex.url() },
                    {
                        title: `Movement #${movement.id}`,
                        href: movementShow.url(movement.uuid),
                    },
                    { title: 'Edit', href: '' },
                ] as BreadcrumbItem[]
            }
        >
            <Head title={`Edit Movement #${movement.id}`} />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmit();
                        }}
                        className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                    >
                        <div className="px-4 lg:px-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Edit movement #{movement.id}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {movement.employee_name}
                                    </p>
                                </div>
                                <Button asChild variant="outline">
                                    <Link href={movementShow.url(movement.uuid)}>
                                        <ArrowLeft data-icon="inline-start" />
                                        Back
                                    </Link>
                                </Button>
                            </div>
                        </div>

                        <div className="grid gap-6 px-4 lg:px-6 xl:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Movement details</CardTitle>
                                    <CardDescription>
                                        Edit the movement type, dates, and
                                        order reference.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label>Movement type</Label>
                                        <Select
                                            value={form.data.movement_type_id}
                                            onValueChange={(v) =>
                                                form.setData(
                                                    'movement_type_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    {movementTypes.map((t) => (
                                                        <SelectItem
                                                            key={t.value}
                                                            value={t.value}
                                                        >
                                                            {t.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        <InputError
                                            message={
                                                form.errors.movement_type_id
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Effective date</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                >
                                                    <CalendarDays data-icon="inline-start" />
                                                    {form.data.effective_date
                                                        ? format(
                                                              parseISO(
                                                                  form.data
                                                                      .effective_date,
                                                              ),
                                                              'PPP',
                                                          )
                                                        : 'Pick date'}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                className="w-auto p-0"
                                                align="start"
                                            >
                                                <Calendar
                                                    mode="single"
                                                    selected={toCalendarDate(
                                                        form.data
                                                            .effective_date,
                                                    )}
                                                    onSelect={(d) =>
                                                        form.setData(
                                                            'effective_date',
                                                            d
                                                                ? format(
                                                                      d,
                                                                      'yyyy-MM-dd',
                                                                  )
                                                                : '',
                                                        )
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <InputError
                                            message={
                                                form.errors.effective_date
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Order number</Label>
                                        <Input
                                            value={form.data.order_number}
                                            onChange={(e) =>
                                                form.setData(
                                                    'order_number',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., ORD-2026-001"
                                        />
                                        <InputError
                                            message={form.errors.order_number}
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <Label>Remarks</Label>
                                        <Textarea
                                            rows={3}
                                            value={form.data.remarks}
                                            onChange={(e) =>
                                                form.setData(
                                                    'remarks',
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <InputError
                                            message={form.errors.remarks}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="justify-end gap-2">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={movementShow.url(
                                                movement.uuid,
                                            )}
                                        >
                                            Cancel
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <Save data-icon="inline-start" />
                                        Save changes
                                    </Button>
                                </CardFooter>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Department & position</CardTitle>
                                    <CardDescription>
                                        Update the transfer details if
                                        applicable.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <Label>From department</Label>
                                        <Select
                                            value={form.data.from_department_id}
                                            onValueChange={(v) =>
                                                form.setData(
                                                    'from_department_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
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
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>To department</Label>
                                        <Select
                                            value={form.data.to_department_id}
                                            onValueChange={(v) =>
                                                form.setData(
                                                    'to_department_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
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
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>From position</Label>
                                        <Select
                                            value={form.data.from_position_id}
                                            onValueChange={(v) =>
                                                form.setData(
                                                    'from_position_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
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
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Label>To position</Label>
                                        <Select
                                            value={form.data.to_position_id}
                                            onValueChange={(v) =>
                                                form.setData(
                                                    'to_position_id',
                                                    v,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="None" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
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
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
