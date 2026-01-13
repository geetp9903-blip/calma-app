"use client";

import { Drawer } from "vaul";
import { useState, useEffect } from "react";
import { Plus, X, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { createTask } from "@/app/actions/tasks";
import { cn } from "@/lib/utils";
import { CategorySelector } from "@/components/create/CategorySelector"; // New Import
import { RecurrenceSection } from "@/components/create/RecurrenceSection";
import { RecurrenceConfig } from "@/lib/date-utils";

interface Category {
    id: string;
    name: string;
    color: string;
}

interface TaskInputDrawerProps {
    categories: Category[];
}

export function TaskInputDrawer({ categories }: TaskInputDrawerProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Local state for categories
    const [localCategories, setLocalCategories] = useState(categories);

    // Form State
    const [title, setTitle] = useState("");
    const [categoryId, setCategoryId] = useState(categories[0]?.id || "");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [priority, setPriority] = useState("medium");
    const [repeatRule, setRepeatRule] = useState<RecurrenceConfig | undefined>(undefined);

    const [conflictStatus, setConflictStatus] = useState<'safe' | 'conflict' | 'checking'>('safe');

    // ... useEffect ...

    const handleSubmit = async () => {
        if (!title || !categoryId || !startTime || !endTime) return;
        setLoading(true);
        setError("");

        const today = new Date().toISOString().split("T")[0];
        const startIso = new Date(`${today}T${startTime}`).toISOString();
        const endIso = new Date(`${today}T${endTime}`).toISOString();

        const result = await createTask({
            title,
            categoryId,
            startAt: startIso,
            endAt: endIso,
            priority,
            repeatRule,
        });

        // ... rest of method ...


        setLoading(false);

        if (result.error) {
            setError(result.error);
        } else {
            setOpen(false);
            // Reset
            setTitle("");
            setStartTime("");
            setEndTime("");
            setError("");
            setConflictStatus('safe');
            setPriority("medium");
            setRepeatRule(undefined);
        }
    };

    return (
        <Drawer.Root open={open} onOpenChange={setOpen}>
            <Drawer.Trigger asChild>
                <button className="fixed bottom-20 right-6 w-14 h-14 bg-calma-blue-500 hover:bg-calma-blue-700 text-white rounded-full shadow-lg shadow-calma-blue-500/30 flex items-center justify-center transition-all z-40">
                    <Plus className="w-6 h-6" />
                </button>
            </Drawer.Trigger>

            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[99]" />
                <Drawer.Content className="bg-white dark:bg-slate-900 flex flex-col rounded-t-[10px] h-[92%] mt-24 fixed bottom-0 left-0 right-0 z-[100] max-w-md mx-auto outline-none transition-transform">
                    <Drawer.Title className="sr-only">New Task</Drawer.Title>

                    <div className="p-4 bg-white dark:bg-slate-900 rounded-t-[10px] flex-1 overflow-y-auto">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 mb-8" />

                        <div className="max-w-md mx-auto space-y-8 pb-10">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold">New Focus Block</h2>
                                <Drawer.Close asChild>
                                    <button className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X className="w-5 h-5" /></button>
                                </Drawer.Close>
                            </div>

                            {error && (
                                <div className="p-4 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 rounded-xl flex items-center gap-3 text-sm border border-orange-200 dark:border-orange-800 animate-in slide-in-from-top-2">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">What are you working on?</label>
                                <input
                                    autoFocus
                                    className="w-full text-2xl font-medium border-b-2 border-slate-100 py-2 focus:outline-none focus:border-calma-blue-500 bg-transparent transition-colors placeholder:text-slate-300 dark:border-slate-800"
                                    placeholder="e.g. Deep Research"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                />
                            </div>

                            {/* Time */}
                            <div className="grid grid-cols-2 gap-6 relative">
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
                                        className={cn(
                                            "w-full p-4 bg-slate-50 dark:bg-slate-800 rounded-xl text-lg font-medium focus:ring-2 focus:outline-none transition-all",
                                            conflictStatus === 'conflict' ? "bg-orange-50 text-orange-700 ring-2 ring-orange-200" : "focus:ring-calma-blue-500/20"
                                        )}
                                        value={endTime}
                                        onChange={e => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Repeat */}
                            <RecurrenceSection onRuleChange={setRepeatRule} />

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
                            <CategorySelector
                                categories={localCategories}
                                selectedId={categoryId}
                                onSelect={setCategoryId}
                                onNewCategory={(newCat) => setLocalCategories([...localCategories, newCat])}
                            />

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="w-full bg-calma-blue-500 hover:bg-calma-blue-600 active:scale-[0.98] text-white font-bold py-4 rounded-2xl shadow-xl shadow-calma-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all mt-4"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : "Schedule Block"}
                            </button>

                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
