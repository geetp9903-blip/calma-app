"use client";

import { useState } from "react";
import { sendOtp, verifyOtp, resetPin } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Mail, KeyRound, Lock, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "EMAIL" | "OTP" | "RESET";

export default function ForgotPinPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>("EMAIL");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPin, setNewPin] = useState("");

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await sendOtp(email);
            if (res.error) setError(res.error);
            else setStep("OTP");
        } catch { setError("Failed to send code."); }
        finally { setLoading(false); }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await verifyOtp(email, otp);
            if (res.error) setError(res.error);
            else setStep("RESET");
        } catch { setError("Invalid code."); }
        finally { setLoading(false); }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await resetPin(newPin);
            if (res.error) {
                setError(res.error);
            } else {
                router.push("/dashboard");
            }
        } catch { setError("Reset failed."); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-stone-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-stone-100 relative"
            >
                <Link href="/login" className="absolute top-8 left-8 text-stone-400 hover:text-stone-600 transition-colors">
                    ← Back
                </Link>

                <div className="pt-8">
                    <AnimatePresence mode="wait">
                        {step === "EMAIL" && (
                            <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h1 className="text-2xl font-serif text-stone-800 mb-2 text-center">Reset Pin</h1>
                                <p className="text-stone-500 text-center mb-8">Enter your email to receive a recovery code</p>
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400" required />
                                    </div>
                                    <Button loading={loading} text="Send Code" />
                                </form>
                            </motion.div>
                        )}
                        {step === "OTP" && (
                            <motion.div key="step2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h1 className="text-2xl font-serif text-stone-800 mb-2 text-center">Verify Code</h1>
                                <p className="text-stone-500 text-center mb-8">Enter code sent to {email}</p>
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                        <input type="text" placeholder="Code" value={otp} onChange={e => setOtp(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono tracking-widest text-center" required />
                                    </div>
                                    <Button loading={loading} text="Verify" />
                                </form>
                            </motion.div>
                        )}
                        {step === "RESET" && (
                            <motion.div key="step3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <h1 className="text-2xl font-serif text-stone-800 mb-2 text-center">New Pin</h1>
                                <p className="text-stone-500 text-center mb-8">Set a new 4-digit pin</p>
                                <form onSubmit={handleReset} className="space-y-6">
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                                        <input type="password" placeholder="New Pin" value={newPin} onChange={e => { if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setNewPin(e.target.value) }} className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 font-mono tracking-widest" required minLength={4} maxLength={4} />
                                    </div>
                                    <Button loading={loading} text="Set Pin & Login" icon={<CheckCircle2 className="w-4 h-4 ml-2" />} />
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {error && <div className="mt-6 bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">{error}</div>}
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{text}{icon || <ArrowRight className="w-4 h-4" />}</>}
        </button>
    )
}
