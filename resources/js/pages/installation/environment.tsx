import { Head, Link, router } from '@inertiajs/react';
import { Settings, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import {
    database,
    migrations,
    storeEnvironment,
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function EnvironmentConfig() {
    const [formData, setFormData] = useState({
        app_url: window.location.origin,
        app_name: 'LGU HRIS',
        mail_driver: 'smtp',
        mail_host: '',
        mail_port: '587',
        mail_username: '',
        mail_password: '',
        mail_encryption: 'tls',
        mail_from_address: '',
        mail_from_name: 'LGU HRIS',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleContinue = async () => {
        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(storeEnvironment.url(), {
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

            if (response.status === 419) {
                setError('Session expired. Please refresh the page and try again.');

                return;
            }

            if (response.ok && result.success !== false) {
                router.get(migrations());
            } else {
                setError(
                    result.message ||
                    `Failed to save environment settings (HTTP ${response.status})`,
                );
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Head title="Environment Configuration" />
            <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background via-muted/30 to-background p-4">
                <div className="w-full max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-6 w-6 text-primary" />
                                Environment Configuration
                            </CardTitle>
                            <CardDescription>
                                Configure your application settings
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Application Settings */}
                            <div>
                                <h3 className="mb-4 font-semibold">
                                    Application Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="app_name">
                                            Application Name
                                        </Label>
                                        <Input
                                            id="app_name"
                                            name="app_name"
                                            value={formData.app_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="app_url">
                                            Application URL
                                        </Label>
                                        <Input
                                            id="app_url"
                                            name="app_url"
                                            value={formData.app_url}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Mail Settings */}
                            <div>
                                <h3 className="mb-4 font-semibold">
                                    Mail Settings
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="mail_driver">
                                            Mail Driver
                                        </Label>
                                        <Select
                                            value={formData.mail_driver}
                                            onValueChange={(value) =>
                                                handleSelectChange(
                                                    'mail_driver',
                                                    value,
                                                )
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="smtp">
                                                    SMTP
                                                </SelectItem>
                                                <SelectItem value="sendmail">
                                                    Sendmail
                                                </SelectItem>
                                                <SelectItem value="mailgun">
                                                    Mailgun
                                                </SelectItem>
                                                <SelectItem value="postmark">
                                                    Postmark
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="mail_host">
                                                SMTP Host
                                            </Label>
                                            <Input
                                                id="mail_host"
                                                name="mail_host"
                                                value={formData.mail_host}
                                                onChange={handleChange}
                                                placeholder="smtp.gmail.com"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="mail_port">
                                                SMTP Port
                                            </Label>
                                            <Input
                                                id="mail_port"
                                                name="mail_port"
                                                type="number"
                                                value={formData.mail_port}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="mail_username">
                                                Username
                                            </Label>
                                            <Input
                                                id="mail_username"
                                                name="mail_username"
                                                value={formData.mail_username}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="mail_password">
                                                Password
                                            </Label>
                                            <Input
                                                id="mail_password"
                                                name="mail_password"
                                                type="password"
                                                value={formData.mail_password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="mail_encryption">
                                                Encryption
                                            </Label>
                                            <Select
                                                value={formData.mail_encryption}
                                                onValueChange={(value) =>
                                                    handleSelectChange(
                                                        'mail_encryption',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="tls">
                                                        TLS
                                                    </SelectItem>
                                                    <SelectItem value="ssl">
                                                        SSL
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="mail_from_address">
                                                From Address
                                            </Label>
                                            <Input
                                                id="mail_from_address"
                                                name="mail_from_address"
                                                type="email"
                                                value={
                                                    formData.mail_from_address
                                                }
                                                onChange={handleChange}
                                                placeholder="noreply@example.gov.ph"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <Label htmlFor="mail_from_name">
                                            From Name
                                        </Label>
                                        <Input
                                            id="mail_from_name"
                                            name="mail_from_name"
                                            value={formData.mail_from_name}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {error && (
                                <Alert variant="destructive">
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between pt-4">
                                <Link href={database()}>
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
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            Continue
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
