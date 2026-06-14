import { Head, Link, useForm } from '@inertiajs/react';
import {
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Eye,
    EyeOff,
    ShieldCheck,
    UserRound,
} from 'lucide-react';
import { useState } from 'react';
import {
    migrations as installMigrations,
    createAdmin,
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
};

export default function InstallationAdmin({ steps }: Props) {
    const form = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    function handleSubmit(): void {
        form.post(createAdmin.url());
    }

    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Create Admin" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <StepIndicator currentStep={6} steps={steps} />

                <Card>
                    <CardHeader>
                        <CardTitle>Create admin account</CardTitle>
                        <CardDescription>
                            Set up the first administrator account. This account
                            will have full access to the system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>
                                Full name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    className="pl-9"
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder="e.g., Juan Dela Cruz"
                                />
                            </div>
                            <InputError message={form.errors.name} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>
                                Email address{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    @
                                </span>
                                <Input
                                    className="pl-9"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData('email', e.target.value)
                                    }
                                    placeholder="admin@lgu.gov.ph"
                                />
                            </div>
                            <InputError message={form.errors.email} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>
                                Password{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    className="pr-9"
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData(
                                            'password',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Min. 8 characters"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                            <InputError message={form.errors.password} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label>
                                Confirm password{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <div className="relative">
                                <Input
                                    className="pr-9"
                                    type={showConfirm ? 'text' : 'password'}
                                    value={form.data.password_confirmation}
                                    onChange={(e) =>
                                        form.setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Repeat password"
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    onClick={() =>
                                        setShowConfirm(!showConfirm)
                                    }
                                >
                                    {showConfirm ? (
                                        <EyeOff className="size-4" />
                                    ) : (
                                        <Eye className="size-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={form.errors.password_confirmation}
                            />
                        </div>

                        <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                            <p>
                                Save these credentials securely. This is the
                                only time you can set up the initial admin
                                account through the wizard.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button asChild variant="outline">
                            <Link href={installMigrations.url()}>
                                <ChevronLeft data-icon="inline-start" />
                                Back
                            </Link>
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={form.processing}
                        >
                            {form.processing ? (
                                'Creating admin account...'
                            ) : (
                                <>
                                    Complete installation
                                    <ChevronRight data-icon="inline-end" />
                                </>
                            )}
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
