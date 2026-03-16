import { Head, Link, router } from '@inertiajs/react';
import {
    Database,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useState } from 'react';
import {
    checkDatabase,
    checkRequirements,
    environment,
    storeDatabase,
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
import {
    Field,
    FieldContent,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';

export default function DatabaseConfig() {
    const [formData, setFormData] = useState({
        host: 'localhost',
        port: '3306',
        database: '',
        username: '',
        password: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{
        success: boolean;
        message: string;
        database_exists?: boolean;
    } | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const response = await fetch(checkDatabase.url(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(formData),
            });

            const rawResponse = await response.text();
            let result: { success?: boolean; message?: string; database_exists?: boolean } = {};

            try {
                result = rawResponse ? JSON.parse(rawResponse) : {};
            } catch {
                result = {};
            }

            if (response.status === 419) {
                setTestResult({
                    success: false,
                    message:
                        'Session expired. Please refresh the page and try again.',
                });

                return;
            }

            if (response.ok) {
                setTestResult({
                    success: Boolean(result.success),
                    message:
                        result.message ??
                        (result.success
                            ? 'Connection successful.'
                            : 'Connection failed.'),
                    database_exists: result.database_exists,
                });
            } else {
                setTestResult({
                    success: false,
                    message:
                        result.message ||
                        `Connection failed (HTTP ${response.status})`,
                });
            }
        } catch {
            setTestResult({
                success: false,
                message: 'Network error. Please try again.',
            });
        } finally {
            setIsTesting(false);
        }
    };

    const handleContinue = () => {
        if (!testResult?.success) {
            return;
        }

        (async () => {
            try {
                const response = await fetch(storeDatabase.url(), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN':
                            document
                                .querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content') || '',
                    },
                    body: JSON.stringify(formData),
                });

                const rawResponse = await response.text();
                let result: { success?: boolean; message?: string } = {};

                try {
                    result = rawResponse ? JSON.parse(rawResponse) : {};
                } catch {
                    result = {};
                }

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message ||
                        `Failed to save database configuration (HTTP ${response.status})`,
                    );
                }

                router.get(environment.url());
            } catch (error) {
                setTestResult({
                    success: false,
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Failed to save database configuration.',
                });
            }
        })();
    };

    return (
        <>
            <Head title="Database Configuration" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Database className="h-6 w-6 text-primary" />
                                Database Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure your MySQL database connection
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FieldGroup className="grid grid-cols-2 gap-4">
                                <Field className="col-span-2">
                                    <FieldLabel htmlFor="host">
                                        Database Host
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="host"
                                            name="host"
                                            value={formData.host}
                                            onChange={handleChange}
                                            placeholder="localhost"
                                        />
                                        <FieldDescription>
                                            Most local setups use localhost.
                                        </FieldDescription>
                                        <FieldError>{errors.host}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="port">Port</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="port"
                                            name="port"
                                            type="number"
                                            value={formData.port}
                                            onChange={handleChange}
                                            placeholder="3306"
                                        />
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="database">
                                        Database Name
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="database"
                                            name="database"
                                            value={formData.database}
                                            onChange={handleChange}
                                            placeholder="lgu_hris"
                                        />
                                        <FieldError>{errors.database}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="username">
                                        Username
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="root"
                                        />
                                        <FieldError>{errors.username}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="password">
                                        Password
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                        />
                                    </FieldContent>
                                </Field>
                            </FieldGroup>

                            {/* Test Result */}
                            {testResult && (
                                <Alert
                                    variant={
                                        testResult.success
                                            ? 'default'
                                            : 'destructive'
                                    }
                                >
                                    {testResult.success ? (
                                        <>
                                            <CheckCircle className="h-4 w-4 text-primary" />
                                            <AlertTitle>
                                                Connection Successful!
                                            </AlertTitle>
                                            <AlertDescription>
                                                {testResult.database_exists
                                                    ? 'Database exists and is ready.'
                                                    : 'Database does not exist. It will be created during migration.'}
                                            </AlertDescription>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4" />
                                            <AlertTitle>
                                                Connection Failed
                                            </AlertTitle>
                                            <AlertDescription>
                                                {testResult.message}
                                            </AlertDescription>
                                        </>
                                    )}
                                </Alert>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between pt-4">
                                <Link href={checkRequirements()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={handleTestConnection}
                                        disabled={isTesting}
                                    >
                                        {isTesting ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Database className="mr-2 h-4 w-4" />
                                        )}
                                        Test Connection
                                    </Button>
                                    <Button
                                        onClick={handleContinue}
                                        disabled={!testResult?.success}
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
