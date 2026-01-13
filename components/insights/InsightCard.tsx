import { CalmCard } from "@/components/CalmCard";
import { Sparkles } from "lucide-react";

interface InsightCardProps {
    insights: string[];
}

export function InsightCard({ insights }: InsightCardProps) {
    return (
        <CalmCard className="p-6 relative overflow-hidden bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800 border-calma-blue-200 dark:border-slate-700">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="w-24 h-24 text-calma-blue-500" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-calma-blue-500" />
                    <h3 className="font-semibold text-calma-blue-900 dark:text-blue-100">Weekly Pulse</h3>
                </div>

                <div className="space-y-3">
                    {insights.map((insight, i) => (
                        <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                            {insight}
                        </p>
                    ))}
                </div>
            </div>
        </CalmCard>
    );
}
