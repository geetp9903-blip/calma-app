"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { tasks, categories } from "@/db/schema";
import { eq, and, gte, lte, desc, count, sql, isNotNull } from "drizzle-orm";
import { subDays, format, eachDayOfInterval, differenceInMinutes, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, eachMonthOfInterval, isFuture, isAfter, isBefore } from "date-fns";

// --- Types ---
export type InsightsMode = "month" | "year" | "all";

export type TrendDataPoint = {
    date: string; // Formatting depends on view
    fullDate: string; // ISO date for sorting/keying
    assigned: number;
    completed: number;
};

export type CategoryPerfData = {
    id: string;
    name: string;
    color: string;
    totalAssigned: number; // For Frequency view (Plan)
    pastAssigned: number; // For Completion rate (Reference)
    completed: number;
    completionRate: number; // 0-100
};

export type FocusBalanceData = {
    name: string;
    color: string;
    value: number; // count of completed tasks
    percentage: number;
};

// --- Actions ---

/**
 * EXECUTION TREND (Line/Area Chart)
 * - Month: Daily points. Strict cut-off at Today.
 * - Year/All: Monthly points. Strict cut-off at This Month.
 */
export async function getExecutionTrend(mode: InsightsMode = "month"): Promise<TrendDataPoint[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    // Normalize "now" to end of day for comparison if needed, or keep precise for "Until Now"
    // For trend "Today", we want to include today so far.

    let start: Date;
    let end: Date = now; // Strictly stop at now
    let groupBy: "day" | "month";
    let dateFormat: string;

    if (mode === "month") {
        start = startOfMonth(now);
        groupBy = "day";
        dateFormat = "yyyy-MM-dd";
    } else if (mode === "year") {
        start = startOfYear(now);
        groupBy = "month";
        dateFormat = "yyyy-MM";
    } else {
        // All Time
        const earliest = await db.select({ date: tasks.start_at }).from(tasks).where(eq(tasks.user_id, user.id)).orderBy(tasks.start_at).limit(1);
        start = earliest.length > 0 ? earliest[0].date : startOfYear(now);
        groupBy = "month";
        dateFormat = "yyyy-MM";
    }

    // Filter tasks up to NOW
    const rawTasks = await db
        .select({
            date: tasks.start_at,
            status: tasks.status,
        })
        .from(tasks)
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start),
                lte(tasks.start_at, end)
            )
        );

    // Initialize groupings
    const grouped: Record<string, { assigned: number; completed: number; dateValue: Date }> = {};

    // Pre-fill Logic to ensure continuity up to NOW
    if (groupBy === "day") {
        const days = eachDayOfInterval({ start, end });
        days.forEach(d => {
            const key = format(d, dateFormat);
            grouped[key] = { assigned: 0, completed: 0, dateValue: d };
        });
    } else {
        const months = eachMonthOfInterval({ start, end });
        months.forEach(d => {
            const key = format(d, dateFormat);
            grouped[key] = { assigned: 0, completed: 0, dateValue: d };
        });
    }

    // Aggregation
    rawTasks.forEach(t => {
        const key = format(t.date, dateFormat);
        if (grouped[key]) {
            grouped[key].assigned += 1;
            if (t.status === "completed") {
                grouped[key].completed += 1;
            }
        }
    });

    // Formatting Loop
    const results = Object.values(grouped)
        .sort((a, b) => a.dateValue.getTime() - b.dateValue.getTime())
        .map(g => ({
            date: groupBy === "day" ? format(g.dateValue, "d") : format(g.dateValue, "MMM"),
            fullDate: format(g.dateValue, dateFormat),
            assigned: g.assigned,
            completed: g.completed
        }));

    return results;
}

/**
 * CATEGORY PERFORMANCE (Bar Chart)
 * - Modes: Completion (Efficiency) vs Planning (Volume)
 * - Logic: 
 *      - Completion Rate = Completed / Past Assigned (Tasks <= Now)
 *      - Frequency (Volume) = 
 *          - Month View: Total Assigned (Past + Future) -> Shows intent
 *          - Year/All Views: Past Assigned (History Only) -> strict history
 */
