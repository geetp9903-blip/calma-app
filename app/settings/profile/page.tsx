"use client";

import { useState } from "react";
import { resetPin, updateEmail } from "@/app/actions/auth";
import { CalmCard } from "@/components/CalmCard";
import { MobileNav } from "@/components/MobileNav";
import { ArrowLeft, Loader2, Save, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [pin, setPin] = useState("");

    const [loadingEmail, setLoadingEmail] = useState(false);
    const [msgEmail, setMsgEmail] = useState("");

    const [loadingPin, setLoadingPin] = useState(false);
    const [msgPin, setMsgPin] = useState("");

    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingEmail(true);
        setMsgEmail("");

        try {
            const res = await updateEmail(email);
            if (res.error) {
                setMsgEmail(`Error: ${res.error}`);
            } else {
                setMsgEmail("Confirmation link sent to new email.");
                setEmail("");
            }
        } catch {
            setMsgEmail("Failed to update email.");
        } finally {
            setLoadingEmail(false);
        }
    };

    const handleUpdatePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pin.length !== 4) return;

        setLoadingPin(true);
        setMsgPin("");

        try {
            const res = await resetPin(pin);
            if (res.error) {
                setMsgPin(`Error: ${res.error}`);
            } else {
                setMsgPin("PIN updated successfully.");
                setPin("");
            }
        } catch {
            setMsgPin("Failed to update PIN.");
        } finally {
            setLoadingPin(false);
        }
    };

    return (
        <div className="pb-24 min-h-screen bg-slate-50 dark:bg-black">
            <header className="px-6 pt-12 pb-6 flex items-center gap-4">
                <Link href="/settings" className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <ArrowLeft className="w-5 h-5 text-slate-500" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Profile</h1>
                    <p className="text-slate-500 text-sm">Update your credentials.</p>
                </div>
            </header>

            <main className="px-4 space-y-6 max-w-md mx-auto">
                {/* Email Section */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-1">Email</h3>
                    <CalmCard className="p-6">
                        <form onSubmit={handleUpdateEmail} className="space-y-4">
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="email"
                                    placeholder="New Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all placeholder:text-slate-400"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loadingEmail || !email}
                                className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loadingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update Email
                            </button>
                            {msgEmail && (
                                <p className={`text-xs text-center ${msgEmail.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                                    {msgEmail}
                                </p>
                            )}
                        </form>
                    </CalmCard>
                </div>

                {/* PIN Section */}
                <div className="space-y-2">
                    <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider ml-1">Security Code</h3>
                    <CalmCard className="p-6">
                        <form onSubmit={handleUpdatePin} className="space-y-4">
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="password"
                                    placeholder="New 4-Digit PIN"
                                    value={pin}
                                    maxLength={4}
                                    onChange={(e) => {
                                        if (/^\d*$/.test(e.target.value)) setPin(e.target.value);
                                    }}
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 transition-all font-mono tracking-widest placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-400"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loadingPin || pin.length < 4}
                                className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loadingPin ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Update PIN
                            </button>
                            {msgPin && (
                                <p className={`text-xs text-center ${msgPin.includes("Error") ? "text-red-500" : "text-green-500"}`}>
                                    {msgPin}
                                </p>
                            )}
                        </form>
                    </CalmCard>
                </div>
            </main>

            <MobileNav />
        </div>
    );
}
