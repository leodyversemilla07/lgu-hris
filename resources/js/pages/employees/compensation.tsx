import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
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

type StepOption = {
    value: string;
    step: number;
    monthly_salary: string;
    monthly_salary_raw: number;
};

type GradeGroup = {
    grade: number;
    steps: StepOption[];
};

type CurrentCompensation = {
    id: number;
    salary_grade_id: string;
    grade: number;
    step: number;
    monthly_salary: string;
    effective_date: string;
    allowances: string;
    deductions: string;
    notes: string | null;
};

type Employee = {
    id: number;
    full_name: string;
    employee_number: string;
};

type Props = {
    employee: Employee;
    salaryGrades: GradeGroup[];
    current: CurrentCompensation | null;
};

export default function EmployeeCompensation({
    employee,
    salaryGrades,
    current,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        {
            title: employee.full_name,
            href: `/employees/${employee.id}`,
        },
        { title: 'Compensation', href: '#' },
    ];

    const [selectedGrade, setSelectedGrade] = useState(
        current ? String(salaryGrades.find(g => g.steps.some(s => s.value === current.salary_grade_id))?.grade ?? '') : '',
    );

    const gradeSteps = salaryGrades.find(
        (g) => String(g.grade) === selectedGrade,
    )?.steps ?? [];

    const { data, setData, post, processing, errors } = useForm({
        employee_id: String(employee.id),
        salary_grade_id: current?.salary_grade_id ?? '',
        effective_date: current?.effective_date ?? new Date().toISOString().slice(0, 10),
        allowances: current?.allowances ?? '0',
        deductions: current?.deductions ?? '0',
        notes: current?.notes ?? '',
    });

    const selectedStep = gradeSteps.find((s) => s.value === data.salary_grade_id);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/employees/${employee.id}/compensation`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Compensation — ${employee.full_name}`} />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,_rgba(31,78,121,0.14),_transparent_35%),linear-gradient(180deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.96))] p-4 md:p-6">
                <section className="rounded-3xl border border-slate-200/75 bg-white/92 p-6 shadow-sm md:p-8">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-3">
                            <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                Compensation
                            </Badge>
                            <div className="space-y-1">
                                <h1 className="text-3xl font-semibold tracking-tight text-slate-950">
                                    {employee.full_name}
                                </h1>
                                <p className="text-sm text-slate-500">
                                    {employee.employee_number}
                                </p>
                            </div>
                        </div>
                        <Button asChild variant="outline">
                            <Link href={`/employees/${employee.id}`}>
                                ← Back to employee
                            </Link>
                        </Button>
                    </div>
                </section>

                {current && (
                    <Card className="border-emerald-100 bg-emerald-50/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-emerald-900">
                                Current salary grade
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4 text-sm sm:grid-cols-4">
                            <div>
                                <p className="text-xs font-medium uppercase text-emerald-600">
                                    Grade / Step
                                </p>
                                <p className="font-semibold text-emerald-900">
                                    SG {current.grade} – Step {current.step}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-emerald-600">
                                    Monthly salary
                                </p>
                                <p className="font-semibold text-emerald-900">
                                    ₱{current.monthly_salary}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-emerald-600">
                                    Allowances
                                </p>
                                <p className="text-emerald-900">
                                    ₱{parseFloat(current.allowances).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs font-medium uppercase text-emerald-600">
                                    Effective date
                                </p>
                                <p className="text-emerald-900">
                                    {current.effective_date}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Card className="border-slate-200/75 bg-white/95 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-slate-950">
                                {current ? 'Update' : 'Set'} salary grade
                            </CardTitle>
                            <CardDescription>
                                Each save creates a new effective-dated record.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label>
                                    Salary grade{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={selectedGrade}
                                    onValueChange={(v) => {
                                        setSelectedGrade(v);
                                        setData('salary_grade_id', '');
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {salaryGrades.map((g) => (
                                            <SelectItem
                                                key={g.grade}
                                                value={String(g.grade)}
                                            >
                                                SG {g.grade}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>
                                    Step{' '}
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Select
                                    value={data.salary_grade_id}
                                    onValueChange={(v) =>
                                        setData('salary_grade_id', v)
                                    }
                                    disabled={gradeSteps.length === 0}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select step" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {gradeSteps.map((s) => (
                                            <SelectItem
                                                key={s.value}
                                                value={s.value}
                                            >
                                                Step {s.step} — ₱
                                                {s.monthly_salary}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.salary_grade_id && (
                                    <p className="text-xs text-red-500">
                                        {errors.salary_grade_id}
                                    </p>
                                )}
                            </div>

                            {selectedStep && (
                                <div className="sm:col-span-2 rounded-lg border border-slate-100 bg-slate-50 p-4 text-sm">
                                    <span className="text-slate-500">
                                        Monthly salary:{' '}
                                    </span>
                                    <span className="font-semibold text-slate-900">
                                        ₱{selectedStep.monthly_salary}
                                    </span>
                                </div>
                            )}

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
                                <Label htmlFor="allowances">
                                    Monthly allowances (₱)
                                </Label>
                                <Input
                                    id="allowances"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.allowances}
                                    onChange={(e) =>
                                        setData('allowances', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="deductions">
                                    Monthly deductions (₱)
                                </Label>
                                <Input
                                    id="deductions"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.deductions}
                                    onChange={(e) =>
                                        setData('deductions', e.target.value)
                                    }
                                />
                            </div>

                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) =>
                                        setData('notes', e.target.value)
                                    }
                                    placeholder="e.g. Promotion per CSC Order No. 001-2025"
                                    rows={3}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Button asChild variant="outline">
                            <Link href={`/employees/${employee.id}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving…' : 'Save compensation record'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
