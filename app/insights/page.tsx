import { getCategoryPerformance, getExecutionTrend, getFocusBalance, getMicroObservations } from "@/app/actions/analytics";
import { CalmCard } from "@/components/CalmCard";
import { MobileNav } from "@/components/MobileNav";
import { CategoryBarChart } from "@/components/insights/CategoryBarChart";
import { ExecutionTrendChart } from "@/components/insights/ExecutionTrendChart";
import { FocusBalanceChart } from "@/components/insights/FocusBalanceChart";
import { InsightsControls } from "@/components/insights/InsightsControls";
import { createClient } from "@/lib/supabase/server";
import { Lightbulb } from "lucide-react";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function InsightsPage(props: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const mode = (searchParams?.mode as "month" | "year" | "all") || "month";

    const [trend, categoryData, focusData, observations] = await Promise.all([
        getExecutionTrend(mode),
        getCategoryPerformance(mode),
        getFocusBalance(mode),
        getMicroObservations()
    ]);

    return (
        <div className="pb-28 min-h-screen bg-slate-50 dark:bg-black">
            <header className="px-6 pt-12 pb-2">
                <h1 className="text-3xl font-bold text-foreground tracking-tight">Insights</h1>
                <p className="text-slate-500 text-sm mt-1">Your behavior, mirrored.</p>
            </header>

            <main className="px-4 space-y-8 max-w-lg mx-auto mt-6">
                <InsightsControls />

                {/* VISUAL 1: EXECUTION FLOW (Primary Truth) */}
                <section className="space-y-3">
                    <div className="flex justify-between items-baseline px-1">
                        <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Execution Flow</h2>
                        <span className="text-[10px] text-slate-400">Assigned vs Completed</span>
                    </div>
                    <CalmCard className="p-6">
                        <ExecutionTrendChart data={trend} mode={mode} />
                    </CalmCard>
                </section>

                {/* VISUAL 2: CATEGORY CONVERSION (Interpretation) */}
                <section className="space-y-3">
                    <div className="flex justify-between items-baseline px-1">
                        <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Category Conversion</h2>
                        <span className="text-[10px] text-slate-400">Effort vs Validity</span>
                    </div>
                    <CalmCard className="p-6">
                        <CategoryBarChart data={categoryData} mode={mode} />
                    </CalmCard>
                </section>

                {/* VISUAL 3: FOCUS BALANCE (Reflection Snapshot) */}
                <section className="space-y-3">
                    <div className="flex justify-between items-baseline px-1">
                        <h2 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Focus Balance</h2>
                        <span className="text-[10px] text-slate-400">Where execution happened</span>
                    </div>
                    <CalmCard className="p-6">
                        <FocusBalanceChart data={focusData} mode={mode} />
                    </CalmCard>
                </section>

                {/* MICRO-OBSERVATIONS */}
                {observations.length > 0 && (
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
                )}
            </main>
            <MobileNav />
        </div>
    );
}
