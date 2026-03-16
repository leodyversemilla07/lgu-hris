import { Head, Link, router } from '@inertiajs/react';
import {
    RefreshCw,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Loader2,
    Database,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    admin,
    environment,
    runMigrations as runMigrationsAction,
} from '@/actions/App/Http/Controllers/InstallationController';

export default function Migrations() {
    const [isRunning, setIsRunning] = useState(false);
    const [status, setStatus] = useState<
        'idle' | 'running' | 'success' | 'error'
    >('idle');
    const [message, setMessage] = useState('');
    const [output, setOutput] = useState('');

    useEffect(() => {
        // Auto-start migrations when component mounts
        runMigrations();
    }, []);

    const runMigrations = async () => {
        setIsRunning(true);
        setStatus('running');
        setMessage('Running database migrations...');

        try {
            const response = await fetch(runMigrationsAction.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Database setup completed successfully!');
                setOutput(result.output || '');
            } else {
                setStatus('error');
                setMessage(result.message || 'Migration failed');
            }
        } catch {
            setStatus('error');
            setMessage('Network error. Please try again.');
        } finally {
            setIsRunning(false);
        }
    };

    const handleRetry = () => {
        runMigrations();
    };

    const handleContinue = () => {
        router.get(admin());
    };

    return (
        <>
            <Head title="Database Setup" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-6 w-6 text-primary" />
                                Database Setup
                            </CardTitle>
                            <CardDescription>
                                Running migrations and seeding initial data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Status */}
                            <div className="flex items-center gap-4 rounded-lg bg-muted/40 p-4">
                                {status === 'running' && (
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                )}
                                {status === 'success' && (
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                )}
                                {status === 'error' && (
                                    <RefreshCw className="h-6 w-6 text-red-500" />
                                )}
                                {status === 'idle' && (
                                    <Database className="h-6 w-6 text-muted-foreground" />
                                )}
                                <div>
                                    <p className="font-medium">{message}</p>
                                    {status === 'running' && (
                                        <p className="text-sm text-muted-foreground">
                                            This may take a few moments...
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Output Log */}
                            {output && (
                                <div>
                                    <h3 className="mb-2 font-semibold">
                                        Migration Output
                                    </h3>
                                    <pre className="max-h-64 overflow-auto rounded-lg bg-muted p-4 text-sm text-foreground">
                                        {output}
                                    </pre>
                                </div>
                            )}

                            {/* Error Alert */}
                            {status === 'error' && (
                                <Alert variant="destructive">
                                    <RefreshCw className="h-4 w-4" />
                                    <AlertTitle>Migration Failed</AlertTitle>
                                    <AlertDescription>
                                        {message}. Please check your database
                                        configuration and try again.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Success Alert */}
                            {status === 'success' && (
                                <Alert>
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <AlertTitle>Database Ready!</AlertTitle>
                                    <AlertDescription>
                                        The database has been successfully
                                        configured with all necessary tables and
                                        initial data.
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between pt-4">
                                <Link href={environment()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    {status === 'error' && (
                                        <Button
                                            variant="outline"
                                            onClick={handleRetry}
                                        >
                                            <RefreshCw className="mr-2 h-4 w-4" />
                                            Retry
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleContinue}
                                        disabled={
                                            status !== 'success' || isRunning
                                        }
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
