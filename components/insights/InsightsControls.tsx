"use client";

import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

export function InsightsControls() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentMode = searchParams.get("mode") || "month";

    const setMode = (mode: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("mode", mode);
        router.push(`?${params.toString()}`);
    };

    const options = [
        { key: "month", label: "Current Month" },
        { key: "year", label: "Current Year" },
        { key: "all", label: "All Time" },
    ];

    return (
        <div className="flex justify-center mb-6">
            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-lg">
                {options.map((opt) => (
                    <button
                        key={opt.key}
                        onClick={() => setMode(opt.key)}
                        className={cn(
                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                            currentMode === opt.key
                                ? "bg-white dark:bg-slate-800 shadow-sm text-black dark:text-white"
                                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                        )}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
