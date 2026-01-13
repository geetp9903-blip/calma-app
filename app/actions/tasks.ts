"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { tasks, categories } from "@/db/schema";
import { eq, and, gt, lt, gte, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { toUTC, generateRecurrenceDates, RecurrenceConfig } from "@/lib/date-utils";
import { addMinutes, differenceInMinutes } from "date-fns";

// --- Types ---
export type CreateTaskInput = {
    title: string;
    categoryId: string;
    startAt: string; // ISO String (Local or UTC)
    endAt: string;   // ISO String
    priority?: string;
    repeatRule?: RecurrenceConfig; // Optional Recurrence
};

// --- Actions ---

/**
 * Create Task (Materialized Recurrence)
 */
export async function createTask(data: CreateTaskInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    console.log("[createTask] Raw Input:", data); // DEBUG

    // 1. Time Normalization (Strict UTC)
    const startAtUTC = toUTC(new Date(data.startAt));
    const endAtUTC = toUTC(new Date(data.endAt));
    console.log("[createTask] Normalized UTC:", { startAtUTC, endAtUTC }); // DEBUG

    const durationMins = differenceInMinutes(endAtUTC, startAtUTC);

    if (startAtUTC >= endAtUTC) {
        return { error: "End time must be after start time." };
    }

    // 2. Prepare Parent Task Data
    const baseTask = {
        user_id: user.id,
        category_id: data.categoryId,
        title: data.title,
        status: "planned" as const,
        priority: data.priority || "medium",
        repeat_rule: data.repeatRule || null,
    };

    // 3. Insert Parent (First Instance)
    const [parentTask] = await db.insert(tasks).values({
        ...baseTask,
        start_at: startAtUTC,
        end_at: endAtUTC,
    }).returning();

    console.log("[createTask] Inserted Parent:", parentTask.id); // DEBUG

    // 4. Recurrence Generation (If rule exists)
    if (data.repeatRule) {
        const futureDates = generateRecurrenceDates(startAtUTC, data.repeatRule, 60);
        console.log("[createTask] Generating Recurrence:", futureDates.length, "instances"); // DEBUG

        if (futureDates.length > 0) {
            const children = futureDates.map(date => ({
                ...baseTask,
                parent_task_id: parentTask.id,
                repeat_rule: null, // Children don't have the rule
                start_at: date,
                end_at: addMinutes(date, durationMins), // Maintain duration
            }));

            await db.insert(tasks).values(children);
        }
    }

    revalidatePath("/dashboard");
    return { success: true, taskId: parentTask.id };
}

/**
 * Update Task (Drag / Resize / Content)
 */
export async function updateTask(taskId: string, data: {
    title?: string;
    categoryId?: string;
    startAt?: string;
    endAt?: string;
}) {
    const updates: Record<string, any> = {}; // Using Record for flexibility with Drizzle partial updates
    if (data.title) updates.title = data.title;
    if (data.categoryId) updates.category_id = data.categoryId;

    if (data.startAt && data.endAt) {
        updates.start_at = toUTC(new Date(data.startAt));
        updates.end_at = toUTC(new Date(data.endAt));
        // TODO: Validate start < end
    }

    // If updating a child task, we might want to check if it detaches? 
    // For now, user modifies just this instance.

    await db.update(tasks)
        .set(updates)
        .where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
    return { success: true };
}

/**
 * Mark Status (Planned -> Active -> Completed/Skipped)
 */
export async function markTaskStatus(taskId: string, status: "planned" | "active" | "completed" | "skipped") {
    const updates: any = { status };

    // Logic: Record Actuals
    const now = new Date(); // UTC by default in Node, or toUTC(new Date())

    if (status === "active") {
        updates.actual_start_at = now;
    } else if (status === "completed") {
        updates.actual_end_at = now;

        // Addendum: Ensure actual_start_at exists if missed
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId),
            columns: { start_at: true, actual_start_at: true }
        });

        if (task && !task.actual_start_at) {
            updates.actual_start_at = task.start_at; // Fallback to planned
        }
    }

    await db.update(tasks).set(updates).where(eq(tasks.id, taskId));
    revalidatePath("/dashboard");
}

/**
 * Start Task (Explicit Action)
 */
export async function startTask(taskId: string) {
    return markTaskStatus(taskId, "active");
}

/**
 * Get Tasks for Calendar View
 */
export async function getTasks(start: Date, end: Date) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log("[getTasks] Querying Range (UTC):", { start, end }); // DEBUG

    const results = await db.query.tasks.findMany({
        where: (t, { and, eq, gte, lte }) => and(
            eq(t.user_id, user.id),
            // Overlapping range check: TaskStart < ViewEnd AND TaskEnd > ViewStart
            lt(t.start_at, end),
            gt(t.end_at, start)
        ),
        with: {
            // Include category color if relation exists, else join manually
            // Assuming simplified query for now
        }
    });

    console.log("[getTasks] Found:", results.length, "tasks"); // DEBUG
    return results;
}

// Note: createCategory is in this file originally? 
// Wait, I am Replacing the whole file. I need to keep createCategory or re-implement it.
// The tools says "ReplacementContent" for the whole block.
// I will include createCategory in the new content below.

export async function createCategory(name: string, color: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const [newCategory] = await db.insert(categories).values({
        id: crypto.randomUUID(),
        user_id: user.id,
        name,
        color,
        is_default: false
    }).returning();

    revalidatePath("/dashboard");
    return { success: true, category: newCategory };
}

/**
 * Reflection Updates
 */
export async function updateTaskReflection(taskId: string, data: {
    mood?: string;
    value?: string;
}) {
    await db.update(tasks)
        .set({
            completion_mood: data.mood,
            completion_value: data.value
        })
        .where(eq(tasks.id, taskId));

    revalidatePath("/dashboard");
}

export async function getCategories() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    return await db.select().from(categories).where(eq(categories.user_id, user.id));
}

// --- Recurrence Templates ---

import { recurrence_templates } from "@/db/schema";

export async function createRecurrenceTemplate(name: string, rule: RecurrenceConfig) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated" };

    const [template] = await db.insert(recurrence_templates).values({
        name,
        user_id: user.id,
        rule: rule, // Stored as jsonb
    }).returning();

    revalidatePath("/dashboard");
    return { success: true, template };
}

export async function getRecurrenceTemplates() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    return await db.select().from(recurrence_templates).where(eq(recurrence_templates.user_id, user.id));
}

export async function getTasksForMonth(year: string, month: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const start = new Date(`${year}-${month}-01T00:00:00Z`);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0, 23, 59, 59);

    return await db.select({
        id: tasks.id,
        title: tasks.title,
        start_at: tasks.start_at,
        status: tasks.status,
    })
        .from(tasks)
        .where(and(
            eq(tasks.user_id, user.id),
            gte(tasks.start_at, start),
            lte(tasks.start_at, end),
            eq(tasks.status, "completed")
        ))
        .orderBy(tasks.start_at);
}

