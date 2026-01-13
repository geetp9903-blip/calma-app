import { getCategoryPerformance, getConsistencyScore, getExecutionTrend, getMicroObservations } from "@/app/actions/analytics";
import { CalmCard } from "@/components/CalmCard";
import { MobileNav } from "@/components/MobileNav";
import { CategoryBarChart } from "@/components/insights/CategoryBarChart";
import { ExecutionTrendChart } from "@/components/insights/ExecutionTrendChart";
import { createClient } from "@/lib/supabase/server";
import { Lightbulb } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic"; // Ensure fresh data

export default async function InsightsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const [trend, categoryData, consistency, observations] = await Promise.all([
        getExecutionTrend(),
        getCategoryPerformance(),
        getConsistencyScore(),
        getMicroObservations()
    ]);

    return (
        <div className="pb-28 min-h-screen bg-slate-50 dark:bg-black">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Insights</h1>
                <p className="text-slate-500 text-sm mt-1">Your behavior, mirrored.</p>
            </header>

            <main className="px-4 space-y-6 max-w-lg mx-auto">

                {/* 1. Score & Observations */}
                <div className="grid grid-cols-1 gap-4">
                    {/* Hero Metric */}
                    <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="space-y-1">
                            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Consistency</h3>
                            <p className="text-3xl font-bold text-slate-900 dark:text-white">{consistency}%</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                            {/* Simple donut usage for score? or just text. Text is calm. */}
                            <div className="w-8 h-8 rounded-full border-4 border-slate-100 dark:border-slate-700 relative">
                                <div
                                    className="absolute inset-0 rounded-full border-4 border-calma-blue-500 border-l-transparent border-b-transparent transform -rotate-45"
                                    style={{ clipPath: `inset(0 ${consistency > 100 ? 0 : 100 - consistency}% 0 0)` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Micro Observations */}
                    <div className="bg-calma-blue-50/50 dark:bg-slate-900/50 rounded-[20px] p-6 border border-calma-blue-100 dark:border-slate-800 space-y-3">
                        <div className="flex items-center gap-2 text-calma-blue-600 dark:text-calma-blue-400">
                            <Lightbulb className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Observations</span>
                        </div>
                        <div className="space-y-2">
                            {observations.map((txt, i) => (
                                <p key={i} className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                                    {txt}
                                </p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 2. Execution Trend */}
                <CalmCard className="p-6 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Execution Trend</h3>
                        <p className="text-xs text-slate-500">Assigned vs Completed (Last 30 Days)</p>
                    </div>
                    <ExecutionTrendChart data={trend} />
                </CalmCard>

                {/* 3. Category Performance */}
                <CalmCard className="p-6 space-y-6">
                    <div className="space-y-1">
                        <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Category Focus</h3>
                        <p className="text-xs text-slate-500">Where your attention goes</p>
                    </div>
                    <CategoryBarChart data={categoryData} />
                </CalmCard>

            </main>
            <MobileNav />
        </div>
    );
}
