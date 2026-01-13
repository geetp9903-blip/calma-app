"use client";

import { cn } from "@/lib/utils";
import { differenceInMinutes, startOfDay, isPast } from "date-fns";
import { useEffect, useState } from "react";
import { markTaskStatus } from "@/app/actions/tasks";
import { TaskReflectionDrawer } from "@/components/dashboard/TaskReflectionDrawer";

export interface Task {
    id: string;
    title: string;
    start_at: Date | string; // Handle deserialization
    end_at: Date | string;
    status: "planned" | "active" | "completed" | "skipped";
    category_name?: string;
    category_color?: string;
}

interface DayViewProps {
    tasks: Task[];
    currentDate: Date; // For reference (e.g. knowing what 'today' is vs view date)
}

export function DayView({ tasks, currentDate }: DayViewProps) {
    const [nowPercent, setNowPercent] = useState(0);

    // Reflection State
    const [reflectingTaskId, setReflectingTaskId] = useState<string | null>(null);
    const [isReflectionOpen, setIsReflectionOpen] = useState(false);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const start = startOfDay(now);
            const minutesPassed = differenceInMinutes(now, start);
            const percent = (minutesPassed / 1440) * 100; // 1440 mins in a day
            setNowPercent(percent);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    async function handleToggle(taskId: string, currentStatus: string, endTime: Date) {
        if (currentStatus !== "completed") {
            await markTaskStatus(taskId, "completed");
            setReflectingTaskId(taskId);
            setIsReflectionOpen(true);
        } else {
            await markTaskStatus(taskId, "planned");
        }
    }

    // Processing Tasks for Collision (Simple Column packing)
    // 1. Sort by Start Time
    const sortedTasks = [...tasks].sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());

    // 2. Algorithm: Pack into columns
    // We'll assign a 'column' index to each task.
    // Overlapping tasks must have different column indices.
    const positionedTasks = sortedTasks.map(t => {
        const start = new Date(t.start_at);
        const end = new Date(t.end_at);
        return { ...t, start, end, colIndex: 0, totalCols: 1 };
    });

    // Group overlapping tasks
    // Simple greedy approach: 
    // For each task, check overlaps with previous tasks in the "active" pool.
    // If overlap, increment colIndex until free.
    // Track max columns for the group.
    // Note: This is a simplified "Visual Column" approach (Not full temporal packing)

    // Better Approach for React Render:
    // Calculate layout props directly.
    const layoutTasks: (typeof positionedTasks[0] & { left: number; width: number })[] = [];
    const groups: (typeof positionedTasks)[] = [];

    // Grouping
    let currentGroup: typeof positionedTasks = [];
    let groupEnd = 0;

    positionedTasks.forEach((task) => {
        const start = task.start.getTime();
        const end = task.end.getTime();

        if (currentGroup.length === 0) {
            currentGroup.push(task);
            groupEnd = end;
        } else {
            if (start < groupEnd) {
                // Overlap
                currentGroup.push(task);
                groupEnd = Math.max(groupEnd, end);
            } else {
                // No overlap with the group -> Seal the group
                groups.push(currentGroup);
                currentGroup = [task];
                groupEnd = end;
            }
        }
    });
    if (currentGroup.length > 0) groups.push(currentGroup);

    // Layout Calculation per Group
    groups.forEach(group => {
        // Simple equal width strategy for overlapping group
        // Real calendar algos are complex (graph coloring), we'll do "Expand to fill" simplified.
        // We'll just stack them horizontally.
        const widthPercent = 100 / group.length;
        group.forEach((task, index) => {
            layoutTasks.push({
                ...task,
                left: index * widthPercent,
                width: widthPercent
            });
        });
    });


    return (
        <>
            <div className="flex mt-6 h-[800px] overflow-hidden">
                {/* Time Labels Sidebar */}
                <div className="w-12 flex flex-col justify-between py-2 text-[10px] text-slate-400 font-medium text-right pr-2 select-none">
                    {Array.from({ length: 25 }).map((_, i) => (
                        <div key={i} className="relative h-full">
                            <span className="-translate-y-1/2 block">
                                {i === 0 ? "12 AM" : i < 12 ? `${i} AM` : i === 12 ? "12 PM" : i === 24 ? "12 AM" : `${i - 12} PM`}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Main Grid Area */}
                <div className="relative flex-1 bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                    {/* Grid Lines - Render 24 horizontal lines */}
                    {Array.from({ length: 24 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-full border-t border-slate-200/30 dark:border-slate-800"
                            style={{ top: `${(i / 24) * 100}%` }}
                        />
                    ))}

                    {/* Current Time Indicator -- Only show if currentDate is Today */}
                    <div
                        className="absolute w-full border-t-2 border-red-500 z-10 flex items-center transition-all duration-1000 ease-linear pointer-events-none"
                        style={{ top: `${nowPercent}%` }}
                    >
                        <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 shadow-sm shadow-red-500" />
                    </div>

                    {layoutTasks.map((task) => {
                        // Start of 'Day View Day' (00:00 of the tak's date? Or the View Date?)
                        // Assumption: Tasks are filtered to be ON this view day.
                        const viewStart = startOfDay(currentDate);
                        const startMins = differenceInMinutes(task.start, viewStart);
                        const durationMins = differenceInMinutes(task.end, task.start);

                        // Clamp to visible day (0-1440)
                        // If task starts yesterday but ends today? 
                        // Phase 1 assumption: Intra-day tasks usually.

                        const top = (startMins / 1440) * 100;
                        const height = (durationMins / 1440) * 100;

                        const status = task.status;
                        const isCompleted = status === "completed";
                        const isMissed = (status === "planned" || status === "active") && isPast(task.end);

                        return (
                            <div
                                key={task.id}
                                onClick={() => handleToggle(task.id, status, task.end)}
                                className={cn(
                                    "absolute rounded-lg p-2 text-xs transition-all cursor-pointer border-l-4 group overflow-hidden",
                                    "bg-white dark:bg-slate-800 shadow-sm hover:shadow-md hover:z-20",
                                    isCompleted && "opacity-50 grayscale",
                                    isMissed && "opacity-70 bg-slate-50 dark:bg-slate-900/50 border-l-slate-300 dark:border-l-slate-700"
                                )}
                                style={{
                                    top: `${Math.max(0, top)}%`,
                                    height: `max(${height}%, 30px)`,
                                    left: `${task.left}%`,
                                    width: `${task.width}%`,
                                    borderLeftColor: isMissed ? undefined : (task.category_color || "#3b82f6")
                                }}
                            >
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0">
                                        <p className={cn("font-medium truncate", isCompleted && "line-through text-slate-500")}>
                                            {task.title}
                                        </p>
                                        <p className="text-[10px] text-slate-500 truncate">
                                            {task.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <TaskReflectionDrawer
                taskId={reflectingTaskId}
                open={isReflectionOpen}
                onOpenChange={setIsReflectionOpen}
                onComplete={() => setReflectingTaskId(null)}
            />
        </>
    );
}
