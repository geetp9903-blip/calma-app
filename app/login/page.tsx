"use client";

import { useState } from "react";
import { loginWithPin } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, ArrowRight, Lock, User } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [username, setUsername] = useState("");
    const [pin, setPin] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await loginWithPin(username, pin);
            if (res.error) {
                setError(res.error);
            } else {
                router.push("/dashboard");
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-100"
            >
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-stone-800 mb-2">Welcome Back</h1>
                    <p className="text-stone-500">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium text-stone-700 transition-all"
                                required
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                            <input
                                type="password"
                                placeholder="4-Digit Pin"
                                value={pin}
                                onChange={(e) => {
                                    if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                                        setPin(e.target.value);
                                    }
                                }}
                                className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 font-medium text-stone-700 transition-all font-mono tracking-widest"
                                required
                                maxLength={4}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading || pin.length < 4}
                        className="w-full bg-stone-800 hover:bg-stone-900 text-white rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>

                    <div className="flex flex-col items-center gap-4 mt-6 text-sm text-stone-500">
                        <Link href="/forgot-pin" className="hover:text-stone-800 hover:underline">
                            Forgot your pin?
                        </Link>
                        <div className="w-full h-px bg-stone-100" />
                        <p>
                            New here?{" "}
                            <Link href="/register" className="text-stone-800 font-medium hover:underline">
                                Create an account
                            </Link>
                        </p>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
