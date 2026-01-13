"use client";

import { TrendDataPoint } from "@/app/actions/analytics";
import { cn } from "@/lib/utils";

interface ExecutionTrendChartProps {
    data: TrendDataPoint[];
    height?: number;
}

export function ExecutionTrendChart({ data, height = 160 }: ExecutionTrendChartProps) {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => Math.max(d.assigned, d.completed)), 5);
    const chartHeight = height - 30; // space for x-axis
    const chartWidth = 100; // percent

    // Helper to scale Y
    const getY = (val: number) => {
        return chartHeight - (val / maxVal) * chartHeight;
    };

    // Helper to generate path
    const getPath = (type: 'assigned' | 'completed') => {
        return data.map((d, i) => {
            const x = (i / (data.length - 1)) * 100;
            const y = getY(d[type]);
            return `${x},${y}`;
        }).join(" L ");
    };

    // Area Path
    const assignedPath = `M 0,${chartHeight} L ` + getPath('assigned') + ` L 100,${chartHeight} Z`;

    return (
        <div className="w-full select-none" style={{ height }}>
            {/* Legend / Header embedded if needed, but keeping it pure chart for now */}

            <div className="relative w-full" style={{ height: chartHeight }}>
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 100 ${chartHeight}`}>
                    {/* Grid lines */}
                    <line x1="0" y1={getY(0)} x2="100" y2={getY(0)} stroke="#e2e8f0" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />
                    <line x1="0" y1={getY(maxVal / 2)} x2="100" y2={getY(maxVal / 2)} stroke="#e2e8f0" vectorEffect="non-scaling-stroke" strokeDasharray="4 4" />

                    {/* Assigned Line (Background layer) */}
                    <path d={assignedPath} fill="url(#gradAssigned)" opacity="0.1" />
                    <polyline
                        points={getPath('assigned')}
                        fill="none"
                        stroke="#94a3b8" // Slate 400
                        strokeWidth="2"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Completed Line (Foreground layer) */}
                    <polyline
                        points={getPath('completed')}
                        fill="none"
                        stroke="#3b82f6" // Blue 500
                        strokeWidth="3"
                        vectorEffect="non-scaling-stroke"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    <defs>
                        <linearGradient id="gradAssigned" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.5} />
                            <stop offset="100%" stopColor="#94a3b8" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* X Axis Labels (First, Middle, Last) */}
            <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-1">
                <span>{data[0]?.date}</span>
                <span>{data[Math.floor(data.length / 2)]?.date}</span>
                <span>{data[data.length - 1]?.date}</span>
            </div>

            {/* Legend (Custom) */}
            <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-slate-400 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-slate-400">Assigned</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-calma-blue-500 rounded-full" />
                    <span className="text-[10px] uppercase font-bold text-slate-500">Completed</span>
                </div>
            </div>
        </div>
    );
}
