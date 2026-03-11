import { Transition } from '@headlessui/react';
import { Form, Head, Link, usePage } from '@inertiajs/react';
import { Briefcase, User, Wallet } from 'lucide-react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { edit } from '@/routes/profile';
import { send } from '@/routes/verification';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: edit(),
    },
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

function Field({ label, value }: { label: string; value: string | null | undefined }) {
    return (
        <div className="space-y-1">
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
            <dd className="text-sm text-foreground">{value ?? <span className="italic text-muted-foreground/60">Not provided</span>}</dd>
        </div>
    );
}

const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-destructive/10 text-destructive',
    cancelled: 'bg-muted text-muted-foreground',
};

export default function Profile({
    mustVerifyEmail,
    status,
    employee,
    compensation,
    leaveBalances,
    recentLeave,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    employee: EmployeeProfile | null;
    compensation: Compensation;
    leaveBalances: LeaveBalance[];
    recentLeave: LeaveRecord[];
}) {
    const { auth } = usePage().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <h1 className="sr-only">Profile settings</h1>

            <SettingsLayout>
                <div className="space-y-8">
                    {/* Employee profile section */}
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">Self Service</Badge>
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                                {employee ? employee.full_name : auth.user.name}
                            </h2>
                            {employee && (
                                <p className="text-sm text-muted-foreground">
                                    {employee.employee_number} &middot; {employee.position} &middot; {employee.department}
                                </p>
                            )}
                        </div>

                        {employee ? (
                            <Tabs defaultValue="personal">
                                <TabsList className="border border-border bg-background/80">
                                    <TabsTrigger value="personal" className="gap-2">
                                        <User className="size-4" />Personal Info
                                    </TabsTrigger>
                                    <TabsTrigger value="employment" className="gap-2">
                                        <Briefcase className="size-4" />Employment
                                    </TabsTrigger>
                                    <TabsTrigger value="compensation" className="gap-2">
                                        <Wallet className="size-4" />Compensation & Leave
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="personal" className="mt-4 space-y-4">
                                    <Card className="border-border bg-card shadow-sm">
                                        <CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                                        <CardContent className="space-y-6">
                                            <div>
                                                <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Basic Details</p>
                                                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                                    <Field label="Email" value={employee.email} />
                                                    <Field label="Phone" value={employee.phone} />
                                                    <Field label="Birth date" value={employee.birth_date} />
                                                    <Field label="Sex" value={employee.sex ? employee.sex.charAt(0).toUpperCase() + employee.sex.slice(1) : null} />
                                                    <Field label="Civil status" value={employee.civil_status ? employee.civil_status.charAt(0).toUpperCase() + employee.civil_status.slice(1) : null} />
                                                </dl>
                                            </div>
                                            <div>
                                                <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Address</p>
                                                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                                                    <Field label="Street / Barangay" value={employee.address_street} />
                                                    <Field label="City / Municipality" value={employee.address_city} />
                                                    <Field label="Province" value={employee.address_province} />
                                                    <Field label="ZIP code" value={employee.address_zip} />
                                                </dl>
                                            </div>
                                            <div>
                                                <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Government IDs</p>
                                                <dl className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                                                    <Field label="TIN" value={employee.tin} />
                                                    <Field label="GSIS number" value={employee.gsis_number} />
                                                    <Field label="PhilHealth number" value={employee.philhealth_number} />
                                                    <Field label="Pag-IBIG number" value={employee.pagibig_number} />
                                                    <Field label="SSS number" value={employee.sss_number} />
                                                </dl>
                                            </div>
                                            <div>
                                                <p className="mb-3 border-b pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Emergency Contact</p>
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
                                    <Card className="border-border bg-card shadow-sm">
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
                                        <Card className="border-border bg-card shadow-sm">
                                            <CardHeader><CardTitle>Salary Grade</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="grid gap-4 sm:grid-cols-3">
                                                    <div className="rounded-lg border bg-muted p-4">
                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Grade / Step</p>
                                                        <p className="mt-1 text-2xl font-semibold">SG {compensation.grade}–{compensation.step}</p>
                                                    </div>
                                                    <div className="rounded-lg border bg-muted p-4">
                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Monthly salary</p>
                                                        <p className="mt-1 text-2xl font-semibold">₱{compensation.monthly_salary}</p>
                                                    </div>
                                                    <div className="rounded-lg border bg-muted p-4">
                                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Effective date</p>
                                                        <p className="mt-1 text-lg font-medium">{compensation.effective_date}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {leaveBalances.length > 0 && (
                                        <Card className="border-border bg-card shadow-sm">
                                            <CardHeader>
                                                <CardTitle>Leave Balances</CardTitle>
                                                <CardDescription>Current leave credits</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                                    {leaveBalances.map((lb) => (
                                                        <div key={lb.leave_type} className="rounded-lg border bg-muted p-4">
                                                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{lb.leave_type}</p>
                                                            <p className="mt-1 text-2xl font-semibold">{lb.balance} <span className="text-sm font-normal text-muted-foreground">days</span></p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )}

                                    {recentLeave.length > 0 && (
                                        <Card className="border-border bg-card shadow-sm">
                                            <CardHeader><CardTitle>Recent Leave Requests</CardTitle></CardHeader>
                                            <CardContent>
                                                <div className="divide-y">
                                                    {recentLeave.map((lr) => (
                                                        <div key={lr.id} className="flex items-center justify-between gap-4 py-3">
                                                            <div>
                                                                <p className="text-sm font-medium">{lr.leave_type}</p>
                                                                <p className="text-xs text-muted-foreground">{lr.start_date} – {lr.end_date} ({lr.days} day{lr.days !== 1 ? 's' : ''})</p>
                                                            </div>
                                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[lr.status] ?? 'bg-muted text-muted-foreground'}`}>
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
                        ) : (
                            <Card className="border-border bg-card shadow-sm">
                                <CardContent className="flex flex-col items-center gap-3 py-10 text-muted-foreground">
                                    <User className="size-10" />
                                    <p className="text-sm font-medium">No employee record linked to your account.</p>
                                    <p className="text-xs">Please contact HR to link your profile.</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    <Separator />

                    {/* Account settings section */}
                    <div className="space-y-6">
                        <Heading
                            variant="small"
                            title="Account information"
                            description="Update your login name and email address"
                        />

                        <Form
                            {...ProfileController.update.form()}
                            options={{
                                preserveScroll: true,
                            }}
                            className="space-y-6"
                        >
                            {({ processing, recentlySuccessful, errors }) => (
                                <>
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>

                                        <Input
                                            id="name"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.name}
                                            name="name"
                                            required
                                            autoComplete="name"
                                            placeholder="Full name"
                                        />

                                        <InputError className="mt-2" message={errors.name} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>

                                        <Input
                                            id="email"
                                            type="email"
                                            className="mt-1 block w-full"
                                            defaultValue={auth.user.email}
                                            name="email"
                                            required
                                            autoComplete="username"
                                            placeholder="Email address"
                                        />

                                        <InputError className="mt-2" message={errors.email} />
                                    </div>

                                    {mustVerifyEmail && auth.user.email_verified_at === null && (
                                        <div>
                                            <p className="-mt-4 text-sm text-muted-foreground">
                                                Your email address is unverified.{' '}
                                                <Link
                                                    href={send()}
                                                    as="button"
                                                    className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                                >
                                                    Click here to resend the verification email.
                                                </Link>
                                            </p>

                                            {status === 'verification-link-sent' && (
                                                <div className="mt-2 text-sm font-medium text-green-600">
                                                    A new verification link has been sent to your email address.
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4">
                                        <Button disabled={processing} data-test="update-profile-button">
                                            Save
                                        </Button>

                                        <Transition
                                            show={recentlySuccessful}
                                            enter="transition ease-in-out"
                                            enterFrom="opacity-0"
                                            leave="transition ease-in-out"
                                            leaveTo="opacity-0"
                                        >
                                            <p className="text-sm text-neutral-600">Saved</p>
                                        </Transition>
                                    </div>
                                </>
                            )}
                        </Form>
                    </div>

                    <DeleteUser />
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
