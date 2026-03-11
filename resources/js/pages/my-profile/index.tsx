import { Head } from '@inertiajs/react';
import { Briefcase, User, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Profile', href: '/my-profile' },
];

type EmployeeProfile = {
    full_name: string;
    employee_number: string;
    department: string;
    position: string;
    employment_type: string;
    employment_status: string;
    hired_at: string | null;
    email: string | null;
    phone: string | null;
    birth_date: string | null;
    sex: string | null;
    civil_status: string | null;
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
    is_active: boolean;
};

type Compensation = {
    grade: number;
    step: number;
    monthly_salary: string;
    effective_date: string;
} | null;

type LeaveBalance = { leave_type: string; balance: number };
type LeaveRecord = { id: number; leave_type: string; start_date: string; end_date: string; days: number; status: string };

type Props = {
    employee: EmployeeProfile | null;
    compensation: Compensation;
    leaveBalances: LeaveBalance[];
    recentLeave: LeaveRecord[];
};

function Field({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
            <dd className="text-sm text-slate-900">{value ?? <span className="italic text-slate-400">Not provided</span>}</dd>
        </div>
    );
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
    cancelled: 'bg-slate-100 text-slate-500',
};

export default function MyProfile({ employee, compensation, leaveBalances, recentLeave }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="My Profile" />
            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="space-y-2">
                        <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">Self Service</Badge>
                        <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                            {employee ? employee.full_name : 'My Profile'}
                        </h1>
                        {employee && (
                            <p className="text-sm text-slate-500">
                                {employee.employee_number} &middot; {employee.position} &middot; {employee.department}
                            </p>
                        )}
                    </div>
                </section>

                {!employee ? (
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardContent className="flex flex-col items-center gap-3 py-16 text-slate-400">
                            <User className="size-12" />
                            <p className="text-sm font-medium">No employee record linked to your account.</p>
                            <p className="text-xs">Please contact HR to link your profile.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Tabs defaultValue="personal">
                        <TabsList className="border border-slate-200/75 bg-white/80">
                            <TabsTrigger value="personal" className="gap-2"><User className="size-4" />Personal Info</TabsTrigger>
                            <TabsTrigger value="employment" className="gap-2"><Briefcase className="size-4" />Employment</TabsTrigger>
                            <TabsTrigger value="compensation" className="gap-2"><Wallet className="size-4" />Compensation & Leave</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="mt-4 space-y-4">
                            <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                                <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Basic Details</p>
                                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                            <Field label="Email" value={employee.email} />
                                            <Field label="Phone" value={employee.phone} />
                                            <Field label="Birth date" value={employee.birth_date} />
                                            <Field label="Sex" value={employee.sex ? employee.sex.charAt(0).toUpperCase() + employee.sex.slice(1) : null} />
                                            <Field label="Civil status" value={employee.civil_status ? employee.civil_status.charAt(0).toUpperCase() + employee.civil_status.slice(1) : null} />
                                        </dl>
                                    </div>
                                    <div>
                                        <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Address</p>
                                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                                            <Field label="Street / Barangay" value={employee.address_street} />
                                            <Field label="City / Municipality" value={employee.address_city} />
                                            <Field label="Province" value={employee.address_province} />
                                            <Field label="ZIP code" value={employee.address_zip} />
                                        </dl>
                                    </div>
                                    <div>
                                        <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Government IDs</p>
                                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                            <Field label="TIN" value={employee.tin} />
                                            <Field label="GSIS number" value={employee.gsis_number} />
                                            <Field label="PhilHealth number" value={employee.philhealth_number} />
                                            <Field label="Pag-IBIG number" value={employee.pagibig_number} />
                                            <Field label="SSS number" value={employee.sss_number} />
                                        </dl>
                                    </div>
                                    <div>
                                        <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Emergency Contact</p>
                                        <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-3">
                                            <Field label="Name" value={employee.emergency_contact_name} />
                                            <Field label="Relationship" value={employee.emergency_contact_relationship} />
                                            <Field label="Phone" value={employee.emergency_contact_phone} />
                                        </dl>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="employment" className="mt-4">
                            <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                                <CardHeader><CardTitle>Employment Details</CardTitle></CardHeader>
                                <CardContent>
                                    <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                        <Field label="Employee number" value={employee.employee_number} />
                                        <Field label="Department" value={employee.department} />
                                        <Field label="Position" value={employee.position} />
                                        <Field label="Employment type" value={employee.employment_type} />
                                        <Field label="Employment status" value={employee.employment_status} />
                                        <Field label="Start date" value={employee.hired_at} />
                                    </dl>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="compensation" className="mt-4 space-y-4">
                            {compensation && (
                                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                                    <CardHeader><CardTitle>Salary Grade</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div className="rounded-lg border bg-slate-50/60 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Grade / Step</p>
                                                <p className="mt-1 text-2xl font-semibold">SG {compensation.grade}–{compensation.step}</p>
                                            </div>
                                            <div className="rounded-lg border bg-slate-50/60 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Monthly salary</p>
                                                <p className="mt-1 text-2xl font-semibold">₱{compensation.monthly_salary}</p>
                                            </div>
                                            <div className="rounded-lg border bg-slate-50/60 p-4">
                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Effective date</p>
                                                <p className="mt-1 text-lg font-medium">{compensation.effective_date}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {leaveBalances.length > 0 && (
                                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                                    <CardHeader><CardTitle>Leave Balances</CardTitle><CardDescription>Current leave credits</CardDescription></CardHeader>
                                    <CardContent>
                                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                            {leaveBalances.map((lb) => (
                                                <div key={lb.leave_type} className="rounded-lg border bg-slate-50/60 p-4">
                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{lb.leave_type}</p>
                                                    <p className="mt-1 text-2xl font-semibold">{lb.balance} <span className="text-sm font-normal text-slate-500">days</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {recentLeave.length > 0 && (
                                <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                                    <CardHeader><CardTitle>Recent Leave Requests</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="divide-y">
                                            {recentLeave.map((lr) => (
                                                <div key={lr.id} className="flex items-center justify-between gap-4 py-3">
                                                    <div>
                                                        <p className="text-sm font-medium">{lr.leave_type}</p>
                                                        <p className="text-xs text-slate-500">{lr.start_date} – {lr.end_date} ({lr.days} day{lr.days !== 1 ? 's' : ''})</p>
                                                    </div>
                                                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lr.status] ?? 'bg-slate-100 text-slate-600'}`}>
                                                        {lr.status.charAt(0).toUpperCase() + lr.status.slice(1)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </AppLayout>
    );
}
