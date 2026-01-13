"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { tasks, categories } from "@/db/schema";
import { eq, and, gte, lte, desc, count, sql, isNotNull } from "drizzle-orm";
import { subDays, format, eachDayOfInterval, differenceInMinutes, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

// --- Types ---
export type CategoryData = {
    name: string;
    value: number; // minutes
    fill: string; // color
};

export type TrendData = {
    date: string;
    rate: number; // percentage
};

// --- Actions ---

export async function getCategoryBreakdown(range: "week" | "month" = "week") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    const start = range === "week" ? startOfWeek(now) : startOfMonth(now);
    const end = range === "week" ? endOfWeek(now) : endOfMonth(now);

    const data = await db
        .select({
            name: categories.name,
            color: categories.color,
            startTime: tasks.actual_start_at, // Use Actual for insights
            endTime: tasks.actual_end_at,
        })
        .from(tasks)
        .innerJoin(categories, eq(tasks.category_id, categories.id))
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start), // Filter by Planned range
                lte(tasks.end_at, end),
                eq(tasks.status, "completed")
            )
        );

    // Aggregate
    const agg: Record<string, { duration: number; color: string }> = {};

    data.forEach(t => {
        if (!t.startTime || !t.endTime) return;
        const mins = differenceInMinutes(t.endTime, t.startTime);
        if (!agg[t.name]) agg[t.name] = { duration: 0, color: t.color };
        agg[t.name].duration += mins;
    });

    return Object.entries(agg).map(([name, { duration, color }]) => ({
        name,
        value: duration,
        fill: color,
    })).sort((a, b) => b.value - a.value);
}

export async function getCompletionTrend(range: "week" | "month" = "week") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    const days = range === "week" ? 7 : 30;
    const start = subDays(now, days);

    const rawTasks = await db
        .select({
            date: tasks.start_at,
            status: tasks.status,
        })
        .from(tasks)
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start)
            )
        );

    const grouped: Record<string, { total: number; completed: number }> = {};
    for (let i = 0; i <= days; i++) {
        const d = subDays(now, days - i);
        const key = format(d, "yyyy-MM-dd");
        grouped[key] = { total: 0, completed: 0 };
    }

    rawTasks.forEach(t => {
        const key = format(t.date, "yyyy-MM-dd");
        if (grouped[key]) {
            grouped[key].total += 1;
            if (t.status === "completed") grouped[key].completed += 1;
        }
    });

    return Object.entries(grouped).map(([date, counts]) => ({
        date: format(new Date(date), "MMM dd"),
        rate: counts.total === 0 ? 0 : Math.round((counts.completed / counts.total) * 100)
    }));
}

// --- V2: Redesigned Analytics ---

export interface TrendDataPoint {
    date: string; // "Mon 12"
    fullDate: string; // "2024-01-12"
    assigned: number;
    completed: number;
}

export async function getExecutionTrend(): Promise<TrendDataPoint[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    const days = 30;
    const start = subDays(now, days);

    // Get all tasks in range
    const rawTasks = await db
        .select({
            date: tasks.start_at,
            status: tasks.status,
        })
        .from(tasks)
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start)
            )
        );

    // Initialize 30-day map
    const grouped: Record<string, { assigned: number; completed: number }> = {};
    for (let i = 0; i <= days; i++) {
        const d = subDays(now, days - i);
        const key = format(d, "yyyy-MM-dd");
        grouped[key] = { assigned: 0, completed: 0 };
    }

    // Fill data
    rawTasks.forEach(t => {
        const key = format(t.date, "yyyy-MM-dd");
        if (grouped[key]) {
            grouped[key].assigned += 1;
            if (t.status === "completed") grouped[key].completed += 1;
        }
    });

    return Object.entries(grouped).map(([key, counts]) => ({
        date: format(new Date(key), "MMM dd"), // "Jan 12"
        fullDate: key,
        assigned: counts.assigned,
        completed: counts.completed
    }));
}

export interface CategoryPerfData {
    id: string;
    name: string;
    color: string;
    assigned: number;
    completed: number;
    completionRate: number; // 0-100
}

