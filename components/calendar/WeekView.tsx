"use client";

import { cn } from "@/lib/utils";
import { startOfWeek, addDays, isSameDay, differenceInMinutes, startOfDay, isPast } from "date-fns";
import { Task } from "./DayView";
import { markTaskStatus } from "@/app/actions/tasks";
import { useRouter } from "next/navigation";

interface WeekViewProps {
    tasks: Task[];
    currentDate: Date;
}

export function WeekView({ tasks, currentDate }: WeekViewProps) {
    const router = useRouter();
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    async function handleToggle(taskId: string, currentStatus: string) {
        // Simplified toggle for WeekView (no reflection drawer for speed?)
        // Or we could trigger it, but let's keep it simple: Toggle Status.
        const newStatus = currentStatus === "completed" ? "planned" : "completed";
        await markTaskStatus(taskId, newStatus);
    }

    return (
        <div className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/20 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
            {/* Header: Mon 12, Tue 13... */}
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
                {weekDays.map((date) => (
                    <div
                        key={date.toISOString()}
                        className={cn(
                            "p-2 text-center border-r border-slate-200/50 dark:border-slate-800 last:border-r-0",
                            isSameDay(date, new Date()) && "bg-blue-50/50 dark:bg-blue-900/20"
                        )}
                    >
                        <p className="text-xs text-slate-500 uppercase font-medium">{date.toLocaleDateString("en-US", { weekday: 'short' })}</p>
                        <p className={cn(
                            "text-sm font-bold w-7 h-7 mx-auto flex items-center justify-center rounded-full mt-1",
                            isSameDay(date, new Date()) ? "bg-calma-blue-500 text-white shadow-sm" : "text-slate-700 dark:text-slate-300"
                        )}>
                            {date.getDate()}
                        </p>
                    </div>
                ))}
            </div>

            {/* Body: Time Grid Columns */}
            <div className="flex-1 relative min-h-[600px] overflow-y-auto">
                {/* Horizontal Time Lines (Background) */}
                {[0, 25, 50, 75].map((p) => (
                    <div key={p} className="absolute w-full border-t border-slate-200/30 dark:border-slate-800 pointer-events-none" style={{ top: `${p}%` }} />
                ))}

                <div className="grid grid-cols-7 h-full absolute w-full top-0 left-0">
                    {weekDays.map((date, colIndex) => {
                        // Filter tasks for this day
                        const dayTasks = tasks.filter(t => isSameDay(new Date(t.start_at), date));

                        return (
                            <div key={date.toISOString()} className="relative h-[800px] border-r border-slate-100 dark:border-slate-800/50 last:border-r-0">
                                {dayTasks.map(task => {
                                    // Simple layout (no overlap handling for week view MVP to keep it clean?)
                                    // Or simple overlap. Overlap is critical.
                                    // Let's rely on CSS width/left if we want, OR just assume tasks shouldn't overlap much.
                                    // For simplicity in WeekView: Full width, overlapping items just stack via z-index or shrink?
                                    // Let's use simple positioning:
                                    const taskStart = new Date(task.start_at);
                                    const taskEnd = new Date(task.end_at);
                                    const startMins = differenceInMinutes(taskStart, startOfDay(date));
                                    const durationMins = differenceInMinutes(taskEnd, taskStart);

                                    const top = (startMins / 1440) * 100;
                                    const height = (durationMins / 1440) * 100;

                                    const isCompleted = task.status === "completed";

                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => handleToggle(task.id, task.status)}
                                            className={cn(
                                                "absolute inset-x-0.5 rounded p-1 text-[10px] cursor-pointer border-l-2 bg-white dark:bg-slate-800 shadow-sm overflow-hidden hover:z-10",
                                                isCompleted && "opacity-50 grayscale"
                                            )}
                                            style={{
                                                top: `${top}%`,
                                                height: `max(${height}%, 24px)`,
                                                borderLeftColor: task.category_color
                                            }}
                                            title={task.title}
                                        >
                                            <div className="truncate font-medium leading-tight">{task.title}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
