"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { CategorySelector } from "@/components/create/CategorySelector";
import { RecurrenceConfig } from "@/lib/date-utils";
import { RecurrenceSection } from "@/components/create/RecurrenceSection";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface CreateTaskFormProps {
    categories: Category[];
}

export function CreateTaskForm({ categories }: CreateTaskFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [localCategories, setLocalCategories] = useState(categories);

    // Form State
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [priority, setPriority] = useState("medium");
    const [repeatRule, setRepeatRule] = useState<RecurrenceConfig | undefined>(undefined);

    const handleSubmit = async () => {
        if (!title || !categoryId || !date || !startTime || !endTime) return;
        setLoading(true);
        setError("");

        const startIso = new Date(`${date}T${startTime}`).toISOString();
        const endIso = new Date(`${date}T${endTime}`).toISOString();

        const result = await createTask({
            title,
            categoryId,
            startAt: startIso,
            endAt: endIso,
            priority,
            repeatRule,
        });

        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            // Navigate to Dashboard on the selected date
            router.push(`/dashboard?date=${date}`);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">

            {error && (
                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-xl flex items-center gap-3 text-sm border border-orange-200 dark:border-orange-800 animate-in slide-in-from-top-2">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Title */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Task Name</label>
                <input
                    autoFocus
                    className="w-full text-2xl font-medium border-b-2 border-slate-100 py-2 focus:outline-none focus:border-calma-blue-500 bg-transparent transition-colors placeholder:text-slate-300 dark:border-slate-800"
                    placeholder="e.g. Deep Research"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                />
            </div>

            {/* Date */}
            <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Date</label>
                <input
                    type="date"
                    className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg font-medium focus:ring-2 focus:ring-calma-blue-500/20 focus:outline-none transition-all"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                />
            </div>

            {/* Time */}
            <div className="grid grid-cols-2 gap-4 relative">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Start</label>
                    <input
                        type="time"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg font-medium focus:ring-2 focus:ring-calma-blue-500/20 focus:outline-none transition-all"
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">End</label>
                    <input
                        type="time"
                        className="w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg font-medium focus:ring-2 focus:ring-calma-blue-500/20 focus:outline-none transition-all"
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                    />
                </div>
            </div>

            {/* Priority */}
            <div className="space-y-3">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Priority</label>
                <div className="flex gap-3">
                    {['low', 'medium', 'high'].map(p => (
                        <button
                            key={p}
                            onClick={() => setPriority(p)}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-sm font-medium capitalize border transition-all",
                                priority === p
                                    ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black"
                                    : "border-slate-200 text-slate-500 hover:border-calma-blue-200 dark:border-slate-800"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Category</label>
                <CategorySelector
                    categories={localCategories}
                    selectedId={categoryId}
                    onSelect={setCategoryId}
                    onNewCategory={(newCat) => setLocalCategories([...localCategories, newCat])}
                />
            </div>

            {/* Recurrence (New Section) */}
            <RecurrenceSection
                onRuleChange={setRepeatRule}
            />

            {/* Submit */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-calma-blue-500 hover:bg-calma-blue-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-xl shadow-calma-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Schedule Block"}
            </button>

        </div>
    );
}
