"use client";

import { Drawer } from "vaul";
import { useState } from "react";
import { updateTaskReflection } from "@/app/actions/tasks";
import { Smile, Meh, Frown, ThumbsUp, ThumbsDown, HelpCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskReflectionDrawerProps {
    taskId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: () => void;
}

export function TaskReflectionDrawer({ taskId, open, onOpenChange, onComplete }: TaskReflectionDrawerProps) {
    const [mood, setMood] = useState<string | null>(null);
    const [value, setValue] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!taskId) return;
        setLoading(true);

        await updateTaskReflection(taskId, {
            mood: mood || undefined,
            value: value || undefined
        });

        setLoading(false);
        onOpenChange(false);
        onComplete(); // Callback to clear selection in parent
    };

    const handleSkip = () => {
        onOpenChange(false);
        onComplete();
    };

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange}>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
                <Drawer.Content className="bg-white dark:bg-slate-900 flex flex-col rounded-t-[10px] fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto outline-none">
                    <Drawer.Title className="sr-only">Task Reflection</Drawer.Title>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-t-[10px] space-y-8">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-300 dark:bg-slate-700 -mt-2 mb-4" />

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold">Task Completed.</h3>
                            <p className="text-slate-500 text-sm">Reviewing your execution helps improve future estimates.</p>
                        </div>

                        {/* Q1: Mood */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold uppercase text-slate-400 text-center">How did it feel?</p>
                            <div className="flex justify-center gap-6">
                                {[
                                    { id: 'energized', icon: Smile, label: 'Energized', color: 'text-green-500' },
                                    { id: 'neutral', icon: Meh, label: 'Neutral', color: 'text-slate-500' },
                                    { id: 'drained', icon: Frown, label: 'Drained', color: 'text-orange-500' }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setMood(item.id)}
                                        className={cn(
                                            "flex flex-col items-center gap-2 transition-all p-3 rounded-xl",
                                            mood === item.id ? "bg-slate-50 dark:bg-slate-800 scale-110" : "opacity-60 hover:opacity-100"
                                        )}
                                    >
                                        <item.icon className={cn("w-8 h-8", mood === item.id ? item.color : "text-slate-400")} />
                                        <span className="text-xs font-medium">{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Q2: Value */}
                        <div className="space-y-4">
                            <p className="text-sm font-semibold uppercase text-slate-400 text-center">Was it worth the time?</p>
                            <div className="flex justify-center gap-3">
                                {[
                                    { id: 'yes', icon: ThumbsUp, label: 'Yes' },
                                    { id: 'unsure', icon: HelpCircle, label: 'Unsure' },
                                    { id: 'no', icon: ThumbsDown, label: 'No' },
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => setValue(item.id)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-sm font-medium border flex items-center gap-2 transition-all",
                                            value === item.id
                                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black"
                                                : "border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400"
                                        )}
                                    >
                                        <item.icon className="w-3 h-3" />
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <button onClick={handleSkip} className="py-3 text-slate-400 text-sm font-medium">Skip</button>
                            <button
                                onClick={handleSubmit}
                                disabled={(!mood && !value) || loading}
                                className="bg-calma-blue-500 text-white rounded-xl font-semibold disabled:opacity-50"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
