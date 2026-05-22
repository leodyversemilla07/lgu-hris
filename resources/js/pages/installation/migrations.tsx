import { Head, Link, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Database,
    Loader2,
    Server,
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
    environment as installEnvironment,
    runMigrations,
    admin as installAdmin,
} from '@/actions/App/Http/Controllers/InstallationController';

type Props = {
    currentStep: number;
    steps: Record<string, string>;
    dbConnected: boolean;
};

export default function InstallationMigrations({
    steps,
    dbConnected,
}: Props) {
    const form = useForm({});

    function handleRun(): void {
        form.post(runMigrations.url());
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Run Migrations" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <StepIndicator currentStep={5} steps={steps} />

                <Card>
                    <CardHeader>
                        <CardTitle>Database migrations</CardTitle>
                        <CardDescription>
                            Run the database migrations and seeders to set up
                            all required tables and reference data.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex items-center gap-3 rounded-lg border p-4 text-sm">
                            <div
                                className={`flex size-10 shrink-0 items-center justify-center rounded-full ${
                                    dbConnected
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                }`}
                            >
                                {dbConnected ? (
                                    <Database className="size-5" />
                                ) : (
                                    <Server className="size-5" />
                                )}
                            </div>
                            <div>
                                <span className="font-medium">
                                    {dbConnected
                                        ? 'Database connected'
                                        : 'No database connection'}
                                </span>
                                <p className="text-muted-foreground">
                                    {dbConnected
                                        ? 'Ready to run migrations.'
                                        : 'Go back to the database step and configure the connection.'}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                            <p className="mb-2">
                                This step will:
                            </p>
                            <ul className="ml-4 list-disc space-y-1">
                                <li>
                                    Create all database tables (users,
                                    employees, leave, attendance, etc.)
                                </li>
                                <li>
                                    Seed reference data (leave types, default
                                    roles and permissions)
                                </li>
                                <li>
                                    Set up the application schema for first use
                                </li>
                            </ul>
                        </div>

                        {form.wasSuccessful && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                Migrations completed successfully!
                            </div>
                        )}

                        {form.hasErrors && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                {form.errors.database ??
                                    'Migration failed. Check the database connection and try again.'}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button asChild variant="outline">
                            <Link href={installEnvironment.url()}>
                                <ChevronLeft data-icon="inline-start" />
                                Back
                            </Link>
                        </Button>
                        {form.wasSuccessful ? (
                            <Button asChild>
                                <Link href={installAdmin.url()}>
                                    Continue
                                    <ChevronRight data-icon="inline-end" />
                                </Link>
                            </Button>
                        ) : (
                            <Button
                                onClick={handleRun}
                                disabled={form.processing || !dbConnected}
                            >
                                {form.processing ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        Running migrations...
                                    </>
                                ) : (
                                    <>
                                        <Server data-icon="inline-start" />
                                        Run migrations
                                    </>
                                )}
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
