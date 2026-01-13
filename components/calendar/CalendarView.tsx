"use client";

import { useState } from "react";
import { DayView, Task } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { CalendarHeader } from "./CalendarHeader";

interface CalendarViewProps {
    tasks: Task[];
    currentDate: Date; // Server-provided 'view date'
}

export function CalendarView({ tasks, currentDate }: CalendarViewProps) {
    const [viewMode, setViewMode] = useState<"day" | "week" | "month">("day");

    return (
        <div className="flex flex-col h-full">
            <CalendarHeader
                currentDate={currentDate}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            <div className="flex-1 min-h-0">
                {viewMode === "day" && (
                    <DayView tasks={tasks} currentDate={currentDate} />
                )}
                {viewMode === "week" && (
                    <WeekView tasks={tasks} currentDate={currentDate} />
                )}
                {viewMode === "month" && (
                    <MonthView tasks={tasks} currentDate={currentDate} />
                )}
            </div>
        </div>
    );
}
