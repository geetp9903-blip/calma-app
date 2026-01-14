"use client";

import { CategoryPerfData, InsightsMode } from "@/app/actions/analytics";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryBarChartProps {
    data: CategoryPerfData[];
    mode: InsightsMode;
}

export function CategoryBarChart({ data, mode }: CategoryBarChartProps) {
    const [view, setView] = useState<'completion' | 'frequency'>('completion');

    const isEmpty = !data || data.length === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center p-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                <p className="text-sm font-medium text-slate-400">No category data</p>
                <p className="text-xs text-slate-400/70">Start organizing tasks with categories.</p>
            </div>
        );
    }

    // Sort Logic
    const sortedData = [...data].sort((a, b) => {
        if (view === 'completion') {
            // Efficiency Sort (Desc)
            return b.completionRate - a.completionRate;
        } else {
            // Volume Sort (Desc)
            return b.totalAssigned - a.totalAssigned;
        }
    });

    // Max Value for Frequency scaling
    const maxFreq = Math.max(...data.map(d => d.totalAssigned), 1);

    return (
        <div className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex justify-center">
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                    <button
                        onClick={() => setView('completion')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                            view === 'completion'
                                ? "bg-white dark:bg-slate-800 shadow-sm text-calma-blue-600 dark:text-calma-blue-400"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        Completion Quality
                    </button>
                    <button
                        onClick={() => setView('frequency')}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                            view === 'frequency'
                                ? "bg-white dark:bg-slate-800 shadow-sm text-calma-blue-600 dark:text-calma-blue-400"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        Planning Load
                    </button>
                </div>
            </div>

            {/* Chart */}
            <div className="space-y-4">
                {sortedData.map(cat => (
                    <div key={cat.id} className="space-y-1.5 group">
                        {/* Label Row */}
                        <div className="flex justify-between text-xs font-medium px-0.5">
                            <div className="flex items-center gap-2">
                                {/* Color dot only needed if not already obvious by bar color. 
                                    But let's keep it for clarity. 
                                */}
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className="text-slate-700 dark:text-slate-200">
                                    {cat.name}
                                </span>
                            </div>

                            {/* Value Label */}
                            {view === 'completion' ? (
                                <div className="flex items-center gap-1">
                                    <span className={cn(
                                        "font-bold",
                                        cat.completionRate >= 80 ? "text-emerald-600 dark:text-emerald-400" :
                                            cat.completionRate >= 50 ? "text-slate-700 dark:text-slate-300" :
                                                "text-amber-600 dark:text-amber-400"
                                    )}>
                                        {cat.completionRate}%
                                    </span>
                                    <span className="text-slate-400 font-normal scale-90">
                                        ({cat.completed}/{cat.pastAssigned})
                                    </span>
                                </div>
                            ) : (
                                <span className="text-slate-500 font-bold">
                                    {cat.totalAssigned} assigned
                                </span>
                            )}
                        </div>

                        {/* Visual Bar */}
                        {view === 'completion' ? (
                            /* COMPLETION MODE: Metaphor = Container to Fill (Progress) */
                            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                                <div
                                    className="absolute top-0 left-0 h-full rounded-full transition-all duration-700 ease-out"
                                    style={{
                                        width: `${cat.completionRate}%`,
                                        backgroundColor: cat.color
                                    }}
                                />
                            </div>
                        ) : (
                            /* FREQUENCY MODE: Metaphor = Volume (Weight) - No container, just bulk. */
                            <div className="h-2.5 w-full flex items-center">
                                <div
                                    className="h-full rounded-full transition-all duration-700 ease-out opacity-80"
                                    style={{
                                        width: `${(cat.totalAssigned / maxFreq) * 100}%`,
                                        backgroundColor: cat.color
                                    }}
                                />
                                {/* Optional: Ghost track line to show max scale? 
                                    Or keep it volumetric (clean). 
                                    User said: "Bars should feel volumetric... Relative height or length, not fill" 
                                    So no background track is better distinct metaphor.
                                */}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="text-center">
                <p className="text-[10px] text-slate-400 italic">
                    {view === 'completion'
                        ? "Efficiency: Completed / Assigned (past only)"
                        : mode === 'month'
                            ? "Volume: Total assigned tasks (including future plans)"
                            : "Volume: Total assigned history"
                    }
                </p>
            </div>
        </div>
    );
}