export async function getCategoryPerformance(): Promise<CategoryPerfData[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // Last 30 days
    const start = subDays(new Date(), 30);

    const data = await db
        .select({
            id: categories.id,
            name: categories.name,
            color: categories.color,
            status: tasks.status,
        })
        .from(tasks)
        .innerJoin(categories, eq(tasks.category_id, categories.id))
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start)
            )
        );

    const map: Record<string, CategoryPerfData> = {};

    data.forEach(t => {
        if (!map[t.id]) {
            map[t.id] = {
                id: t.id,
                name: t.name,
                color: t.color,
                assigned: 0,
                completed: 0,
                completionRate: 0
            };
        }
        map[t.id].assigned += 1;
        if (t.status === "completed") map[t.id].completed += 1;
    });

    const result = Object.values(map).map(c => ({
        ...c,
        completionRate: c.assigned > 0 ? Math.round((c.completed / c.assigned) * 100) : 0
    }));

    // Return Top 5 by default (sorted by assigned volume initially, UI can toggle)
    return result.sort((a, b) => b.assigned - a.assigned).slice(0, 5);
}

export async function getConsistencyScore(): Promise<number> {
    const trend = await getExecutionTrend();
    if (trend.length === 0) return 0;

    let totalAssigned = 0;
    let totalCompleted = 0;

    trend.forEach(d => {
        totalAssigned += d.assigned;
        totalCompleted += d.completed;
    });

    if (totalAssigned === 0) return 0;

    // User requested: "Consistency based on number of completed tasks over total average tasks assigned"
    // Actually simpler interpretation: Global Completion Rate for the month is a good proxy for "Consistency" in this context
    // or (Days with >0 completion / Total Days with assignments).
    // Let's stick to Completion Rate % for now as the "Score".
    return Math.round((totalCompleted / totalAssigned) * 100);
}

export async function getMicroObservations(): Promise<string[]> {
    const perf = await getCategoryPerformance();
    const trend = await getExecutionTrend();
    const obs: string[] = [];

    // 1. Balance vs Overload
    // Check total assigned in last 7 days vs previous 7
    const last7 = trend.slice(-7);
    const assigned7 = last7.reduce((a, b) => a + b.assigned, 0);
    const completed7 = last7.reduce((a, b) => a + b.completed, 0);

    const rate7 = assigned7 > 0 ? (completed7 / assigned7) : 0;

    if (assigned7 > 20 && rate7 < 0.6) {
        obs.push("Ambitious planning. You're assigning more than you typically complete.");
    } else if (rate7 > 0.9 && assigned7 > 10) {
        obs.push(" sustainable pace. You're reliably clearing your daily board.");
    }

    // 2. Category Dominance
    if (perf.length > 0) {
        const top = perf[0];
        // If top category has > 50% of all assigned tasks
        const totalAssigned = perf.reduce((a, b) => a + b.assigned, 0);
        if (top.assigned > totalAssigned * 0.5) {
            obs.push(`${top.name} is dominating your schedule (${Math.round((top.assigned / totalAssigned) * 100)}% of tasks).`);
        }

        // High effort low completion
        const struggler = perf.find(c => c.assigned > 5 && c.completionRate < 50);
        if (struggler) {
            obs.push(`High intent on ${struggler.name}, but execution is lagging.`);
        }
    }

    if (obs.length === 0) obs.push("Log more tasks to see behavioral patterns.");

    return obs.slice(0, 2);
}

// Keep PDF Export as is
export async function getMonthlyTaskCounts() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    // Check last 12 months for eligible export
    const start = startOfMonth(subDays(now, 365));

    const counts = await db
        .select({
            month: sql<string>`to_char(${tasks.start_at}, 'YYYY-MM')`,
            count: count(tasks.id),
        })
        .from(tasks)
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start),
                eq(tasks.status, "completed")
            )
        )
        .groupBy(sql`to_char(${tasks.start_at}, 'YYYY-MM')`)
        .orderBy(desc(sql`to_char(${tasks.start_at}, 'YYYY-MM')`));

    return counts.map(c => ({
        month: c.month, // "2024-01"
        count: Number(c.count),
        eligible: Number(c.count) >= 4
    }));
}
