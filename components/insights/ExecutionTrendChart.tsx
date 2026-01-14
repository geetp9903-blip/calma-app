"use client";

import { TrendDataPoint, InsightsMode } from "@/app/actions/analytics";
import { cn } from "@/lib/utils";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isFuture } from "date-fns";

interface ExecutionTrendChartProps {
    data: TrendDataPoint[];
    mode: InsightsMode;
    height?: number;
}

export function ExecutionTrendChart({ data, mode, height = 200 }: ExecutionTrendChartProps) {
    const isEmpty = !data || data.length === 0;

    // "Empty/Sparse Data" State
    // If we have very few data points (e.g. < 2 for month, < 2 for year), visuals might look weird.
    // But "Until Now" logic implies we just show what we have.
    // Real "Empty" is when NO data exists at all.

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl" style={{ height }}>
                <p className="text-sm font-medium text-slate-400">No activity recorded yet</p>
                <p className="text-xs text-slate-400/70 text-center max-w-[200px]">
                    Complete tasks to see your execution trend over time.
                </p>
            </div>
        );
    }

    // Prepare ticks for X-Axis based on mode to ensure context?
    // User wants: Month view X-Axis may show full range.
    // We can generate the full range of dates for ticks, but data will only exist for some.
    // Recharts XAxis `ticks` prop.

    let ticks: string[] | undefined;
    if (mode === 'month' && data.length > 0) {
        // We can try to generate ticks for 1st, 15th, End?
        // Or just let Recharts handle it.
        // If we want to force the axis to span the whole month:
        // const now = new Date();
        // const start = startOfMonth(now);
        // const end = endOfMonth(now);
        // ... this requires syncing with server time which is tricky.
        // Let's stick to auto-scaling "Until Now" which is safest execution-wise.
    }

    return (
        <div className="w-full select-none" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        dy={10}
                        interval="preserveStartEnd"
                        minTickGap={30}
                    />
                    <YAxis
                        hide
                        domain={[0, 'auto']}
                    />
                    <Tooltip
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                const d = payload[0].payload as TrendDataPoint;
                                return (
                                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl rounded-lg p-3 text-xs opacity-[0.97]">
                                        <p className="font-bold text-slate-700 dark:text-slate-200 mb-2">{d.fullDate}</p>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-slate-300" />
                                                <span className="text-slate-500">Assigned: {d.assigned}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-calma-blue-500" />
                                                <span className="text-slate-700 dark:text-slate-300 font-bold">Completed: {d.completed}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        }}
                    />

                    {/* Assigned: Area (Background, Lighter) */}
                    <Area
                        type="monotone"
                        dataKey="assigned"
                        stroke="#cbd5e1" // Slate 300
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorAssigned)"
                        activeDot={false}
                    />

                    {/* Completed: Line (Foreground, Stronger) */}
                    <Line
                        type="monotone"
                        dataKey="completed"
                        stroke="#3b82f6" // Blue 500
                        strokeWidth={3}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0, fill: '#3b82f6' }}
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
}
