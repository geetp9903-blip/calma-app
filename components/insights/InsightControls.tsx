"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function InsightControls() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const currentView = searchParams.get("view") || "month";

    const handleViewChange = (view: string) => {
        const params = new URLSearchParams(searchParams);
        params.set("view", view);
        router.replace(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="flex justify-between items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl w-full max-w-sm mx-auto mb-8">
            {['week', 'month', 'year'].map((view) => (
                <button
                    key={view}
                    onClick={() => handleViewChange(view)}
                    className={cn(
                        "flex-1 py-1.5 text-sm font-medium rounded-lg capitalize transition-all",
                        currentView === view
                            ? "bg-white dark:bg-slate-800 shadow-sm text-slate-900 dark:text-white"
                            : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                >
                    {view}
                </button>
            ))}
        </div>
    );
}
