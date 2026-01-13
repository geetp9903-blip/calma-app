"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RecurrenceConfig } from "@/lib/date-utils";
import { createRecurrenceTemplate, getRecurrenceTemplates } from "@/app/actions/tasks";

interface RecurrenceSectionProps {
    onRuleChange: (rule: RecurrenceConfig | undefined) => void;
}

export function RecurrenceSection({ onRuleChange }: RecurrenceSectionProps) {
    const [mode, setMode] = useState<"none" | "daily" | "weekly" | "custom">("none");
    const [templates, setTemplates] = useState<{ id: string; name: string; rule: any }[]>([]);

    // Custom/Weekly State
    const [days, setDays] = useState<number[]>([]); // 0=Sun, 1=Mon...
    const [endDate, setEndDate] = useState("");
    const [interval, setInterval] = useState(1);

    const [customName, setCustomName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        getRecurrenceTemplates().then(setTemplates);
    }, []);

    // Effect to push changes up
    useEffect(() => {
        if (mode === "none") {
            onRuleChange(undefined);
            return;
        }

        const config: RecurrenceConfig = {
            freq: mode === "daily" ? "DAILY" : "WEEKLY",
            interval: interval,
            days: days.length > 0 ? days : undefined,
            endDate: endDate || undefined
        };

        // Custom Logic:
        // Daily: freq=DAILY, no days.
        // Weekly: freq=WEEKLY, optional days.

        if (mode === "daily") {
            config.freq = "DAILY";
            config.days = undefined;
        } else if (mode === "weekly") {
            config.freq = "WEEKLY";
        }

        onRuleChange(config);
    }, [mode, days, endDate, interval, onRuleChange]);


    const toggleDay = (d: number) => {
        if (days.includes(d)) setDays(days.filter(x => x !== d));
        else setDays([...days, d].sort());
    };

    const saveTemplate = async () => {
        if (!customName) return;
        setIsSaving(true);
        const rule: RecurrenceConfig = { freq: "WEEKLY", interval, days, endDate: endDate || undefined };
        const result = await createRecurrenceTemplate(customName, rule);
        if (result.success && result.template) {
            setTemplates([...templates, result.template]);
            setCustomName("");
        }
        setIsSaving(false);
    };

    const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

    return (
        <div className="space-y-4">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Repetition</label>

            {/* Mode Logic */}
            <div className="flex flex-wrap gap-2">
                {(['none', 'daily', 'weekly'] as const).map(m => (
                    <button
                        key={m}
                        onClick={() => {
                            setMode(m);
                            // Reset days if switching to daily
                            if (m === 'daily') setDays([]);
                        }}
                        className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium capitalize border transition-all",
                            mode === m
                                ? "bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-black"
                                : "border-slate-200 text-slate-500 hover:border-calma-blue-200 dark:border-slate-800"
                        )}
                    >
                        {m}
                    </button>
                ))}
            </div>

            {/* Weekly Day Selector */}
            {mode === 'weekly' && (
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl animate-in slide-in-from-top-2">
                    <p className="text-xs font-medium text-slate-500">Repeat on specific days:</p>
                    <div className="flex justify-between gap-1">
                        {WEEKDAYS.map((label, i) => {
                            const isSelected = days.includes(i);
                            return (
                                <button
                                    key={i}
                                    onClick={() => toggleDay(i)}
                                    className={cn(
                                        "w-8 h-8 rounded-full text-xs font-bold transition-all flex items-center justify-center",
                                        isSelected
                                            ? "bg-calma-blue-500 text-white shadow-md shadow-calma-blue-500/30 scale-110"
                                            : "bg-white dark:bg-slate-700 text-slate-400 border border-slate-200 dark:border-slate-600 hover:border-calma-blue-300"
                                    )}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* End Date & Interval */}
            {(mode === 'daily' || mode === 'weekly') && (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">End Date (Optional)</label>
                        <input
                            type="date"
                            className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-none focus:ring-1 focus:ring-calma-blue-500"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Repeat Every</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min={1}
                                max={99}
                                className="w-full p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm border-none focus:ring-1 focus:ring-calma-blue-500 text-center"
                                value={interval}
                                onChange={e => setInterval(Number(e.target.value))}
                            />
                            <span className="text-xs text-slate-400">{mode === 'daily' ? 'Days' : 'Weeks'}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Saver */}
            {(mode === 'weekly' || mode === 'daily') && (
                <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <input
                        placeholder="Save as template (e.g. Gym)"
                        value={customName}
                        onChange={e => setCustomName(e.target.value)}
                        className="flex-1 bg-transparent text-sm focus:outline-none placeholder:text-slate-400"
                    />
                    <button
                        onClick={saveTemplate}
                        disabled={!customName || isSaving}
                        className="text-xs font-bold text-calma-blue-600 disabled:opacity-50 hover:underline"
                    >
                        Save
                    </button>
                </div>
            )}

            {/* Template Loader */}
            {templates.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setMode(t.rule.freq === 'DAILY' ? 'daily' : 'weekly');
                                setInterval(t.rule.interval || 1);
                                setDays(t.rule.days || []);
                                setEndDate(t.rule.endDate || "");
                            }}
                            className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full hover:bg-calma-blue-100 hover:text-calma-blue-700 transition-colors"
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
