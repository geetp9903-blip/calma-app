import { cn } from "@/lib/utils";
import React from "react";

interface StatusBadgeProps {
    status: "active" | "completed" | "pending" | string;
    className?: string;
    children?: React.ReactNode;
}

export function StatusBadge({ status, className, children }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                "inline-flex items-center justify-center px-3 py-1 text-xs font-medium rounded-full",
                // Light: Blue background, Blue text (No Red/Green)
                "bg-calma-blue-50 text-calma-blue-700",
                // Dark: Blue opacity background, Blue-300 text
                "dark:bg-blue-900/30 dark:text-blue-300",
                className
            )}
        >
            {children || status}
        </span>
    );
}
