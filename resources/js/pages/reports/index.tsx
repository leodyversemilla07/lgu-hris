import { Head, router } from '@inertiajs/react';
import { Download, FileSpreadsheet, FileText, Users, ArrowRightLeft, CalendarDays, ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Reports', href: '/reports' },
];

type SelectOption = { value: string; label: string };

type Props = {
    departments: SelectOption[];
    employees: SelectOption[];
    leaveTypes: SelectOption[];
    years: SelectOption[];
};

function buildUrl(base: string, params: Record<string, string | undefined>) {
    const url = new URL(base, window.location.origin);
    Object.entries(params).forEach(([k, v]) => {
        if (v && v !== 'all') url.searchParams.set(k, v);
    });
    return url.pathname + url.search;
}

function downloadUrl(path: string) {
    window.location.href = path;
}

export default function ReportsIndex({ departments, employees, years }: Props) {
    const [masterlistDept, setMasterlistDept] = useState('all');
    const [masterlistStatus, setMasterlistStatus] = useState('active');

    const [plantillaDept, setPlantillaDept] = useState('all');

    const [leaveYear, setLeaveYear] = useState(String(new Date().getFullYear()));
    const [leaveDept, setLeaveDept] = useState('all');
    const [leaveEmployee, setLeaveEmployee] = useState('all');

    const [attendYear, setAttendYear] = useState(String(new Date().getFullYear()));
    const [attendMonth, setAttendMonth] = useState('all');
    const [attendDept, setAttendDept] = useState('all');

    const [movDateFrom, setMovDateFrom] = useState('');
    const [movDateTo, setMovDateTo] = useState('');
    const [movDept, setMovDept] = useState('all');
    const [movEmployee, setMovEmployee] = useState('all');

    const [srEmployee, setSrEmployee] = useState('');

    const months = [
        { value: '1', label: 'January' }, { value: '2', label: 'February' },
        { value: '3', label: 'March' }, { value: '4', label: 'April' },
        { value: '5', label: 'May' }, { value: '6', label: 'June' },
        { value: '7', label: 'July' }, { value: '8', label: 'August' },
        { value: '9', label: 'September' }, { value: '10', label: 'October' },
        { value: '11', label: 'November' }, { value: '12', label: 'December' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reports" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Reports &amp; Exports</h1>
                    <p className="mt-1 text-sm text-slate-500">Generate compliance-ready exports in Excel, CSV, or PDF.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">

                    {/* Personnel Masterlist */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <Users className="size-5 text-[#1e3a5f]" /> Personnel Masterlist
                            </CardTitle>
                            <CardDescription>Full list of employees with department and position details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Department</label>
                                    <Select value={masterlistDept} onValueChange={setMasterlistDept}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Status</label>
                                    <Select value={masterlistStatus} onValueChange={setMasterlistStatus}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="active">Active only</SelectItem>
                                            <SelectItem value="inactive">Inactive only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/masterlist/excel', { department_id: masterlistDept, status: masterlistStatus }))}>
                                    <FileSpreadsheet className="size-4" /> Excel
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/masterlist/csv', { department_id: masterlistDept, status: masterlistStatus }))}>
                                    <Download className="size-4" /> CSV
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/masterlist/pdf', { department_id: masterlistDept, status: masterlistStatus }))}>
                                    <FileText className="size-4" /> PDF
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Plantilla of Personnel */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <ClipboardList className="size-5 text-[#1e3a5f]" /> Plantilla of Personnel
                            </CardTitle>
                            <CardDescription>Authorized positions with incumbents and vacancy status.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Department</label>
                                <Select value={plantillaDept} onValueChange={setPlantillaDept}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Departments</SelectItem>
                                        {departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/plantilla/excel', { department_id: plantillaDept }))}>
                                    <FileSpreadsheet className="size-4" /> Excel
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/plantilla/csv', { department_id: plantillaDept }))}>
                                    <Download className="size-4" /> CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Leave Ledger */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <CalendarDays className="size-5 text-[#1e3a5f]" /> Leave Ledger
                            </CardTitle>
                            <CardDescription>Leave requests filtered by year, department, or employee.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Year</label>
                                    <Select value={leaveYear} onValueChange={setLeaveYear}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {years.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Department</label>
                                    <Select value={leaveDept} onValueChange={setLeaveDept}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Departments</SelectItem>
                                            {departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Employee (optional)</label>
                                <Select value={leaveEmployee} onValueChange={setLeaveEmployee}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Employees</SelectItem>
                                        {employees.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/leave-ledger/excel', { year: leaveYear, department_id: leaveDept, employee_id: leaveEmployee }))}>
                                    <FileSpreadsheet className="size-4" /> Excel
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/leave-ledger/csv', { year: leaveYear, department_id: leaveDept, employee_id: leaveEmployee }))}>
                                    <Download className="size-4" /> CSV
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Attendance Summary */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <CalendarDays className="size-5 text-[#1e3a5f]" /> Attendance Summary
                            </CardTitle>
                            <CardDescription>Monthly attendance data with present, absent, and late totals.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Year</label>
                                    <Select value={attendYear} onValueChange={setAttendYear}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {years.map((y) => <SelectItem key={y.value} value={y.value}>{y.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Month</label>
                                    <Select value={attendMonth} onValueChange={setAttendMonth}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Months</SelectItem>
                                            {months.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Department</label>
                                    <Select value={attendDept} onValueChange={setAttendDept}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/attendance/excel', { year: attendYear, month: attendMonth, department_id: attendDept }))}>
                                <FileSpreadsheet className="size-4" /> Excel
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Personnel Movements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <ArrowRightLeft className="size-5 text-[#1e3a5f]" /> Personnel Movements
                            </CardTitle>
                            <CardDescription>Transfers, promotions, and separations by date range.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">From date</label>
                                    <input type="date" value={movDateFrom} onChange={(e) => setMovDateFrom(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">To date</label>
                                    <input type="date" value={movDateTo} onChange={(e) => setMovDateTo(e.target.value)}
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Department</label>
                                    <Select value={movDept} onValueChange={setMovDept}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {departments.map((d) => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-600">Employee</label>
                                    <Select value={movEmployee} onValueChange={setMovEmployee}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            {employees.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <Button size="sm" variant="outline" onClick={() => downloadUrl(buildUrl('/exports/movements/excel', { date_from: movDateFrom || undefined, date_to: movDateTo || undefined, department_id: movDept, employee_id: movEmployee }))}>
                                <FileSpreadsheet className="size-4" /> Excel
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Service Record */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-900">
                                <FileText className="size-5 text-[#1e3a5f]" /> Service Record (PDF)
                            </CardTitle>
                            <CardDescription>Individual service record with compensation and movement history.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-600">Select Employee</label>
                                <Select value={srEmployee} onValueChange={setSrEmployee}>
                                    <SelectTrigger><SelectValue placeholder="Choose employee…" /></SelectTrigger>
                                    <SelectContent>
                                        {employees.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <Button
                                size="sm"
                                variant="outline"
                                disabled={!srEmployee}
                                onClick={() => srEmployee && downloadUrl(`/exports/service-record/${srEmployee}/pdf`)}
                            >
                                <FileText className="size-4" /> Download PDF
                            </Button>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </AppLayout>
    );
}

