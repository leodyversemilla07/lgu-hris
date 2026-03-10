import { Head } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import { ArrowRight, ArrowRightLeft, Building2, CalendarCheck2, Clock3, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

type KpiData = {
    totalActive: number;
    totalInactive: number;
    pendingLeave: number;
    approvedLeaveThisMonth: number;
    totalLeaveDaysThisMonth: number;
    attendanceThisMonth: {
        total_present: number;
        total_absent: number;
        total_late_minutes: number;
        employees_logged: number;
    };
    byStatus: { label: string; value: number }[];
    byDepartment: { label: string; value: number }[];
};

type RecentMovement = {
    id: number;
    employee: string;
    type: string;
    effective_date: string;
    order_number: string | null;
};

type Props = {
    kpis: KpiData;
    recentMovements: RecentMovement[];
};

export default function Dashboard({ kpis, recentMovements }: Props) {
    const monthName = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="LGU HRIS Dashboard" />
            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.18),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">

                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl border border-slate-200/75 bg-slate-950 px-6 py-8 text-white shadow-sm md:px-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(96,165,250,0.28),_transparent_30%),linear-gradient(135deg,_rgba(31,78,121,0.22),_transparent_58%)]" />
                    <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl space-y-4">
                            <Badge className="bg-white/12 text-white hover:bg-white/12">
                                LGU Human Resource Information System
                            </Badge>
                            <div className="space-y-2">
                                <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                                    HR Command Center
                                </h1>
                                <p className="max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
                                    Live overview of workforce data, leave activity, attendance, and recent personnel movements.
                                </p>
                            </div>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Button asChild className="bg-white text-slate-950 hover:bg-slate-100">
                                <Link href="/employees">Open employee workspace <ArrowRight className="size-4" /></Link>
                            </Button>
                            <Button asChild variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                                <Link href="/reports">View reports <ArrowRight className="size-4" /></Link>
                            </Button>
                        </div>
                    </div>
                </section>

                {/* KPI Cards */}
                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                <Users className="size-4" /> Active Employees
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-slate-900">{kpis.totalActive}</p>
                            <p className="mt-1 text-xs text-slate-500">{kpis.totalInactive} inactive</p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                <CalendarCheck2 className="size-4" /> Leave – {monthName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-slate-900">{kpis.totalLeaveDaysThisMonth.toFixed(1)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                                {kpis.approvedLeaveThisMonth} approved &middot; {kpis.pendingLeave} pending
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                <Clock3 className="size-4" /> Attendance – {monthName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-slate-900">{kpis.attendanceThisMonth.employees_logged}</p>
                            <p className="mt-1 text-xs text-slate-500">
                                employees logged &middot; {kpis.attendanceThisMonth.total_absent} absent days
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200/75 bg-white/92 shadow-sm">
                        <CardHeader className="pb-2">
                            <CardDescription className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500">
                                <ArrowRightLeft className="size-4" /> Recent Movements
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-slate-900">{recentMovements.length}</p>
                            <p className="mt-1 text-xs text-slate-500">most recent entries</p>
                        </CardContent>
                    </Card>
                </section>

                {/* Distribution + Movements */}
                <section className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    {/* Status + Dept distribution */}
                    <div className="grid gap-6">
                        <Card className="border-slate-200/75 bg-white/94 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-slate-950">Employment Status Distribution</CardTitle>
                                <CardDescription>Active employees by status</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {kpis.byStatus.map((s) => (
                                    <div key={s.label} className="flex items-center justify-between gap-3">
                                        <span className="text-sm text-slate-700">{s.label}</span>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 rounded-full bg-[#1e3a5f]" style={{ width: `${Math.max(20, (s.value / kpis.totalActive) * 180)}px` }} />
                                            <span className="w-8 text-right text-sm font-semibold text-slate-900">{s.value}</span>
                                        </div>
                                    </div>
                                ))}
                                {kpis.byStatus.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200/75 bg-white/94 shadow-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-950">
                                    <Building2 className="size-4" /> Employees by Department
                                </CardTitle>
                                <CardDescription>Top departments by headcount</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {kpis.byDepartment.map((d) => (
                                    <div key={d.label} className="flex items-center justify-between gap-3">
                                        <span className="truncate text-sm text-slate-700">{d.label}</span>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <div className="h-2 rounded-full bg-slate-400" style={{ width: `${Math.max(20, (d.value / kpis.totalActive) * 180)}px` }} />
                                            <span className="w-8 text-right text-sm font-semibold text-slate-900">{d.value}</span>
                                        </div>
                                    </div>
                                ))}
                                {kpis.byDepartment.length === 0 && <p className="text-sm text-slate-400">No data yet.</p>}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Movements */}
                    <Card className="border-slate-200/75 bg-white/94 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">Recent Personnel Movements</CardTitle>
                            <CardDescription>Latest 5 recorded movements</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentMovements.map((m) => (
                                <Link
                                    key={m.id}
                                    href={`/personnel-movements/${m.id}`}
                                    className="group block rounded-xl border border-slate-200 bg-slate-50/80 p-4 transition hover:border-[#1f4e79]/30 hover:bg-white"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">{m.employee}</p>
                                            <p className="text-xs text-slate-500">{m.type}</p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-xs text-slate-500">{m.effective_date}</p>
                                            {m.order_number && (
                                                <p className="text-xs text-slate-400">#{m.order_number}</p>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                            {recentMovements.length === 0 && (
                                <p className="text-sm text-slate-400">No movements recorded yet.</p>
                            )}
                            <Button asChild variant="outline" size="sm" className="w-full mt-2">
                                <Link href="/personnel-movements">View all movements <ArrowRight className="size-3" /></Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>
            </div>
        </AppLayout>
    );
}

