"use client";

import { MobileNav } from "@/components/MobileNav";
import { CalmCard } from "@/components/CalmCard";
import { LogOut, User, Moon, Sun, Bell, Monitor } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DownloadReportButton } from "@/components/insights/DownloadReportButton";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// --- Components ---

function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="w-20 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />;
    }

    return (
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
                onClick={() => setTheme("light")}
                className={cn(
                    "p-1.5 rounded-md transition-all",
                    theme === "light" ? "bg-white text-yellow-500 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Sun className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("system")}
                className={cn(
                    "p-1.5 rounded-md transition-all",
                    theme === "system" ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Monitor className="w-4 h-4" />
            </button>
            <button
                onClick={() => setTheme("dark")}
                className={cn(
                    "p-1.5 rounded-md transition-all",
                    theme === "dark" ? "bg-slate-700 text-white shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
            >
                <Moon className="w-4 h-4" />
            </button>
        </div>
    );
}

function NotificationToggle() {
    const [permission, setPermission] = useState<NotificationPermission>("default");

    useEffect(() => {
        if (typeof window !== "undefined" && "Notification" in window) {
            setPermission(Notification.permission);
        }
    }, []);

    const requestPermission = async () => {
        if (!("Notification" in window)) return;
        const res = await Notification.requestPermission();
        setPermission(res);
    };

    return (
        <button
            onClick={requestPermission}
            className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
                permission === "granted"
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : permission === "denied"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
            )}
        >
            {permission === "granted" ? "On" : permission === "denied" ? "Off" : "Enable"}
        </button>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <div className="pb-24 min-h-screen bg-slate-50 dark:bg-black transition-colors duration-500">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-slate-500 text-sm">Control your environment.</p>
            </header>

            <main className="px-4 space-y-6">

                {/* Account */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-2">Account</h3>
                    <CalmCard className="p-1 divide-y divide-slate-100 dark:divide-slate-800">
                        <Link href="/settings/profile">
                            <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer rounded-t-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-foreground">Profile</p>
                                        <p className="text-xs text-slate-500">Update PIN or Email</p>
                                    </div>
                                </div>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors rounded-b-xl"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Log Out</span>
                        </button>
                    </CalmCard>
                </div>

                {/* Preferences */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-2">Preferences</h3>
                    <CalmCard className="p-1 divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-slate-500" />
                                <span className="font-medium text-foreground">Theme</span>
                            </div>
                            <ThemeToggle />
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-500" />
                                <span className="font-medium text-foreground">Notifications</span>
                            </div>
                            <NotificationToggle />
                        </div>
                    </CalmCard>
                </div>

                {/* Data */}
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-2">Data</h3>
                    <CalmCard className="p-4">
                        <DownloadReportButton />
                    </CalmCard>
                </div>

            </main>

            <MobileNav />
        </div>
    );
}
