import { Head } from '@inertiajs/react';
import {
    ArrowRightLeft,
    Building2,
    CalendarCheck2,
    Clock3,
    FolderKanban,
    Users,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from '@/components/ui/empty';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboardIndex.url() },
];

type DashboardType = 'organization' | 'department' | 'employee';
type IconKey = 'folder' | 'calendar' | 'clock' | 'building' | 'users';

type DashboardCard = {
    title: string;
    value: string;
    detail: string;
    hint: string;
    icon: IconKey;
};

type ChartSection = {
    key: 'primary' | 'secondary';
    tab: string;
    title: string;
    description: string;
    emptyTitle: string;
    emptyDescription: string;
    icon: IconKey;
    layout: 'vertical' | 'horizontal';
    items: Array<{
        label: string;
        value: number;
    }>;
};

type RecentRecord = {
    id: number;
    record: string;
    type: string;
    date: string | null;
    reference: string | null;
};

type Props = {
    dashboardType: DashboardType;
    title: string;
    description: string;
    cards: DashboardCard[];
    charts: ChartSection[];
    recentRecords: {
        title: string;
        description: string;
        rows: RecentRecord[];
    };
};

const chartConfig: ChartConfig = {
    total: {
        label: 'Count',
        color: 'var(--color-chart-1)',
    },
};

const iconMap = {
    folder: FolderKanban,
    calendar: CalendarCheck2,
    clock: Clock3,
    building: Building2,
    users: Users,
} satisfies Record<IconKey, typeof FolderKanban>;

const dashboardBadgeLabels: Record<DashboardType, string> = {
    organization: 'Organization',
    department: 'Department',
    employee: 'Personal',
};

function truncateLabel(value: string, maxLength: number = 18): string {
    return value.length > maxLength
        ? `${value.slice(0, maxLength - 1)}...`
        : value;
}

function DashboardChart({ section }: { section: ChartSection }) {
    const Icon = iconMap[section.icon];
    const chartData = section.items.map(({ label, value }) => ({
        label,
        shortLabel: truncateLabel(
            label,
            section.layout === 'vertical' ? 14 : 18,
        ),
        total: value,
    }));

    if (chartData.length === 0) {
        return (
            <Empty className="min-h-80 border-border bg-muted/20">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Icon />
                    </EmptyMedia>
                    <EmptyTitle>{section.emptyTitle}</EmptyTitle>
                    <EmptyDescription>
                        {section.emptyDescription}
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        );
    }

    if (section.layout === 'horizontal') {
        return (
            <ChartContainer config={chartConfig} className="min-h-80 w-full">
                <BarChart
                    accessibilityLayer
                    data={chartData}
                    layout="vertical"
                    margin={{ left: 8, right: 8 }}
                >
                    <CartesianGrid horizontal={false} />
                    <XAxis
                        allowDecimals={false}
                        axisLine={false}
                        tickLine={false}
                        type="number"
                    />
                    <YAxis
                        axisLine={false}
                        dataKey="shortLabel"
                        tickLine={false}
                        type="category"
                        width={120}
                    />
                    <ChartTooltip
                        content={
                            <ChartTooltipContent
                                formatter={(value, _name, item) => (
                                    <>
                                        <span className="text-muted-foreground">
                                            {item.payload.label}
                                        </span>
                                        <span className="font-mono font-medium text-foreground">
                                            {Number(value).toLocaleString()}
                                        </span>
                                    </>
                                )}
                                hideLabel
                            />
                        }
                    />
                    <Bar dataKey="total" fill="var(--color-total)" radius={8} />
                </BarChart>
            </ChartContainer>
        );
    }

    return (
        <ChartContainer config={chartConfig} className="min-h-80 w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    axisLine={false}
                    dataKey="shortLabel"
                    tickLine={false}
                    tickMargin={10}
                />
                <ChartTooltip
                    content={
                        <ChartTooltipContent
                            formatter={(value, _name, item) => (
                                <>
                                    <span className="text-muted-foreground">
                                        {item.payload.label}
                                    </span>
                                    <span className="font-mono font-medium text-foreground">
                                        {Number(value).toLocaleString()}
                                    </span>
                                </>
                            )}
                            hideLabel
                        />
                    }
                />
                <Bar dataKey="total" fill="var(--color-total)" radius={8} />
            </BarChart>
        </ChartContainer>
    );
}

