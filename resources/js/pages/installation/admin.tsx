import { Head, Link, router } from '@inertiajs/react';
import { UserPlus, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
    complete,
    createAdmin,
    migrations,
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

export default function AdminUser() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.password_confirmation) {
            newErrors.password_confirmation = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleContinue = async () => {
        if (!validate()) {
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(createAdmin.url(), {
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

            const result = await response.json();

            if (response.ok) {
                router.get(complete.url());
            } else {
                setError(result.message || 'Failed to create admin user');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="Create Admin User" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <UserPlus className="h-6 w-6 text-primary" />
                                Create Admin User
                            </CardTitle>
                            <CardDescription>
                                Set up your administrator account
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <FieldGroup>
                                <Field>
                                    <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                        />
                                        <FieldError>{errors.name}</FieldError>
                                    </FieldContent>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="email">
                                        Email Address
                                    </FieldLabel>
                                    <FieldContent>
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="admin@example.gov.ph"
                                        />
                                        <FieldDescription>
                                            Use an email that will manage the whole system.
                                        </FieldDescription>
                                        <FieldError>{errors.email}</FieldError>
                                    </FieldContent>
                                </Field>
                                <div className="grid grid-cols-2 gap-4">
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
                                            <FieldError>{errors.password}</FieldError>
                                        </FieldContent>
                                    </Field>
                                    <Field>
                                        <FieldLabel htmlFor="password_confirmation">
                                            Confirm Password
                                        </FieldLabel>
                                        <FieldContent>
                                            <Input
                                                id="password_confirmation"
                                                name="password_confirmation"
                                                type="password"
                                                value={
                                                    formData.password_confirmation
                                                }
                                                onChange={handleChange}
                                                placeholder="••••••••"
                                            />
                                            <FieldError>{errors.password_confirmation}</FieldError>
                                        </FieldContent>
                                    </Field>
                                </div>
                            </FieldGroup>

                            <Alert>
                                <UserPlus className="h-4 w-4" />
                                <AlertTitle>Admin Account</AlertTitle>
                                <AlertDescription>
                                    This account will have full access to the
                                    system. You can create additional users with
                                    specific roles later.
                                </AlertDescription>
                            </Alert>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between pt-4">
                                <Link href={migrations()}>
                                    <Button variant="outline">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                </Link>
                                <Button
                                    onClick={handleContinue}
                                    disabled={isSaving}
                                >
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            Complete Installation
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}
