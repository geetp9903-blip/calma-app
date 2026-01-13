import { cn } from "@/lib/utils";
import React from "react";

interface CalmCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function CalmCard({ children, className, ...props }: CalmCardProps) {
    return (
        <div
            className={cn(
                // Light Mode: White, subtle shadow, light border
                "bg-white shadow-sm border border-slate-100",
                // Dark Mode: Slate-900, no shadow, subtle border
                "dark:bg-slate-900 dark:border-slate-800",
                // Shape
                "rounded-xl",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
