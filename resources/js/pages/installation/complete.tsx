import { Head, Link } from '@inertiajs/react';
import { CheckCircle, Home, LogIn, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function Complete() {
    return (
        <>
            <Head title="Installation Complete" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-2xl">
                    <Card>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 p-4">
                                <CheckCircle className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">
                                Installation Complete!
                            </CardTitle>
                            <CardDescription>
                                LGU HRIS has been successfully installed and
                                configured
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <Alert>
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <AlertTitle>Success!</AlertTitle>
                                <AlertDescription>
                                    Your LGU HRIS installation is complete and
                                    ready to use.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <h3 className="font-semibold">What's Next?</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>
                                            Log in with your admin account to
                                            start using the system
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>
                                            Add employees and configure your
                                            organization structure
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>
                                            Set up leave types and work
                                            schedules
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                        <span>
                                            Configure additional users and roles
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            <div className="flex flex-col justify-center gap-4 pt-4 sm:flex-row">
                                <Link href="/">
                                    <Button variant="outline" size="lg">
                                        <Home className="mr-2 h-4 w-4" />
                                        Go to Home
                                    </Button>
                                </Link>
                                <Link href="/login">
                                    <Button size="lg">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Log In
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>

                            <div className="pt-4 text-center text-sm text-muted-foreground">
                                <p>
                                    Need help? Check the{' '}
                                    <a
                                        href="#"
                                        className="text-primary hover:underline"
                                    >
                                        documentation
                                    </a>{' '}
                                    or{' '}
                                    <a
                                        href="#"
                                        className="text-primary hover:underline"
                                    >
                                        contact support
                                    </a>
                                    .
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
