"use client";

import { Home, LayoutGrid, PlusCircle, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const pathname = usePathname();

    const navItems = [
        { href: "/dashboard", icon: Home, label: "Home" },
        { href: "/insights", icon: Sparkles, label: "Insights" }, // Added Insights
        { href: "/create", icon: PlusCircle, label: "Create" }, // Placeholder for FAB logic later
        { href: "/settings", icon: LayoutGrid, label: "More" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50">
            <div className="max-w-md mx-auto">
                <nav
                    className={cn(
                        "flex items-center justify-around pb-6 pt-4 px-2",
                        // Backdrop Blur & Colors
                        "bg-white/80 dark:bg-slate-950/80 backdrop-blur-lg",
                        // Border
                        "border-t border-slate-100 dark:border-slate-800"
                    )}
                >
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center p-2 group"
                            >
                                <item.icon
                                    className={cn(
                                        "w-6 h-6 transition-colors duration-200",
                                        isActive
                                            ? "text-calma-blue-500"
                                            : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
                                    )}
                                />
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
