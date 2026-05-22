import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calculator, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import InputError from '@/components/input-error';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import {
    show as employeeShow,
} from '@/actions/App/Http/Controllers/EmployeeController';
import {
    update as compensationUpdate,
} from '@/actions/App/Http/Controllers/EmployeeCompensationController';

type SalaryGradeGroup = {
    grade: number;
    steps: {
        value: string;
        step: number;
        monthly_salary: string;
        monthly_salary_raw: number;
    }[];
};

type Props = {
    employee: {
        id: number;
        uuid: string;
        full_name: string;
        employee_number: string;
    };
    salaryGrades: SalaryGradeGroup[];
    compensation: {
        id: number;
        salary_grade_id: string;
        grade: number;
        step: number;
        monthly_salary: string;
        effective_date: string;
        allowances: number;
        deductions: number;
        notes: string | null;
    };
};

export default function CompensationEdit({
    employee,
    salaryGrades,
    compensation,
}: Props) {
    const form = useForm({
        salary_grade_id: compensation.salary_grade_id,
        effective_date: compensation.effective_date,
        allowances: String(compensation.allowances),
        deductions: String(compensation.deductions),
        notes: compensation.notes ?? '',
    });

    const selectedGrade = salaryGrades.find((g) =>
        g.steps.some((s) => s.value === form.data.salary_grade_id),
    );
    const selectedStep = selectedGrade?.steps.find(
        (s) => s.value === form.data.salary_grade_id,
    );

    function handleSubmit(): void {
        form.patch(compensationUpdate.url(employee.uuid, compensation.id), {
            onSuccess: () => form.clearErrors(),
        });
    }

    return (
        <AppLayout
            breadcrumbs={
                [
                    { title: 'Dashboard', href: dashboardIndex.url() },
                    { title: employee.full_name, href: employeeShow.url(employee.uuid) },
                    { title: 'Edit compensation', href: '' },
                ] as BreadcrumbItem[]
            }
        >
            <Head title={`Edit Compensation - ${employee.full_name}`} />

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
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        Edit compensation
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {employee.full_name} &mdash;{' '}
                                        {employee.employee_number}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <Button asChild variant="outline">
                                        <Link
                                            href={employeeShow.url(
                                                employee.uuid,
                                            )}
                                        >
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to employee
                                        </Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                    >
                                        <Save data-icon="inline-start" />
                                        Save changes
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-6 px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>
                                            Compensation details
                                        </CardTitle>
                                        <CardDescription>
                                            Update the salary grade, allowances,
                                            and deductions.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                Salary grade{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Select
                                                value={form.data.salary_grade_id}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'salary_grade_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select salary grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {salaryGrades.map(
                                                            (grade) =>
                                                                grade.steps.map(
                                                                    (step) => (
                                                                        <SelectItem
                                                                            key={
                                                                                step.value
                                                                            }
                                                                            value={
                                                                                step.value
                                                                            }
                                                                        >
                                                                            SG{' '}
                                                                            {grade.grade}{' '}
                                                                            - Step{' '}
                                                                            {step.step}{' '}
                                                                            (
                                                                            {step.monthly_salary}
                                                                            )
                                                                        </SelectItem>
                                                                    ),
                                                                ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={
                                                    form.errors.salary_grade_id
                                                }
                                            />
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>
                                                Effective date{' '}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Input
                                                type="date"
                                                value={form.data.effective_date}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'effective_date',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={
                                                    form.errors.effective_date
                                                }
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex flex-col gap-2">
                                                <Label>Allowances</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        form.data.allowances
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'allowances',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        form.errors.allowances
                                                    }
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Label>Deductions</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={
                                                        form.data.deductions
                                                    }
                                                    onChange={(e) =>
                                                        form.setData(
                                                            'deductions',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <InputError
                                                    message={
                                                        form.errors.deductions
                                                    }
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <Label>Notes</Label>
                                            <Textarea
                                                rows={3}
                                                value={form.data.notes}
                                                onChange={(e) =>
                                                    form.setData(
                                                        'notes',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={form.errors.notes}
                                            />
                                        </div>
                                    </CardContent>
                                    <CardFooter className="justify-end gap-2">
                                        <Button asChild variant="outline">
                                            <Link
                                                href={employeeShow.url(
                                                    employee.uuid,
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
                            </div>

                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Current selection</CardTitle>
                                        <CardDescription>
                                            Preview of the selected salary grade
                                            and step.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm">
                                        {selectedStep ? (
                                            <>
                                                <div className="rounded-lg border bg-muted/30 p-3">
                                                    <div className="flex items-center gap-2 font-medium">
                                                        <Calculator className="size-4" />
                                                        Salary information
                                                    </div>
                                                    <div className="mt-2 space-y-1 text-muted-foreground">
                                                        <p>
                                                            Grade: SG{' '}
                                                            {
                                                                selectedGrade?.grade
                                                            }
                                                        </p>
                                                        <p>
                                                            Step:{' '}
                                                            {
                                                                selectedStep.step
                                                            }
                                                        </p>
                                                        <p>
                                                            Monthly:{' '}
                                                            {
                                                                selectedStep.monthly_salary
                                                            }
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <p className="text-muted-foreground">
                                                Select a salary grade to see
                                                details.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
