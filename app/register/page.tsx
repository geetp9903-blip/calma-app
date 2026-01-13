"use client";

import { useState } from "react";
import { sendOtp, verifyOtp, registerProfile } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, KeyRound, User, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "EMAIL" | "OTP" | "PROFILE";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("EMAIL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form Data
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [username, setUsername] = useState("");
    const [pin, setPin] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await sendOtp(email);
            if (res.error) setError(res.error);
            else setStep("OTP");
        } catch {
            setError("Failed to send code.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await verifyOtp(email, otp);
            if (res.error) setError(res.error);
            else setStep("PROFILE");
        } catch {
            setError("Invalid code.");
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await registerProfile(username, pin);
            if (res.error) {
                setError(res.error);
            } else {
                router.push("/dashboard");
            }
        } catch {
            setError("Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
            <motion.div
                className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-100 overflow-hidden relative"
            >
                {/* Progress Indicators */}
                <div className="flex gap-2 mb-8 justify-center">
                    {(["EMAIL", "OTP", "PROFILE"] as Step[]).map((s, i) => {
                        const isActive = s === step;
                        const isPast = (step === "OTP" && i === 0) || (step === "PROFILE" && i <= 1);

                        return (
                            <div
                                key={s}
                                className={cn(
                                    "h-1.5 rounded-full transition-all duration-300",
                                    isActive ? "w-8 bg-stone-800" : isPast ? "w-8 bg-stone-300" : "w-2 bg-stone-100"
                                )}
                            />
                        );
                    })}
                </div>

                <AnimatePresence mode="wait">
                    {step === "EMAIL" && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-2xl font-serif text-stone-800 mb-2 text-center">Get Started</h1>
                            <p className="text-stone-500 text-center mb-8">Enter your email to receive a verification code</p>

                            <form onSubmit={handleSendOtp} className="space-y-6">
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="email"
                                        placeholder="hello@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                                        required
                                    />
                                </div>
                                <Button loading={loading} text="Send Code" />
                            </form>
                        </motion.div>
                    )}

                    {step === "OTP" && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-2xl font-serif text-stone-800 mb-2 text-center">Verify Email</h1>
                            <p className="text-stone-500 text-center mb-8">Enter the code sent to {email}</p>

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                <div className="relative">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder="123456"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono tracking-widest text-center text-lg"
                                        required
                                    />
                                </div>
                                <Button loading={loading} text="Verify Code" />
                                <button
                                    type="button"
                                    onClick={() => setStep("EMAIL")}
                                    className="w-full text-sm text-stone-400 hover:text-stone-600"
                                >
                                    Change Email
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === "PROFILE" && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h1 className="text-2xl font-serif text-stone-800 mb-2 text-center">Setup Profile</h1>
                            <p className="text-stone-500 text-center mb-8">Choose a unique username and a secure pin</p>

                            <form onSubmit={handleRegister} className="space-y-4">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="text"
                                        placeholder="Username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)} // TODO: Debounce check availability?
                                        className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 transition-all"
                                        required
                                        minLength={3}
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                    <input
                                        type="password"
                                        placeholder="4-Digit Pin"
                                        value={pin}
                                        onChange={(e) => {
                                            if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setPin(e.target.value);
                                        }}
                                        className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono tracking-widest"
                                        required
                                        minLength={4}
                                        maxLength={4}
                                    />
                                </div>
                                <div className="pt-2">
                                    <Button loading={loading} text="Complete Setup" icon={<CheckCircle2 className="w-4 h-4 ml-2" />} />
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-6 bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center"
                    >
                        {error}
                    </motion.div>
                )}

                {step === "EMAIL" && (
                    <div className="mt-8 text-center text-sm text-stone-500 border-t border-stone-100 pt-6">
                        Already have an account?{" "}
                        <Link href="/login" className="text-stone-800 font-medium hover:underline">
                            Sign in
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

function Button({ loading, text, icon }: { loading: boolean, text: string, icon?: React.ReactNode }) {
    return (
        <button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-800 hover:bg-stone-900 text-white rounded-xl py-3.5 font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                    {text}
                    {icon || <ArrowRight className="w-4 h-4" />}
                </>
            )}
        </button>
    )
}
