"use client";

import { CategoryPerfData } from "@/app/actions/analytics";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface CategoryBarChartProps {
    data: CategoryPerfData[];
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
    const [mode, setMode] = useState<'completion' | 'frequency'>('completion');

    // Sort based on mode
    const sortedData = [...data].sort((a, b) => {
        if (mode === 'completion') return b.completionRate - a.completionRate;
        return b.assigned - a.assigned;
    });

    // Max values for scaling
    // Frequency: Max assigned count
    // Completion: Always 100% (or max count for background bar?) 
    // Wait, for completion view:
    // Foreground: Completed count
    // Background: Assigned count
    // Scale: Based on max assigned of the set.

    // For frequency view:
    // Bar: Assigned count

    const maxVal = Math.max(...data.map(d => d.assigned), 1);

    return (
        <div className="space-y-6">
            {/* Toggle */}
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit mx-auto">
                <button
                    onClick={() => setMode('completion')}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                        mode === 'completion'
                            ? "bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    By Completion
                </button>
                <button
                    onClick={() => setMode('frequency')}
                    className={cn(
                        "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                        mode === 'frequency'
                            ? "bg-white dark:bg-slate-700 shadow-sm text-black dark:text-white"
                            : "text-slate-500 hover:text-slate-700"
                    )}
                >
                    By Frequency
                </button>
            </div>

            {/* Chart */}
            <div className="space-y-3">
                {sortedData.map(cat => (
                    <div key={cat.id} className="space-y-1 group">
                        <div className="flex justify-between text-xs font-medium px-1">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                                <span className={cn(
                                    "transition-colors",
                                    cat.completed === 0 && mode === 'completion' ? "text-slate-300" : "text-slate-700 dark:text-slate-200"
                                )}>
                                    {cat.name}
                                </span>
                            </div>

                            {mode === 'completion' ? (
                                <span className="text-calma-blue-600 dark:text-calma-blue-400 font-bold">
                                    {cat.completionRate}% <span className="text-slate-300 font-normal">({cat.completed}/{cat.assigned})</span>
                                </span>
                            ) : (
                                <span className="text-slate-500 font-bold">
                                    {cat.assigned} tasks
                                </span>
                            )}
                        </div>

                        {/* Bar Container */}
                        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                            {/* Background Ref (Assigned) - Only for Completion Mode context or just full width? 
                                User Requirement: "Background reference: Assigned tasks"
                                If we create a bar where width = assigned / maxAssigned...
                                And inner bar = completed / maxAssigned...
                                Then visually:
                                [ ===== (Completed) ----- (Assigned space) ...... (Empty space up to max) ]
                                
                                Let's try:
                                Width of container = 100% (represents Max Assigned of the set? No that's hard to read)
                                Let's make Width = linear relative to Max Assigned in the list.
                             */}

                            <div
                                className="absolute top-0 left-0 h-full rounded-full bg-slate-200 dark:bg-slate-700 transition-all duration-500"
                                style={{ width: `${(cat.assigned / maxVal) * 100}%` }}
                            />

                            {/* Foreground (Completed or Assigned based on mode) */}
                            <div
                                className="absolute top-0 left-0 h-full rounded-full transition-all duration-500"
                                style={{
                                    width: mode === 'completion'
                                        ? `${(cat.completed / maxVal) * 100}%`
                                        : `${(cat.assigned / maxVal) * 100}%`,
                                    backgroundColor: mode === 'completion' ? cat.color : '#64748b' // Slate 500 for freq
                                }}
                            />
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center text-xs text-slate-400 py-8">
                        No category data available this month.
                    </div>
                )}
            </div>
        </div>
    );
}
