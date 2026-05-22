import { Head, Link } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { index as installIndex } from '@/actions/App/Http/Controllers/InstallationController';

type Props = {
    currentStep: number;
    steps: Record<string, string>;
};

export default function InstallationComplete({ steps }: Props) {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Installation Complete" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <StepIndicator currentStep={7} steps={steps} />

                <Card>
                    <CardHeader className="items-center text-center">
                        <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
                            <PartyPopper className="size-8" />
                        </div>
                        <CardTitle className="text-xl">
                            Installation complete!
                        </CardTitle>
                        <CardDescription>
                            The system has been installed and configured
                            successfully. You can now log in and start using
                            LGU-HRIS.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                            <h4 className="mb-2 font-medium">
                                What happens next?
                            </h4>
                            <ul className="ml-4 list-disc space-y-1">
                                <li>
                                    Log in using the admin account you just
                                    created.
                                </li>
                                <li>
                                    Configure leave types, positions, and
                                    departments.
                                </li>
                                <li>
                                    Add employees and set up their user
                                    accounts.
                                </li>
                                <li>
                                    Set up biometric devices for attendance
                                    tracking.
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                            <h4 className="mb-2 font-medium">
                                Security reminder
                            </h4>
                            <p>
                                The installation wizard is now disabled. To
                                re-run it, remove the{' '}
                                <code className="rounded bg-muted px-1 py-0.5 text-xs font-mono">
                                    APP_INSTALLED=true
                                </code>{' '}
                                line from your .env file.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" size="lg">
                            <Link href="/login">
                                Go to login
                                <ChevronRight data-icon="inline-end" />
                            </Link>
                        </Button>
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
                    <div key={step} className="flex items-center gap-1">
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
