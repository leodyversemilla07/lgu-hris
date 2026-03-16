import { Head, Link, router } from '@inertiajs/react';
import {
    CheckCircle,
    XCircle,
    AlertCircle,
    ArrowRight,
    ArrowLeft,
    RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import {
    checkRequirements,
    database,
    index as installIndex,
} from '@/actions/App/Http/Controllers/InstallationController';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

interface Requirement {
    php_version?: {
        current: string;
        required: string;
        pass: boolean;
    };
    extensions?: Record<string, boolean>;
    writable?: Record<string, boolean>;
}

interface Props {
    requirements: Requirement;
    passed: boolean;
}

export default function Requirements({ requirements, passed }: Props) {
    const [isChecking, setIsChecking] = useState(false);

    const handleContinue = () => {
        setIsChecking(true);
        router.get(database());
    };

    const handleRetry = () => {
        setIsChecking(true);
        router.get(checkRequirements());
    };

    return (
        <>
            <Head title="System Requirements" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-3xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-6 w-6 text-primary" />
                                System Requirements Check
                            </CardTitle>
                            <CardDescription>
                                Verify that your server meets the minimum
                                requirements
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* PHP Version */}
                            <div>
                                <h3 className="mb-2 font-semibold">
                                    PHP Version
                                </h3>
                                <div className="flex items-center justify-between rounded-lg bg-muted/40 p-3">
                                    <div>
                                        <span className="text-sm text-muted-foreground">
                                            Required:{' '}
                                            {requirements.php_version?.required}
                                            +
                                        </span>
                                        <span className="ml-4 text-sm">
                                            Current:{' '}
                                            {requirements.php_version?.current}
                                        </span>
                                    </div>
                                    {requirements.php_version?.pass ? (
                                        <CheckCircle className="h-5 w-5 text-primary" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                </div>
                            </div>

                            {/* Extensions */}
                            <div>
                                <h3 className="mb-2 font-semibold">
                                    PHP Extensions
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(
                                        requirements.extensions || {},
                                    ).map(([ext, loaded]) => (
                                        <div
                                            key={ext}
                                            className="flex items-center justify-between rounded bg-muted/40 p-2"
                                        >
                                            <span className="text-sm">
                                                {ext}
                                            </span>
                                            {loaded ? (
                                                <CheckCircle className="h-4 w-4 text-primary" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Writable Directories */}
                            <div>
                                <h3 className="mb-2 font-semibold">
                                    Writable Directories
                                </h3>
                                <div className="space-y-2">
                                    {Object.entries(
                                        requirements.writable || {},
                                    ).map(([path, writable]) => (
                                        <div
                                            key={path}
                                            className="flex items-center justify-between rounded bg-muted/40 p-2"
                                        >
                                            <span className="text-sm text-muted-foreground">
                                                {path}
                                            </span>
                                            {writable ? (
                                                <CheckCircle className="h-4 w-4 text-primary" />
                                            ) : (
                                                <XCircle className="h-4 w-4 text-red-500" />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            {passed ? (
                                <Alert variant="default">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <AlertTitle>
                                        All requirements met!
                                    </AlertTitle>
                                    <AlertDescription>
                                        Your server meets all requirements. You
                                        can proceed to database configuration.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>
                                        Requirements not met
                                    </AlertTitle>
                                    <AlertDescription>
                                        Please fix the issues above before
                                        proceeding.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between pt-4">
                                <Link href={installIndex()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleRetry}
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        Retry
                                    </Button>
                                    <Button
                                        onClick={handleContinue}
                                        disabled={!passed || isChecking}
                                    >
                                        Continue
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
