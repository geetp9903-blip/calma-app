import { pgTable, uuid, varchar, timestamp, boolean, text, jsonb } from "drizzle-orm/pg-core";

// Public Profile Table (Extends Supabase Auth)
export const users = pgTable("users", {
    id: uuid("id").primaryKey(), // Matches auth.users.id
    email: varchar("email").notNull(),
    username: varchar("username").notNull(),
    pin_hash: varchar("pin_hash").notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    // Settings for Theme, Notifications, etc.
    settings: jsonb("settings").default({
        theme: "neutral",
        startOfWeek: "monday",
        notifications: {
            daily: false,
            weekly: false,
            monthly: true
        }
    }),
});

export const categories = pgTable("categories", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(),
    color: varchar("color").notNull(), // Hex
    is_default: boolean("is_default").default(false),
});

export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    category_id: uuid("category_id")
        .notNull()
        .references(() => categories.id, { onDelete: "cascade" }),
    title: text("title").notNull(),

    // Planned Time (UTC, Source of Truth for Calendar)
    start_at: timestamp("start_at", { withTimezone: true, mode: 'date' }).notNull(),
    end_at: timestamp("end_at", { withTimezone: true, mode: 'date' }).notNull(),

    // Actual Execution Time (for drift tracking)
    actual_start_at: timestamp("actual_start_at", { withTimezone: true, mode: 'date' }),
    actual_end_at: timestamp("actual_end_at", { withTimezone: true, mode: 'date' }),

    // Status Enum
    status: varchar("status", { enum: ["planned", "active", "completed", "skipped"] })
        .notNull()
        .default("planned"),

    // Recurrence (Materialized Model)
    // Parent Task holds the rule. Children have parent_task_id.
    parent_task_id: uuid("parent_task_id"),
    repeat_rule: jsonb("repeat_rule"), // e.g. { freq: 'daily', interval: 1 }

    // Reflection / Metadata
    priority: varchar("priority").default("medium"),
    completion_mood: varchar("completion_mood"),
    completion_value: varchar("completion_value"),

    created_at: timestamp("created_at").defaultNow().notNull(),
});

// Custom Recurrence Templates
export const recurrence_templates = pgTable("recurrence_templates", {
    id: uuid("id").defaultRandom().primaryKey(),
    user_id: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    name: varchar("name").notNull(), // e.g. "Gym Routine w/ Rest"
    rule: jsonb("rule").notNull(),   // The RRule config
    created_at: timestamp("created_at").defaultNow().notNull(),
});
