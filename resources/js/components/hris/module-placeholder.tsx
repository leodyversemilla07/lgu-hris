import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Clock3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { index as dashboardIndex } from '@/actions/App/Http/Controllers/DashboardController';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

type Props = {
    title: string;
    description: string;
    phase: string;
    icon: LucideIcon;
    nextMilestones: string[];
};

export default function ModulePlaceholder({
    title,
    description,
    phase,
    icon: Icon,
    nextMilestones,
}: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: dashboardIndex.url(),
        },
        {
            title,
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />

            <div className="flex flex-1 flex-col gap-6 bg-[radial-gradient(circle_at_top,rgba(31,78,121,0.16),transparent_48%),linear-gradient(180deg,rgba(248,250,252,0.98),rgba(241,245,249,0.96))] p-4 md:p-6">
                <Card className="overflow-hidden border-slate-200/80 bg-white/95 shadow-sm">
                    <CardHeader className="gap-4 border-b border-slate-200/70 pb-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="space-y-3">
                                <Badge className="bg-[#1f4e79] text-white hover:bg-[#1f4e79]">
                                    {phase}
                                </Badge>
                                <div className="space-y-2">
                                    <CardTitle className="text-2xl text-slate-950">
                                        {title}
                                    </CardTitle>
                                    <CardDescription className="max-w-2xl text-sm leading-6 text-slate-600">
                                        {description}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="rounded-2xl border border-[#1f4e79]/15 bg-[#1f4e79]/8 p-4 text-[#1f4e79]">
                                <Icon className="size-7" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4 py-6 lg:grid-cols-[1.35fr_0.85fr]">
                        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/85 p-5">
                            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
                                <Clock3 className="size-4" />
                                Next implementation milestones
                            </div>
                            <ul className="space-y-3 text-sm leading-6 text-slate-600">
                                {nextMilestones.map((milestone) => (
                                    <li
                                        key={milestone}
                                        className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                                    >
                                        {milestone}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="rounded-2xl bg-slate-950 p-5 text-slate-100 shadow-sm">
                            <p className="text-xs font-semibold tracking-[0.18em] text-slate-300 uppercase">
                                Delivery note
                            </p>
                            <p className="mt-3 text-sm leading-6 text-slate-200">
                                This workspace is now linked into the app shell
                                so the next iterations can fill in forms,
                                tables, validation, and policies without
                                reworking navigation again.
                            </p>
                            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                                Build this module next with migrations,
                                requests, policies, pages, and targeted feature
                                tests.
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="justify-between border-t border-slate-200/70 pt-5">
                        <p className="text-sm text-slate-500">
                            Foundation route ready for iterative delivery.
                        </p>
                        <Button asChild>
                            <Link href={dashboardIndex()}>
                                Return to dashboard
                                <ArrowRight className="size-4" />
                            </Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </AppLayout>
    );
}
