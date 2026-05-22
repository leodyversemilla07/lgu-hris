import { Head, Link } from '@inertiajs/react';
import { Building2, ChevronRight, ShieldCheck } from 'lucide-react';
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
    requirements as installRequirements,
} from '@/actions/App/Http/Controllers/InstallationController';

type Step = Record<string, string>;

type Props = {
    currentStep: number;
    steps: Step;
};

export default function InstallationIndex({ steps }: Props) {
    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Installation" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                        <Building2 className="size-6" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">
                        LGU-HRIS
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Local Government Unit — Human Resource Information
                        System
                    </p>
                </div>

                <Card>
                    <CardHeader className="text-center">
                        <CardTitle className="text-xl">
                            Welcome to the installation wizard
                        </CardTitle>
                        <CardDescription>
                            This wizard will guide you through setting up the
                            system. The process takes just a few minutes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col gap-2">
                            {Object.entries(steps).map(([step, label]) => (
                                <div
                                    key={step}
                                    className="flex items-center gap-3 rounded-lg border bg-muted/20 px-4 py-3 text-sm"
                                >
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                                        {step}
                                    </div>
                                    <span>{label}</span>
                                    <div className="ml-auto text-muted-foreground">
                                        <ChevronRight className="size-4" />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                            <ShieldCheck className="mt-0.5 size-4 shrink-0" />
                            <p>
                                Ensure your server meets the system requirements
                                before proceeding. You will need database access
                                credentials.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button asChild className="w-full" size="lg">
                            <Link href={installRequirements.url()}>
                                Start installation
                                <ChevronRight data-icon="inline-end" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>

                <p className="text-center text-xs text-muted-foreground">
                    &copy; {new Date().getFullYear()} LGU-HRIS. All rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
