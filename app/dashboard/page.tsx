import { CalmCard } from "@/components/CalmCard";
import { MobileNav } from "@/components/MobileNav";
import { MetricHeader } from "@/components/dashboard/MetricHeader";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TaskInputDrawer } from "@/components/dashboard/TaskInputDrawer";
import { getTasks, getCategories } from "@/app/actions/tasks";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { startOfDay, endOfDay, parseISO } from "date-fns";
import { toUTC } from "@/lib/date-utils";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PageProps {
    searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage(props: PageProps) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    // Fetch User Profile for Greeting
    let username = "Creator";
    try {
        const userProfile = await db.query.users.findFirst({
            where: eq(users.id, user.id)
        });
        if (userProfile?.username) {
            username = userProfile.username;
        }
    } catch (error) {
        console.error("Failed to fetch user profile:", error);
        // Fallback to "Creator" is already set
    }

    // Date Logic (URL -> Date -> UTC Range)
    const dateParam = searchParams.date;
    const initialDate = dateParam ? parseISO(dateParam) : new Date();

    // We treat the "URL Date" as the user's "Local Date" intention.
    const start = startOfDay(initialDate);
    const end = endOfDay(initialDate);

    // Fetch Tasks for this range (converted to UTC for DB query)
    const tasks = await getTasks(toUTC(start), toUTC(end));
    const categories = await getCategories();

    // Metrics (On-the-fly for Day View context)
    const tasksAssigned = tasks.length;
    const completedTasks = tasks.filter(t => t.status === "completed");
    const completionRate = tasksAssigned === 0 ? 0 : Math.round((completedTasks.length / tasksAssigned) * 100);
    const timeConsumed = completedTasks.reduce((acc, t) => {
        const duration = (new Date(t.end_at).getTime() - new Date(t.start_at).getTime()) / (1000 * 60);
        return acc + duration;
    }, 0);

    const metrics = {
        tasksAssigned,
        completionRate,
        timeConsumed: Math.round(timeConsumed / 60 * 10) / 10,
        topCategory: "General",
    };

    return (
        <div className="pb-24 min-h-screen">
            {/* Header Shell */}
            <header className="px-6 pt-12 pb-2">
                <p className="text-slate-500 text-sm font-medium mb-1">Good Morning,</p>
                <h1 className="text-2xl font-bold text-foreground">Hello {username}</h1>
            </header>

            <main className="px-4 space-y-4">
                <MetricHeader metrics={metrics} />

                {/* Main Content: Calendar View */}
                <CalendarView tasks={tasks} currentDate={initialDate} />
            </main>

            <TaskInputDrawer categories={categories} />
            <MobileNav />
        </div>
    );
}
