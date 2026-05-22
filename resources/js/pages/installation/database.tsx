import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Database, HelpCircle } from 'lucide-react';
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
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import InputError from '@/components/input-error';
import {
    index as installIndex,
    requirements as installRequirements,
    environment as installEnvironment,
    testDatabase,
    saveDatabase,
} from '@/actions/App/Http/Controllers/InstallationController';

type ConnectionOption = {
    value: string;
    label: string;
};

type Props = {
    currentStep: number;
    steps: Record<string, string>;
    connection: string;
    connections: ConnectionOption[];
};

export default function InstallationDatabase({
    steps,
    connection,
    connections,
}: Props) {
    const testForm = useForm({
        connection,
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
    });

    const saveForm = useForm({
        connection,
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
    });

    function handleTest(): void {
        testForm.post(testDatabase.url(), {
            preserveScroll: true,
        });
    }

    function handleSave(): void {
        saveForm.post(saveDatabase.url());
    }

    const isSqlite = testForm.data.connection === 'sqlite';

    return (
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 to-indigo-100 p-4">
            <Head title="Database Configuration" />

            <div className="flex w-full max-w-2xl flex-col gap-6">
                <StepIndicator currentStep={3} steps={steps} />

                <Card>
                    <CardHeader>
                        <CardTitle>Database connection</CardTitle>
                        <CardDescription>
                            Configure the database connection. You can test the
                            connection before saving.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <Label>
                                Database type{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Select
                                value={testForm.data.connection}
                                onValueChange={(value) => {
                                    testForm.setData('connection', value);
                                    saveForm.setData('connection', value);
                                }}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select database type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {connections.map((conn) => (
                                            <SelectItem
                                                key={conn.value}
                                                value={conn.value}
                                            >
                                                {conn.label}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        {!isSqlite && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>
                                        Host{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={testForm.data.host}
                                        onChange={(e) => {
                                            testForm.setData(
                                                'host',
                                                e.target.value,
                                            );
                                            saveForm.setData(
                                                'host',
                                                e.target.value,
                                            );
                                        }}
                                        placeholder="127.0.0.1"
                                    />
                                    <InputError
                                        message={testForm.errors.host}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>
                                        Port{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={testForm.data.port}
                                        onChange={(e) => {
                                            testForm.setData(
                                                'port',
                                                e.target.value,
                                            );
                                            saveForm.setData(
                                                'port',
                                                e.target.value,
                                            );
                                        }}
                                        placeholder="3306"
                                    />
                                    <InputError
                                        message={testForm.errors.port}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <Label>
                                Database name{' '}
                                <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                value={testForm.data.database}
                                onChange={(e) => {
                                    testForm.setData(
                                        'database',
                                        e.target.value,
                                    );
                                    saveForm.setData(
                                        'database',
                                        e.target.value,
                                    );
                                }}
                                placeholder={
                                    isSqlite ? 'database.sqlite' : 'lgu_hris'
                                }
                            />
                            <InputError message={testForm.errors.database} />
                        </div>

                        {!isSqlite && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <Label>
                                        Username{' '}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        value={testForm.data.username}
                                        onChange={(e) => {
                                            testForm.setData(
                                                'username',
                                                e.target.value,
                                            );
                                            saveForm.setData(
                                                'username',
                                                e.target.value,
                                            );
                                        }}
                                        placeholder="root"
                                    />
                                    <InputError
                                        message={testForm.errors.username}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Label>Password</Label>
                                    <Input
                                        type="password"
                                        value={testForm.data.password}
                                        onChange={(e) => {
                                            testForm.setData(
                                                'password',
                                                e.target.value,
                                            );
                                            saveForm.setData(
                                                'password',
                                                e.target.value,
                                            );
                                        }}
                                        placeholder="Leave blank if none"
                                    />
                                    <InputError
                                        message={testForm.errors.password}
                                    />
                                </div>
                            </div>
                        )}

                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="help">
                                <AccordionTrigger className="text-sm">
                                    <HelpCircle className="size-4" />
                                    Need help finding database credentials?
                                </AccordionTrigger>
                                <AccordionContent className="text-sm text-muted-foreground">
                                    <p className="mb-2">
                                        For <strong>SQLite</strong>, simply
                                        enter a filename (e.g.,
                                        database.sqlite). The file will be
                                        created automatically.
                                    </p>
                                    <p className="mb-2">
                                        For <strong>MySQL</strong>, use port
                                        3306, username &quot;root&quot; and the
                                        password set during MySQL installation.
                                    </p>
                                    <p>
                                        For <strong>PostgreSQL</strong>, use
                                        port 5432 with your configured username
                                        and password.
                                    </p>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {testForm.recentlySuccessful && (
                            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
                                Connection successful!
                            </div>
                        )}

                        {testForm.hasErrors && !testForm.recentlySuccessful && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
                                {testForm.errors.database ??
                                    'Connection failed. Check your credentials.'}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
                        <Button asChild variant="outline">
                            <Link href={installRequirements.url()}>
                                <ChevronLeft data-icon="inline-start" />
                                Back
                            </Link>
                        </Button>
                        <div className="flex w-full gap-2 sm:w-auto">
                            <Button
                                variant="outline"
                                onClick={handleTest}
                                disabled={testForm.processing}
                                className="flex-1 sm:flex-initial"
                            >
                                <Database data-icon="inline-start" />
                                Test connection
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saveForm.processing}
                                className="flex-1 sm:flex-initial"
                            >
                                Save & continue
                                <ChevronRight data-icon="inline-end" />
                            </Button>
                        </div>
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
            {entries.map(([step, label], index) => {
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


