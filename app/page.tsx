import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-black p-6 font-sans">
      {/* Branding */}
      <div className="w-20 h-20 bg-calma-blue-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-calma-blue-500/30 ring-1 ring-white/20 animate-in fade-in zoom-in duration-700">
        <div className="w-10 h-10 border-2 border-white rounded-full opacity-80" />
      </div>

      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-center text-slate-900 dark:text-white mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-100">
        Calma
      </h1>
      <p className="text-xl text-slate-500 dark:text-slate-400 text-center max-w-md mb-12 animate-in slide-in-from-bottom-4 duration-700 delay-200">
        Clarity in motion. <br />A task scheduler for the focused mind.
      </p>

      <Link
        href="/login"
        className="group relative inline-flex items-center justify-center px-8 py-4 font-semibold text-white transition-all duration-200 bg-slate-900 font-lg rounded-xl hover:bg-slate-800 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:bg-white dark:text-black dark:hover:bg-slate-200 animate-in fade-in duration-700 delay-300"
      >
        <span>Enter Protocol</span>
        <ArrowRight className="w-5 h-5 ml-2 -mr-1 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
