import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Option = { value: string; label: string; department?: string };

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
    department_id: string;
    position_id: string;
    employment_type_id: string;
    employment_status_id: string;
    is_active: boolean;
};

type Props = {
    employee: EmployeeDetail;
    departments: Option[];
    positions: Option[];
    employmentTypes: Option[];
    employmentStatuses: Option[];
};

const SEX_OPTIONS = [{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }];
const CIVIL_STATUS_OPTIONS = [
    { value: 'single', label: 'Single' },
    { value: 'married', label: 'Married' },
    { value: 'widowed', label: 'Widowed' },
    { value: 'separated', label: 'Separated' },
    { value: 'divorced', label: 'Divorced' },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
    return <h3 className="col-span-full text-sm font-semibold text-slate-500 uppercase tracking-wide border-b pb-1">{children}</h3>;
}

export default function EditEmployee({ employee, departments, positions, employmentTypes, employmentStatuses }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: employee.full_name, href: `/employees/${employee.id}` },
        { title: 'Edit', href: `/employees/${employee.id}/edit` },
    ];

    const form = useForm({
        employee_number: employee.employee_number,
        first_name: employee.first_name,
        middle_name: employee.middle_name ?? '',
        last_name: employee.last_name,
        suffix: employee.suffix ?? '',
        sex: employee.sex ?? '',
        civil_status: employee.civil_status ?? '',
        email: employee.email ?? '',
        phone: employee.phone ?? '',
        birth_date: employee.birth_date ?? '',
        address_street: employee.address_street ?? '',
        address_city: employee.address_city ?? '',
        address_province: employee.address_province ?? '',
        address_zip: employee.address_zip ?? '',
        tin: employee.tin ?? '',
        gsis_number: employee.gsis_number ?? '',
        philhealth_number: employee.philhealth_number ?? '',
        pagibig_number: employee.pagibig_number ?? '',
        sss_number: employee.sss_number ?? '',
        emergency_contact_name: employee.emergency_contact_name ?? '',
        emergency_contact_relationship: employee.emergency_contact_relationship ?? '',
        emergency_contact_phone: employee.emergency_contact_phone ?? '',
        hired_at: employee.hired_at ?? '',
        department_id: employee.department_id,
        position_id: employee.position_id,
        employment_type_id: employee.employment_type_id,
        employment_status_id: employee.employment_status_id,
        is_active: employee.is_active,
    });

    const filteredPositions = form.data.department_id
        ? positions.filter((p) => departments.find((d) => d.value === form.data.department_id)?.label === p.department)
        : positions;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit – ${employee.full_name}`} />
            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">Edit employee record</Badge>
                            <Heading title={employee.full_name} description="Update personal information, government IDs, and employment details." />
                        </div>
                        <Button asChild variant="outline">
                            <Link href={`/employees/${employee.id}`}><ArrowLeft className="size-4" />Back to profile</Link>
                        </Button>
                    </div>
                </section>

                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                    <CardHeader>
                        <CardTitle>Employee profile</CardTitle>
                        <CardDescription>All fields marked with * are required.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8">
                        {/* Personal Information */}
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <SectionTitle>Personal Information</SectionTitle>
                            <div className="grid gap-2">
                                <Label htmlFor="employee_number">Employee number *</Label>
                                <Input id="employee_number" value={form.data.employee_number} onChange={(e) => form.setData('employee_number', e.target.value)} />
                                <InputError message={form.errors.employee_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="first_name">First name *</Label>
                                <Input id="first_name" value={form.data.first_name} onChange={(e) => form.setData('first_name', e.target.value)} />
                                <InputError message={form.errors.first_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="middle_name">Middle name</Label>
                                <Input id="middle_name" value={form.data.middle_name} onChange={(e) => form.setData('middle_name', e.target.value)} />
                                <InputError message={form.errors.middle_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="last_name">Last name *</Label>
                                <Input id="last_name" value={form.data.last_name} onChange={(e) => form.setData('last_name', e.target.value)} />
                                <InputError message={form.errors.last_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="suffix">Suffix</Label>
                                <Input id="suffix" value={form.data.suffix} onChange={(e) => form.setData('suffix', e.target.value)} placeholder="Jr., Sr., III" />
                                <InputError message={form.errors.suffix} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="birth_date">Birth date</Label>
                                <Input id="birth_date" type="date" value={form.data.birth_date} onChange={(e) => form.setData('birth_date', e.target.value)} />
                                <InputError message={form.errors.birth_date} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Sex</Label>
                                <Select value={form.data.sex} onValueChange={(v) => form.setData('sex', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger>
                                    <SelectContent>{SEX_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.sex} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Civil status</Label>
                                <Select value={form.data.civil_status} onValueChange={(v) => form.setData('civil_status', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select civil status" /></SelectTrigger>
                                    <SelectContent>{CIVIL_STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.civil_status} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                                <InputError message={form.errors.email} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                                <InputError message={form.errors.phone} />
                            </div>
                        </div>

                        {/* Address */}
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SectionTitle>Address</SectionTitle>
                            <div className="col-span-full grid gap-2">
                                <Label htmlFor="address_street">Street / Barangay</Label>
                                <Input id="address_street" value={form.data.address_street} onChange={(e) => form.setData('address_street', e.target.value)} />
                                <InputError message={form.errors.address_street} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address_city">City / Municipality</Label>
                                <Input id="address_city" value={form.data.address_city} onChange={(e) => form.setData('address_city', e.target.value)} />
                                <InputError message={form.errors.address_city} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address_province">Province</Label>
                                <Input id="address_province" value={form.data.address_province} onChange={(e) => form.setData('address_province', e.target.value)} />
                                <InputError message={form.errors.address_province} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="address_zip">ZIP code</Label>
                                <Input id="address_zip" value={form.data.address_zip} onChange={(e) => form.setData('address_zip', e.target.value)} />
                                <InputError message={form.errors.address_zip} />
                            </div>
                        </div>

                        {/* Government IDs */}
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                            <SectionTitle>Government IDs</SectionTitle>
                            <div className="grid gap-2">
                                <Label htmlFor="tin">TIN</Label>
                                <Input id="tin" value={form.data.tin} onChange={(e) => form.setData('tin', e.target.value)} />
                                <InputError message={form.errors.tin} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="gsis_number">GSIS number</Label>
                                <Input id="gsis_number" value={form.data.gsis_number} onChange={(e) => form.setData('gsis_number', e.target.value)} />
                                <InputError message={form.errors.gsis_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="philhealth_number">PhilHealth number</Label>
                                <Input id="philhealth_number" value={form.data.philhealth_number} onChange={(e) => form.setData('philhealth_number', e.target.value)} />
                                <InputError message={form.errors.philhealth_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="pagibig_number">Pag-IBIG number</Label>
                                <Input id="pagibig_number" value={form.data.pagibig_number} onChange={(e) => form.setData('pagibig_number', e.target.value)} />
                                <InputError message={form.errors.pagibig_number} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="sss_number">SSS number</Label>
                                <Input id="sss_number" value={form.data.sss_number} onChange={(e) => form.setData('sss_number', e.target.value)} />
                                <InputError message={form.errors.sss_number} />
                            </div>
                        </div>

                        {/* Emergency Contact */}
                        <div className="grid gap-4 md:grid-cols-3">
                            <SectionTitle>Emergency Contact</SectionTitle>
                            <div className="grid gap-2">
                                <Label htmlFor="emergency_contact_name">Name</Label>
                                <Input id="emergency_contact_name" value={form.data.emergency_contact_name} onChange={(e) => form.setData('emergency_contact_name', e.target.value)} />
                                <InputError message={form.errors.emergency_contact_name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="emergency_contact_relationship">Relationship</Label>
                                <Input id="emergency_contact_relationship" value={form.data.emergency_contact_relationship} onChange={(e) => form.setData('emergency_contact_relationship', e.target.value)} />
                                <InputError message={form.errors.emergency_contact_relationship} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="emergency_contact_phone">Phone</Label>
                                <Input id="emergency_contact_phone" value={form.data.emergency_contact_phone} onChange={(e) => form.setData('emergency_contact_phone', e.target.value)} />
                                <InputError message={form.errors.emergency_contact_phone} />
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            <SectionTitle>Employment Details</SectionTitle>
                            <div className="grid gap-2">
                                <Label htmlFor="hired_at">Start date *</Label>
                                <Input id="hired_at" type="date" value={form.data.hired_at} onChange={(e) => form.setData('hired_at', e.target.value)} />
                                <InputError message={form.errors.hired_at} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Department *</Label>
                                <Select value={form.data.department_id} onValueChange={(v) => { form.setData('department_id', v); form.setData('position_id', ''); }}>
                                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                    <SelectContent>{departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.department_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Position *</Label>
                                <Select value={form.data.position_id} onValueChange={(v) => form.setData('position_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select position" /></SelectTrigger>
                                    <SelectContent>{filteredPositions.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.position_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Employment type *</Label>
                                <Select value={form.data.employment_type_id} onValueChange={(v) => form.setData('employment_type_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                    <SelectContent>{employmentTypes.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.employment_type_id} />
                            </div>
                            <div className="grid gap-2">
                                <Label>Employment status *</Label>
                                <Select value={form.data.employment_status_id} onValueChange={(v) => form.setData('employment_status_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                                    <SelectContent>{employmentStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}</SelectContent>
                                </Select>
                                <InputError message={form.errors.employment_status_id} />
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-4">
                            <div>
                                <p className="font-medium text-slate-950">Record status</p>
                                <p className="text-sm text-slate-600">Toggle to archive or restore this employee record.</p>
                            </div>
                            <Button type="button" variant={form.data.is_active ? 'default' : 'outline'} onClick={() => form.setData('is_active', !form.data.is_active)}>
                                {form.data.is_active ? 'Active' : 'Archived'}
                            </Button>
                        </div>

                        <div className="flex justify-end">
                            <Button onClick={() => form.put(`/employees/${employee.id}`)} disabled={form.processing}>
                                <Save className="size-4" />Save changes
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
