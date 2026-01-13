"use client";

import { cn } from "@/lib/utils";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format } from "date-fns";
import { Task } from "./DayView";
import { useRouter } from "next/navigation";

interface MonthViewProps {
    tasks: Task[];
    currentDate: Date;
}

export function MonthView({ tasks, currentDate }: MonthViewProps) {
    const router = useRouter();
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
        <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                    <div key={d} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
                        {d}
                    </div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
                {days.map((day) => {
                    const dayTasks = tasks.filter(t => isSameDay(new Date(t.start_at), day));
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => router.push(`?date=${format(day, 'yyyy-MM-dd')}`)}
                            className={cn(
                                "min-h-[80px] p-2 border-r border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col gap-1",
                                !isCurrentMonth && "bg-slate-50/30 dark:bg-slate-900/30 text-slate-400"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                                isToday ? "bg-calma-blue-500 text-white" : "text-slate-700 dark:text-slate-300"
                            )}>
                                {format(day, 'd')}
                            </span>

                            <div className="flex-1 flex flex-col gap-1 overflow-hidden">
                                {dayTasks.slice(0, 3).map(task => (
                                    <div
                                        key={task.id}
                                        className="h-1.5 rounded-full w-full"
                                        style={{ backgroundColor: task.category_color }}
                                        title={task.title}
                                    />
                                ))}
                                {dayTasks.length > 3 && (
                                    <span className="text-[10px] text-slate-400">+{dayTasks.length - 3} more</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
