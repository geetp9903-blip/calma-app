"use client";

import { FocusBalanceData, InsightsMode } from "@/app/actions/analytics";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface FocusBalanceChartProps {
    data: FocusBalanceData[];
    mode: InsightsMode;
}

export function FocusBalanceChart({ data, mode }: FocusBalanceChartProps) {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    const isEmpty = total === 0;

    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center py-10 opacity-70">
                <div className="w-32 h-32 rounded-full border-4 border-slate-100 dark:border-slate-800 flex items-center justify-center">
                    <span className="text-xs text-slate-300">No data</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
            {/* Chart */}
            <div className="relative w-48 h-48 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const d = payload[0].payload as FocusBalanceData;
                                    return (
                                        <div className="bg-white dark:bg-slate-900 px-3 py-2 rounded-lg shadow-lg border border-slate-100 dark:border-slate-800 text-xs font-bold">
                                            <span style={{ color: d.color }}>{d.name}</span>: {d.value} tasks
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>

                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">
                        {total}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-medium mt-1">
                        Completed
                    </span>
                </div>
            </div>

            {/* Legend / List */}
            <div className="w-full sm:w-auto space-y-2">
                {data.slice(0, 5).map((d) => (
                    <div key={d.name} className="flex items-center justify-between sm:justify-start gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                                {d.name}
                            </span>
                        </div>
                        <span className="text-slate-400 tabular-nums">
                            {d.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
