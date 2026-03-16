import { Head, Link } from '@inertiajs/react';
import {
    Settings,
    Database,
    RefreshCw,
    UserPlus,
    CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    admin,
    checkRequirements,
    complete,
    database,
    environment,
    index as installIndex,
    migrations,
} from '@/actions/App/Http/Controllers/InstallationController';

interface Step {
    id: number;
    title: string;
    description: string;
    icon: string;
}

interface Props {
    steps: Step[];
    currentStep: number;
}

const iconMap = {
    'check-circle': CheckCircle,
    database: Database,
    settings: Settings,
    'refresh-cw': RefreshCw,
    'user-plus': UserPlus,
    check: CheckCircle,
};

export default function InstallationIndex({ steps, currentStep }: Props) {
    const progress = (currentStep / steps.length) * 100;

    return (
        <>
            <Head title="Installation Wizard" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-4xl">
                    {/* Logo and Title */}
                    <div className="mb-8 text-center">
                        <h1 className="mb-2 text-4xl font-bold text-foreground">
                            LGU HRIS Installation
                        </h1>
                        <p className="text-muted-foreground">
                            Setup your Human Resource Information System in
                            minutes
                        </p>
                    </div>

                    {/* Progress Bar */}
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="mb-2 flex justify-between">
                                <span className="text-sm font-medium">
                                    Step {currentStep} of {steps.length}
                                </span>
                                <span className="text-sm font-medium">
                                    {Math.round(progress)}%
                                </span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </CardContent>
                    </Card>

                    {/* Steps */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Installation Steps</CardTitle>
                            <CardDescription>
                                Follow these steps to complete the installation
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {steps.map((step) => {
                                    const Icon =
                                        iconMap[
                                        step.icon as keyof typeof iconMap
                                        ] || CheckCircle;
                                    const isActive = step.id === currentStep;
                                    const isCompleted = step.id < currentStep;

                                    return (
                                        <Link
                                            key={step.id}
                                            href={getStepUrl(step.id)}
                                            className={`block rounded-lg border-2 p-4 transition-all ${isActive
                                                ? 'border-primary bg-primary/10'
                                                : isCompleted
                                                    ? 'border-border bg-muted/50'
                                                    : 'border-border/70 hover:border-border'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`rounded-full p-2 ${isActive
                                                        ? 'bg-primary text-primary-foreground'
                                                        : isCompleted
                                                            ? 'bg-secondary text-secondary-foreground'
                                                            : 'bg-muted text-muted-foreground'
                                                        }`}
                                                >
                                                    <Icon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-foreground">
                                                        {step.title}
                                                    </h3>
                                                    <p className="text-sm text-muted-foreground">
                                                        {step.description}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Start */}
                    <div className="mt-6 text-center">
                        <p className="mb-4 text-muted-foreground">
                            New to LGU HRIS? Start the installation wizard to
                            configure your system.
                        </p>
                        <Link href={checkRequirements()}>
                            <Button size="lg">Start Installation</Button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}

function getStepUrl(stepId: number): string {
    switch (stepId) {
        case 1:
            return checkRequirements.url();
        case 2:
            return database.url();
        case 3:
            return environment.url();
        case 4:
            return migrations.url();
        case 5:
            return admin.url();
        case 6:
            return complete.url();
        default:
            return installIndex.url();
    }
}