export default function Dashboard({
    dashboardType,
    title,
    description,
    cards,
    charts,
    recentRecords,
}: Props) {
    const defaultTab = charts[0]?.key ?? 'primary';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <div className="px-4 lg:px-6">
                            <div className="flex flex-col gap-2">
                                <Badge variant="outline" className="w-fit">
                                    {dashboardBadgeLabels[dashboardType]}
                                </Badge>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {title}
                                </h1>
                                <p className="max-w-3xl text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-2 lg:px-6 @5xl/main:grid-cols-4">
                            {cards.map((item) => {
                                const Icon = iconMap[item.icon];

                                return (
                                    <Card
                                        key={item.title}
                                        className="@container/card shadow-xs"
                                    >
                                        <CardHeader>
                                            <CardDescription>
                                                {item.title}
                                            </CardDescription>
                                            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                                                {item.value}
                                            </CardTitle>
                                            <CardAction>
                                                <Badge variant="outline">
                                                    <Icon />
                                                    {item.hint}
                                                </Badge>
                                            </CardAction>
                                        </CardHeader>
                                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                                            <div className="flex items-center gap-2 font-medium">
                                                <Icon className="size-4" />
                                                Snapshot
                                            </div>
                                            <div className="text-muted-foreground">
                                                {item.detail}
                                            </div>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>

                        {charts.length > 0 && (
                            <div className="px-4 lg:px-6">
                                <Tabs defaultValue={defaultTab}>
                                    <Card>
                                        <CardHeader>
                                            <div className="flex flex-col gap-1">
                                                <CardTitle>Insights</CardTitle>
                                                <CardDescription>
                                                    Review the grouped metrics
                                                    that matter for your
                                                    workspace.
                                                </CardDescription>
                                            </div>
                                            <CardAction>
                                                <TabsList>
                                                    {charts.map((section) => (
                                                        <TabsTrigger
                                                            key={section.key}
                                                            value={section.key}
                                                        >
                                                            {section.tab}
                                                        </TabsTrigger>
                                                    ))}
                                                </TabsList>
                                            </CardAction>
                                        </CardHeader>
                                        <CardContent>
                                            {charts.map((section) => (
                                                <TabsContent
                                                    key={section.key}
                                                    value={section.key}
                                                    className="mt-0"
                                                >
                                                    <div className="mb-4 flex flex-col gap-1">
                                                        <h2 className="text-base font-semibold">
                                                            {section.title}
                                                        </h2>
                                                        <p className="text-sm text-muted-foreground">
                                                            {
                                                                section.description
                                                            }
                                                        </p>
                                                    </div>
                                                    <DashboardChart
                                                        section={section}
                                                    />
                                                </TabsContent>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </Tabs>
                            </div>
                        )}

                        <div className="px-4 lg:px-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>{recentRecords.title}</CardTitle>
                                    <CardDescription>
                                        {recentRecords.description}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {recentRecords.rows.length > 0 ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>
                                                        Record
                                                    </TableHead>
                                                    <TableHead>Type</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>
                                                        Reference
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {recentRecords.rows.map(
                                                    (row) => (
                                                        <TableRow key={row.id}>
                                                            <TableCell className="font-medium">
                                                                {row.record}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant="secondary">
                                                                    {row.type}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {row.date ??
                                                                    'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                {row.reference ? (
                                                                    <Badge variant="outline">
                                                                        {
                                                                            row.reference
                                                                        }
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground">
                                                                        N/A
                                                                    </span>
                                                                )}
                                                            </TableCell>
                                                        </TableRow>
                                                    ),
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <Empty className="min-h-55 border-border bg-muted/20">
                                            <EmptyHeader>
                                                <EmptyMedia variant="icon">
                                                    <ArrowRightLeft />
                                                </EmptyMedia>
                                                <EmptyTitle>
                                                    No recent records
                                                </EmptyTitle>
                                                <EmptyDescription>
                                                    Activity rows will appear
                                                    here as new records are
                                                    created.
                                                </EmptyDescription>
                                            </EmptyHeader>
                                        </Empty>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
