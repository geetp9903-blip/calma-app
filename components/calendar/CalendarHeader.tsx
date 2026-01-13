"use client";

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, subDays } from "date-fns";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface CalendarHeaderProps {
    currentDate: Date;
    viewMode: "day" | "week" | "month";
    onViewModeChange: (mode: "day" | "week" | "month") => void;
}

export function CalendarHeader({ currentDate, viewMode, onViewModeChange }: CalendarHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateDate = (date: Date) => {
        const params = new URLSearchParams(searchParams);
        // Using 'YYYY-MM-DD' format (local implicit, but let's stick to standard)
        params.set("date", format(date, "yyyy-MM-dd"));
        router.push(`${pathname}?${params.toString()}`);
    };

    const handlePrev = () => updateDate(subDays(currentDate, 1));
    const handleNext = () => updateDate(addDays(currentDate, 1));
    const handleToday = () => updateDate(new Date());

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">
                    {format(currentDate, "MMMM d, yyyy")}
                </h2>
                <button
                    onClick={handleToday}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                    title="Jump to Today"
                >
                    <CalendarIcon className="w-4 h-4" />
                </button>
            </div>

            {/* View Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                {(["day", "week", "month"] as const).map((m) => (
                    <button
                        key={m}
                        onClick={() => onViewModeChange(m)}
                        className={cn(
                            "px-3 py-1 rounded-md text-sm font-medium capitalize transition-all",
                            viewMode === m
                                ? "bg-white dark:bg-slate-700 shadow-sm text-foreground"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        {m}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
                <button
                    onClick={handlePrev}
                    className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-1" />
                <button
                    onClick={handleNext}
                    className="p-1 rounded-md hover:bg-white dark:hover:bg-slate-700 shadow-sm transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
