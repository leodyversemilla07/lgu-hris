import { Head, Link, useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import {
    ArrowLeft,
    BriefcaseBusiness,
    CalendarDays,
    ReceiptText,
    Save,
    Wallet,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Card,
    CardAction,
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

type CompensationForm = {
    employee_id: string;
    salary_grade_id: string;
    effective_date: string;
    allowances: string;
    deductions: string;
    notes: string;
};

type SummaryCard = {
    title: string;
    value: string;
    detail: string;
    icon: typeof Wallet;
};

function toCalendarDate(value: string): Date | undefined {
    return value ? parseISO(value) : undefined;
}

function DatePickerField({
    value,
    onChange,
    placeholder,
    invalid = false,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    invalid?: boolean;
}): ReactNode {
    const selectedDate = toCalendarDate(value);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                    aria-invalid={invalid ? 'true' : 'false'}
                >
                    <CalendarDays data-icon="inline-start" />
                    {selectedDate ? format(selectedDate, 'PPP') : placeholder}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) =>
                        onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}

function FormSection({
    title,
    description,
    children,
}: {
    title: string;
    description: string;
    children: ReactNode;
}): ReactNode {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>{children}</CardContent>
        </Card>
    );
}

function FormField({
    label,
    htmlFor,
    required = false,
    error,
    children,
}: {
    label: string;
    htmlFor?: string;
    required?: boolean;
    error?: string;
    children: ReactNode;
}): ReactNode {
    return (
        <div className="flex flex-col gap-2">
            <Label htmlFor={htmlFor}>
                {label}
                {required ? ' *' : null}
            </Label>
            {children}
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </div>
    );
}

function MetricCard({
    label,
    value,
    detail,
}: {
    label: string;
    value: string;
    detail: string;
}): ReactNode {
    return (
        <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
            </span>
            <span className="text-2xl font-semibold tracking-tight">{value}</span>
            <span className="text-sm text-muted-foreground">{detail}</span>
        </div>
    );
}

