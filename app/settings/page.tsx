"use client";

import { MobileNav } from "@/components/MobileNav";
import { CalmCard } from "@/components/CalmCard";
import { LogOut, User, Moon, Sun, Bell, Database } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DownloadReportButton } from "@/components/insights/DownloadReportButton";

export default function SettingsPage() {
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login"); // Back to login, which will show email entry
    };

    return (
        <div className="pb-24 min-h-screen bg-slate-50 dark:bg-black">
            <header className="px-6 pt-12 pb-6">
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <p className="text-slate-500 text-sm">Control your environment.</p>
            </header>

            <main className="px-4 space-y-6">
                <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-2">Account</h3>
                    <CalmCard className="p-1 divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-medium">Profile</p>
                                    <p className="text-xs text-slate-500">Update PIN or Email</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full p-4 flex items-center gap-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span className="font-medium">Log Out</span>
                        </button>
                    </CalmCard>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-2">Preferences</h3>
                    <CalmCard className="p-1 divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Moon className="w-5 h-5 text-slate-500" />
                                <span className="font-medium">Dark Mode</span>
                            </div>
                            <span className="text-xs text-slate-400">System</span>
                        </div>
                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-slate-500" />
                                <span className="font-medium">Notifications</span>
                            </div>
                            <span className="text-xs text-slate-400">Off</span>
                        </div>
                    </CalmCard>
                </div>

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
