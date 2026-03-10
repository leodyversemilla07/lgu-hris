import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
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
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Option = {
    value: string;
    label: string;
    department?: string;
};

type Props = {
    departments: Option[];
    positions: Option[];
    employmentTypes: Option[];
    employmentStatuses: Option[];
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Employees', href: '/employees' },
    { title: 'Create employee', href: '/employees/create' },
];

export default function CreateEmployee({
    departments,
    positions,
    employmentTypes,
    employmentStatuses,
}: Props) {
    const form = useForm({
        employee_number: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        suffix: '',
        email: '',
        phone: '',
        birth_date: '',
        hired_at: '',
        department_id: '',
        position_id: '',
        employment_type_id: '',
        employment_status_id: '',
        is_active: true,
    });

    const filteredPositions = form.data.department_id
        ? positions.filter(
              (position) =>
                  departments.find(
                      (department) =>
                          department.value === form.data.department_id,
                  )?.label === position.department,
          )
        : positions;

    const submit = (): void => {
        form.post('/employees');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Employee" />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Employee intake
                            </Badge>
                            <Heading
                                title="Create employee record"
                                description="Capture the core employee profile, assignment, and employment details needed for the digital 201 foundation."
                            />
                        </div>

                        <Button asChild variant="outline">
                            <Link href="/employees">
                                <ArrowLeft className="size-4" />
                                Back to registry
                            </Link>
                        </Button>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-slate-950">
                            Employee profile
                        </CardTitle>
                        <CardDescription>
                            Required fields are aligned with the initial
                            employee master record workflow.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                            <div className="grid gap-2">
                                <Label htmlFor="employee_number">
                                    Employee number
                                </Label>
                                <Input
                                    id="employee_number"
                                    value={form.data.employee_number}
                                    onChange={(event) =>
                                        form.setData(
                                            'employee_number',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="EMP-1002"
                                />
                                <InputError
                                    message={form.errors.employee_number}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name</Label>
                                <Input
                                    id="first_name"
                                    value={form.data.first_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'first_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.first_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="middle_name">Middle name</Label>
                                <Input
                                    id="middle_name"
                                    value={form.data.middle_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'middle_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.middle_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last name</Label>
                                <Input
                                    id="last_name"
                                    value={form.data.last_name}
                                    onChange={(event) =>
                                        form.setData(
                                            'last_name',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.last_name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Input
                                    id="suffix"
                                    value={form.data.suffix}
                                    onChange={(event) =>
                                        form.setData(
                                            'suffix',
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Jr., Sr., III"
                                />
                                <InputError message={form.errors.suffix} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Birth date</Label>
                                <Input
                                    id="birth_date"
                                    type="date"
                                    value={form.data.birth_date}
                                    onChange={(event) =>
                                        form.setData(
                                            'birth_date',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.birth_date} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(event) =>
                                        form.setData(
                                            'email',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.data.phone}
                                    onChange={(event) =>
                                        form.setData(
                                            'phone',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.phone} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="hired_at">Start date</Label>
                                <Input
                                    id="hired_at"
                                    type="date"
                                    value={form.data.hired_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'hired_at',
                                            event.target.value,
                                        )
                                    }
                                />
                                <InputError message={form.errors.hired_at} />
                            </div>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <Select
                                    value={form.data.department_id}
                                    onValueChange={(value) => {
                                        form.setData('department_id', value);
                                        form.setData('position_id', '');
                                    }}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((department) => (
                                            <SelectItem
                                                key={department.value}
                                                value={department.value}
                                            >
                                                {department.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={form.errors.department_id}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Position</Label>
                                <Select
                                    value={form.data.position_id}
                                    onValueChange={(value) =>
                                        form.setData('position_id', value)
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredPositions.map((position) => (
                                            <SelectItem
                                                key={position.value}
                                                value={position.value}
                                            >
                                                {position.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={form.errors.position_id} />
                            </div>

                            <div className="grid gap-2">
                                <Label>Employment type</Label>
                                <Select
                                    value={form.data.employment_type_id}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'employment_type_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employmentTypes.map(
                                            (employmentType) => (
                                                <SelectItem
                                                    key={employmentType.value}
                                                    value={employmentType.value}
                                                >
                                                    {employmentType.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={form.errors.employment_type_id}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Employment status</Label>
                                <Select
                                    value={form.data.employment_status_id}
                                    onValueChange={(value) =>
                                        form.setData(
                                            'employment_status_id',
                                            value,
                                        )
                                    }
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {employmentStatuses.map(
                                            (employmentStatus) => (
                                                <SelectItem
                                                    key={employmentStatus.value}
                                                    value={
                                                        employmentStatus.value
                                                    }
                                                >
                                                    {employmentStatus.label}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>
                                <InputError
                                    message={form.errors.employment_status_id}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                            <div>
                                <p className="font-medium text-slate-950">
                                    Record status
                                </p>
                                <p className="text-sm text-slate-600">
                                    New employee records are active by default
                                    unless you are encoding archival data.
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant={
                                    form.data.is_active ? 'default' : 'outline'
                                }
                                onClick={() =>
                                    form.setData(
                                        'is_active',
                                        !form.data.is_active,
                                    )
                                }
                            >
                                {form.data.is_active ? 'Active' : 'Archived'}
                            </Button>
                        </div>
                        <InputError message={form.errors.is_active} />

                        <div className="flex justify-end">
                            <Button onClick={submit} disabled={form.processing}>
                                <Save className="size-4" />
                                Save employee
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