export async function getCategoryPerformance(mode: InsightsMode = "month"): Promise<CategoryPerfData[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    let start: Date;
    let end: Date;

    if (mode === "month") {
        start = startOfMonth(now);
        end = endOfMonth(now); // Include future of this month
    } else if (mode === "year") {
        start = startOfYear(now);
        end = endOfYear(now);
    } else {
        // All Time
        start = subDays(now, 365 * 10);
        end = now; // For All Time default "until now" usually suffices
    }

    const rawData = await db
        .select({
            id: categories.id,
            name: categories.name,
            color: categories.color,
            status: tasks.status,
            startAt: tasks.start_at
        })
        .from(tasks)
        .innerJoin(categories, eq(tasks.category_id, categories.id))
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start),
                lte(tasks.start_at, end)
            )
        );

    const map: Record<string, CategoryPerfData> = {};

    rawData.forEach(t => {
        if (!map[t.id]) {
            map[t.id] = {
                id: t.id,
                name: t.name,
                color: t.color,
                totalAssigned: 0,
                pastAssigned: 0,
                completed: 0,
                completionRate: 0
            };
        }

        const isPast = t.startAt <= now;

        // "Frequency" Logic
        if (mode === "month") {
            // Month View: Show FULL plan (Past + Future) in Frequency
            map[t.id].totalAssigned += 1;
        } else {
            // Year/All View: Show HISTORY only in Frequency
            if (isPast) {
                map[t.id].totalAssigned += 1;
            }
        }

        // "Completion" Logic (ALWAYS Past only)
        if (isPast) {
            map[t.id].pastAssigned += 1;
            if (t.status === "completed") {
                map[t.id].completed += 1;
            }
        }
    });

    return Object.values(map)
        .map(c => ({
            ...c,
            // Rate is purely based on Past (Efficiency)
            completionRate: c.pastAssigned > 0 ? Math.round((c.completed / c.pastAssigned) * 100) : 0
        }))
        .sort((a, b) => b.totalAssigned - a.totalAssigned) // Default sort by volume
        .slice(0, 5);
}

/**
 * FOCUS BALANCE (Snapshot)
 * - Distribution of COMPLETED tasks.
 * - Always "Until Now" naturally (since future tasks aren't completed).
 */
export async function getFocusBalance(mode: InsightsMode = "month"): Promise<FocusBalanceData[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
    let start: Date;
    let end: Date = now;

    if (mode === "month") {
        start = startOfMonth(now);
    } else if (mode === "year") {
        start = startOfYear(now);
    } else {
        start = subDays(now, 365 * 10);
    }

    const completedTasks = await db
        .select({
            name: categories.name,
            color: categories.color,
        })
        .from(tasks)
        .innerJoin(categories, eq(tasks.category_id, categories.id))
        .where(
            and(
                eq(tasks.user_id, user.id),
                gte(tasks.start_at, start),
                lte(tasks.start_at, end),
                eq(tasks.status, "completed")
            )
        );

    const total = completedTasks.length;
    if (total === 0) return [];

    const agg: Record<string, { count: number, color: string }> = {};
    completedTasks.forEach(t => {
        if (!agg[t.name]) agg[t.name] = { count: 0, color: t.color };
        agg[t.name].count += 1;
    });

    return Object.entries(agg)
        .map(([name, { count, color }]) => ({
            name,
            color,
            value: count,
            percentage: Math.round((count / total) * 100)
        }))
        .sort((a, b) => b.value - a.value);
}

// Re-export old helpers if needed for legacy components not yet removed, 
// or remove them if confirmed unused. Keeping `getConsistencyScore` and `getMicroObservations` 
// updated to use new logic is best.

export async function getConsistencyScore(): Promise<number> {
    // Consistency is about execution reliability. 
    // We'll trust "Month" trend by default.
    const trend = await getExecutionTrend('month');
    if (trend.length === 0) return 0;

    let totalAssigned = 0;
    let totalCompleted = 0;
    trend.forEach(d => {
        totalAssigned += d.assigned;
        totalCompleted += d.completed;
    });

    if (totalAssigned === 0) return 0;
    return Math.round((totalCompleted / totalAssigned) * 100);
}

export async function getMicroObservations(): Promise<string[]> {
    const perf = await getCategoryPerformance('month');
    const trend = await getExecutionTrend('month');
    const obs: string[] = [];

    // Trend balance (Last 7 Days)
    const last7 = trend.slice(-7);
    const assigned7 = last7.reduce((a, b) => a + b.assigned, 0);
    const completed7 = last7.reduce((a, b) => a + b.completed, 0);
    const rate7 = assigned7 > 0 ? (completed7 / assigned7) : 0;

    if (assigned7 > 20 && rate7 < 0.6) {
        obs.push("Ambitious planning. You're assigning more than you typically complete.");
    } else if (rate7 > 0.9 && assigned7 > 10) {
        obs.push("Sustainable pace. You're reliably clearing your daily board.");
    }

    // Category Dominance
    if (perf.length > 0) {
        // Perf is sorted by totalAssigned (Plan Volume for Month)
        const top = perf[0];
        const allAssigned = perf.reduce((a, b) => a + b.totalAssigned, 0);

        if (top.totalAssigned > allAssigned * 0.5) {
            obs.push(`${top.name} is dominating your schedule (${Math.round((top.totalAssigned / allAssigned) * 100)}% of tasks).`);
        }

        const struggler = perf.find(c => c.pastAssigned > 5 && c.completionRate < 50);
        if (struggler) {
            obs.push(`High intent on ${struggler.name}, but execution is lagging.`);
        }
    }

    if (obs.length === 0) obs.push("Log more tasks to see behavioral patterns.");
    return obs.slice(0, 2);
}

export async function getMonthlyTaskCounts() {
    // Keep for heatmap or archive
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const now = new Date();
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
        month: c.month,
        count: Number(c.count),
        eligible: Number(c.count) >= 4
    }));
}


