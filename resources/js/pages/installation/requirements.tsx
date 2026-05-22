import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    index as installIndex,
    database as installDatabase,
} from '@/actions/App/Http/Controllers/InstallationController';

type CheckItem = {
    label: string;
    passed: boolean;
    type: 'requirement' | 'permission';
};

type Props = {
    currentStep: number;
    steps: Record<string, string>;
    results: { checks: CheckItem[]; overall: boolean };
    passed: boolean;
};

export default function InstallationRequirements({
    steps,
    results,
    passed,
}: Props) {
    const requirementCount = results.checks.filter(
        (c) => c.type === 'requirement',
    ).length;
    const passedCount = results.checks.filter((c) => c.passed).length;

    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Requirements Check" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <StepIndicator currentStep={2} steps={steps} />

                <Card>
                    <CardHeader>
                        <CardTitle>System requirements</CardTitle>
                        <CardDescription>
                            Verify that your server meets all the minimum
                            requirements before proceeding.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 rounded-lg border p-4 text-sm">
                            <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                                {passed ? (
                                    <CheckCircle2 className="size-5" />
                                ) : (
                                    <XCircle className="size-5" />
                                )}
                            </div>
                            <div>
                                <span className="font-medium">
                                    {passed
                                        ? 'All checks passed'
                                        : 'Some checks failed'}
                                </span>
                                <p className="text-muted-foreground">
                                    {passedCount} of{' '}
                                    {results.checks.length} checks passed
                                </p>
                            </div>
                        </div>

                        {['requirement', 'permission'].map((type) => (
                            <div key={type} className="flex flex-col gap-2">
                                <h3 className="text-sm font-medium capitalize">
                                    {type === 'requirement'
                                        ? 'PHP Extensions & Runtime'
                                        : 'Directory Permissions'}
                                </h3>
                                <div className="flex flex-col gap-1.5">
                                    {results.checks
                                        .filter((c) => c.type === type)
                                        .map((check) => (
                                            <div
                                                key={check.label}
                                                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                                                    check.passed
                                                        ? 'border-green-200 bg-green-50'
                                                        : 'border-red-200 bg-red-50'
                                                }`}
                                            >
                                                {check.passed ? (
                                                    <CheckCircle2 className="size-4 shrink-0 text-green-600" />
                                                ) : (
                                                    <XCircle className="size-4 shrink-0 text-red-600" />
                                                )}
                                                <span
                                                    className={
                                                        check.passed
                                                            ? 'text-green-800'
                                                            : 'text-red-800'
                                                    }
                                                >
                                                    {check.label}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button asChild variant="outline">
                            <Link href={installIndex.url()}>
                                <ChevronLeft data-icon="inline-start" />
                                Back
                            </Link>
                        </Button>
                        {passed ? (
                            <Button asChild>
                                <Link href={installDatabase.url()}>
                                    Continue
                                    <ChevronRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        ) : (
                            <Button disabled>
                                Fix issues to continue
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

function StepIndicator({
    currentStep,
    steps,
}: {
    currentStep: number;
    steps: Record<string, string>;
}) {
    const entries = Object.entries(steps);

    return (
        <div className="flex items-center justify-center gap-1">
            {entries.map(([step, label], index) => {
                const stepNum = Number(step);
                const isActive = stepNum === currentStep;
                const isComplete = stepNum < currentStep;

                return (
                    <div
                        key={step}
                        className="flex items-center gap-1"
                    >
                        <div
                            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                isActive
                                    ? 'bg-indigo-600 text-white'
                                    : isComplete
                                      ? 'bg-green-500 text-white'
                                      : 'bg-muted text-muted-foreground'
                            }`}
                        >
                            {isComplete ? (
                                <CheckCircle2 className="size-4" />
                            ) : (
                                step
                            )}
                        </div>
                        {index < entries.length - 1 && (
                            <div
                                className={`h-px w-6 ${
                                    isComplete
                                        ? 'bg-green-400'
                                        : 'bg-muted-foreground/20'
                                }`}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
