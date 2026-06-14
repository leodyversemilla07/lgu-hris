import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Globe, Settings } from 'lucide-react';
import {
    database as installDatabase,
    saveEnvironment,
} from '@/actions/App/Http/Controllers/InstallationController';
import InputError from '@/components/input-error';
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

type Props = {
    currentStep: number;
    steps: Record<string, string>;
    appUrl: string;
    appName: string;
};

export default function InstallationEnvironment({
    steps,
    appUrl,
    appName,
}: Props) {
    const form = useForm({
        app_name: appName,
        app_url: appUrl,
    });

    function handleSubmit(): void {
        form.post(saveEnvironment.url());
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Environment Configuration" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <StepIndicator currentStep={4} steps={steps} />

                <Card>
                    <CardHeader>
                        <CardTitle>Application settings</CardTitle>
                        <CardDescription>
                            Configure your application name and URL. These can
                            be changed later in the .env file.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>
                                Application name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Settings className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    value={form.data.app_name}
                                    onChange={(e) =>
                                        form.setData(
                                            'app_name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="LGU-HRIS"
                                />
                            </div>
                            <InputError message={form.errors.app_name} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>
                                Application URL{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Globe className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    value={form.data.app_url}
                                    onChange={(e) =>
                                        form.setData(
                                            'app_url',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="http://localhost"
                                />
                            </div>
                            <InputError message={form.errors.app_url} />
                        </div>

                        <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-800">
                            <p>
                                The application name appears in system emails
                                and the browser title. The URL must match where
                                the application is deployed.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button asChild variant="outline">
                            <Link href={installDatabase.url()}>
                                <ChevronLeft data-icon="inline-start" />
                                Back
                            </Link>
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={form.processing}
                        >
                            Save & continue
                            <ChevronRight data-icon="inline-end" />
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
            {entries.map(([step], index) => {
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