function formatCurrency(value: number): string {
    return `₱${value.toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function EmployeeCompensation({
    employee,
    salaryGrades,
    current,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Employees', href: '/employees' },
        { title: employee.full_name, href: `/employees/${employee.id}` },
        { title: 'Compensation', href: '#' },
    ];

    const [selectedGrade, setSelectedGrade] = useState(
        current
            ? String(
                  salaryGrades.find((grade) =>
                      grade.steps.some(
                          (step) => step.value === current.salary_grade_id,
                      ),
                  )?.grade ?? '',
              )
            : '',
    );

    const form = useForm<CompensationForm>({
        employee_id: String(employee.id),
        salary_grade_id: current?.salary_grade_id ?? '',
        effective_date:
            current?.effective_date ?? new Date().toISOString().slice(0, 10),
        allowances: current?.allowances ?? '0',
        deductions: current?.deductions ?? '0',
        notes: current?.notes ?? '',
    });

    const gradeSteps =
        salaryGrades.find((grade) => String(grade.grade) === selectedGrade)
            ?.steps ?? [];
    const selectedStep = gradeSteps.find(
        (step) => step.value === form.data.salary_grade_id,
    );
    const summaryCards: SummaryCard[] = [
        {
            title: 'Compensation mode',
            value: current ? 'Update' : 'Set',
            detail: current
                ? 'Save a new effective-dated compensation record.'
                : 'Assign the first salary grade for this employee.',
            icon: BriefcaseBusiness,
        },
        {
            title: 'Salary grade options',
            value: String(salaryGrades.length),
            detail: 'Available grades with step-based monthly salary tables.',
            icon: Wallet,
        },
        {
            title: 'Selected monthly salary',
            value: selectedStep
                ? formatCurrency(selectedStep.monthly_salary_raw)
                : 'Not set',
            detail: 'Updates when a salary grade step is selected.',
            icon: ReceiptText,
        },
        {
            title: 'Current record',
            value: current ? `SG ${current.grade}-${current.step}` : 'None',
            detail: current
                ? `Effective ${current.effective_date}`
                : 'No active compensation record yet.',
            icon: CalendarDays,
        },
    ];

    function submit(event: React.FormEvent<HTMLFormElement>): void {
        event.preventDefault();
        form.post(`/employees/${employee.id}/compensation`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Compensation — ${employee.full_name}`} />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <form
                        onSubmit={submit}
                        className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                    >
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                <div className="flex max-w-3xl flex-col gap-2">
                                    <Badge variant="outline" className="w-fit">
                                        Compensation management
                                    </Badge>
                                    <h1 className="text-2xl font-semibold tracking-tight">
                                        {current
                                            ? 'Update employee compensation'
                                            : 'Set employee compensation'}
                                    </h1>
                                    <p className="text-sm text-muted-foreground">
                                        {employee.full_name} ·{' '}
                                        {employee.employee_number}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Keep salary grade, effective date, and
                                        recurring adjustments aligned with the
                                        employee&apos;s latest personnel action.
                                    </p>
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap xl:justify-end">
                                    <Button asChild variant="outline">
                                        <Link href={`/employees/${employee.id}`}>
                                            <ArrowLeft data-icon="inline-start" />
                                            Back to employee
                                        </Link>
                                    </Button>
                                    <Button type="submit" disabled={form.processing}>
                                        <Save data-icon="inline-start" />
                                        {form.processing
                                            ? 'Saving...'
                                            : 'Save compensation'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
                            {summaryCards.map((item) => (
                                <Card key={item.title} className="@container/card">
                                    <CardHeader>
                                        <CardDescription>
                                            {item.title}
                                        </CardDescription>
                                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                            {item.value}
                                        </CardTitle>
                                        <CardAction>
                                            <Badge variant="outline">
                                                <item.icon />
                                                Snapshot
                                            </Badge>
                                        </CardAction>
                                    </CardHeader>
                                    <CardFooter className="text-sm text-muted-foreground">
                                        {item.detail}
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <div className="grid gap-6 px-4 lg:px-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                            <div className="flex flex-col gap-6">
                                <FormSection
                                    title="Salary grade assignment"
                                    description="Choose the grade and step that defines the employee's base monthly salary."
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField label="Salary grade" required>
                                            <Select
                                                value={selectedGrade}
                                                onValueChange={(value) => {
                                                    setSelectedGrade(value);
                                                    form.setData(
                                                        'salary_grade_id',
                                                        '',
                                                    );
                                                }}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select grade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {salaryGrades.map(
                                                            (grade) => (
                                                                <SelectItem
                                                                    key={
                                                                        grade.grade
                                                                    }
                                                                    value={String(
                                                                        grade.grade,
                                                                    )}
                                                                >
                                                                    SG{' '}
                                                                    {
                                                                        grade.grade
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>

                                        <FormField
                                            label="Step"
                                            required
                                            error={form.errors.salary_grade_id}
                                        >
                                            <Select
                                                value={form.data.salary_grade_id}
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'salary_grade_id',
                                                        value,
                                                    )
                                                }
                                                disabled={
                                                    gradeSteps.length === 0
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Select step" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        {gradeSteps.map(
                                                            (step) => (
                                                                <SelectItem
                                                                    key={
                                                                        step.value
                                                                    }
                                                                    value={
                                                                        step.value
                                                                    }
                                                                >
                                                                    Step{' '}
                                                                    {step.step} -
                                                                    {' '}
                                                                    ₱
                                                                    {
                                                                        step.monthly_salary
                                                                    }
                                                                </SelectItem>
                                                            ),
                                                        )}
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </FormField>
                                    </div>

                                    {selectedStep ? (
                                        <div className="mt-4 rounded-lg border bg-muted/30 p-4">
                                            <p className="text-sm text-muted-foreground">
                                                Selected monthly salary
                                            </p>
                                            <p className="text-2xl font-semibold tracking-tight">
                                                {formatCurrency(
                                                    selectedStep.monthly_salary_raw,
                                                )}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Grade {selectedGrade}, step{' '}
                                                {selectedStep.step}.
                                            </p>
                                        </div>
                                    ) : null}
                                </FormSection>

                                <FormSection
                                    title="Effective details"
                                    description="Capture when this compensation takes effect and any recurring monthly adjustments."
                                >
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <FormField
                                            label="Effective date"
                                            htmlFor="effective_date"
                                            required
                                            error={form.errors.effective_date}
                                        >
                                            <DatePickerField
                                                value={form.data.effective_date}
                                                onChange={(value) =>
                                                    form.setData(
                                                        'effective_date',
                                                        value,
                                                    )
                                                }
                                                placeholder="Pick effective date"
                                                invalid={Boolean(
                                                    form.errors.effective_date,
                                                )}
                                            />
                                        </FormField>

                                        <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                                            <FormField
                                                label="Monthly allowances (PHP)"
                                                htmlFor="allowances"
                                            >
                                                <Input
                                                    id="allowances"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.data.allowances}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'allowances',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </FormField>

                                            <FormField
                                                label="Monthly deductions (PHP)"
                                                htmlFor="deductions"
                                            >
                                                <Input
                                                    id="deductions"
                                                    type="number"
                                                    min="0"
                                                    step="0.01"
                                                    value={form.data.deductions}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'deductions',
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                            </FormField>
                                        </div>

                                        <div className="md:col-span-2">
                                            <FormField label="Notes" htmlFor="notes">
                                                <Textarea
                                                    id="notes"
                                                    value={form.data.notes}
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'notes',
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="e.g. Promotion per CSC Order No. 001-2025"
                                                    rows={4}
                                                />
                                            </FormField>
                                        </div>
                                    </div>
                                </FormSection>
                            </div>

                            <div className="flex flex-col gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Current record</CardTitle>
                                        <CardDescription>
                                            Latest compensation data currently
                                            stored for this employee.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-4">
                                        {current ? (
                                            <>
                                                <MetricCard
                                                    label="Salary grade"
                                                    value={`SG ${current.grade}-${current.step}`}
                                                    detail="Latest assigned salary grade and step."
                                                />
                                                <MetricCard
                                                    label="Monthly salary"
                                                    value={`₱${current.monthly_salary}`}
                                                    detail="Current base monthly salary."
                                                />
                                                <MetricCard
                                                    label="Allowances"
                                                    value={formatCurrency(
                                                        Number(
                                                            current.allowances,
                                                        ),
                                                    )}
                                                    detail="Current recurring allowances."
                                                />
                                                <MetricCard
                                                    label="Effective date"
                                                    value={current.effective_date}
                                                    detail="Start date of the latest compensation record."
                                                />
                                            </>
                                        ) : (
                                            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                                                <Badge
                                                    variant="outline"
                                                    className="w-fit"
                                                >
                                                    No record yet
                                                </Badge>
                                                <p>
                                                    This employee does not have
                                                    a compensation record yet.
                                                    Save the form to create the
                                                    first effective-dated entry.
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Before saving</CardTitle>
                                        <CardDescription>
                                            Keep these checks in mind before you
                                            store the new compensation entry.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                                        <p>
                                            Choose both the salary grade and
                                            step so the base monthly salary is
                                            defined correctly.
                                        </p>
                                        <p>
                                            Confirm the effective date matches
                                            the employee&apos;s latest approved
                                            appointment or personnel action.
                                        </p>
                                        <p>
                                            Encode recurring allowances and
                                            deductions only; one-time payroll
                                            adjustments should stay outside this
                                            record.
                                        </p>
                                    </CardContent>
                                    <CardFooter className="flex flex-col gap-3 sm:flex-row">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={form.processing}
                                        >
                                            <Save data-icon="inline-start" />
                                            {form.processing
                                                ? 'Saving...'
                                                : 'Save compensation'}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            asChild
                                        >
                                            <Link href={`/employees/${employee.id}`}>
                                                Cancel
                                            </Link>
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
