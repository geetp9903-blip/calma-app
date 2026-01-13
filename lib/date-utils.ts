import { startOfDay, endOfDay, addDays, addWeeks, startOfWeek } from "date-fns";

/**
 * Ensures the date is treated as UTC for storage.
 * In a real app, you might use date-fns-tz, but for now we enforce ISO strings.
 */
export function toUTC(date: Date): Date {
    return new Date(date.toISOString());
}

export type RecurrenceConfig = {
    freq: "DAILY" | "WEEKLY";
    interval: number;
    count?: number; // fallback limit
    days?: number[]; // 0=Sun, 1=Mon, ... (UTC days)
    endDate?: string; // ISO Date String
};

/**
 * Generates dates based on a recurrence rule.
 * Supports Daily/Weekly with specific days and End Date.
 */
export function generateRecurrenceDates(startAt: Date, rule: RecurrenceConfig, limit: number = 60): Date[] {
    const dates: Date[] = [];
    let current = new Date(startAt);

    // Safety break: if interval is 0 or negative
    if (rule.interval < 1) rule.interval = 1;

    // Resolve End limit
    const hardLimitDate = rule.endDate ? new Date(rule.endDate) : addDays(startAt, limit); // Default to limit if no end date
    // Actually, if endDate is set, we follow it (up to a reasonable max to prevent infinite loops if user sets 2099)
    // The "Materialization" usually happens in batches (e.g. next 60 days). 
    // If user wants "Forever", we only start with 60 days.
    // If user sets "End Date" next week, we stop there.
    // So we take the MIN(rule.endDate, start + 60 days).

    const horizon = addDays(new Date(), 90); // Materialize 3 months max at a time
    const effectiveEnd = rule.endDate
        ? (new Date(rule.endDate) < horizon ? new Date(rule.endDate) : horizon)
        : horizon;

    // If specific days are set (e.g. Mon, Wed), we need to iterate day by day or week by week
    if (rule.days && rule.days.length > 0) {
        // "Weekly" with specific days. 
        // We iterate day by day from startAt until effectiveEnd
        // If current day match rule.days, add.
        // Wait, how does 'interval' work with specific days? "Every 2 weeks on Mon, Wed"?
        // Standard RRule: Interval applies to the Frequency. 
        // If Freq=WEEKLY, Interval=2, Days=[Mon, Wed]. 
        // It means: Week 1 (Mon, Wed) -> Week 3 (Mon, Wed).

        let weekRef = startOfWeek(startAt, { weekStartsOn: 0 }); // Sunday start

        // We iterate WEEKS
        while (weekRef <= effectiveEnd) {
            // Check if this week is allowed (based on interval)
            // But we need to sync with startAt. 
            // Simplified: If interval=1, every week.

            // For each day in valid week, check if in rule.days
            for (const dayIndex of rule.days) {
                // Construct the date for this dayIndex in the current weekRef
                // weekRef is Sunday. dayIndex 0=Sun, 1=Mon...
                const candidate = addDays(weekRef, dayIndex);

                // Must be >= startAt
                if (candidate < startAt) continue;
                if (candidate > effectiveEnd) break;

                // Add to list
                dates.push(candidate);
            }

            // Move to next interval
            weekRef = addWeeks(weekRef, rule.interval);
        }

    } else {
        // Standard Daily/Weekly without specific days
        // Skip the first one if it's the startAt? 
        // Logic: if startAt is the parent task, we generate SUBSEQUENT.
        // For simplicity: We generate FROM startAt. The caller handles filtering "parent" if needed.
        // Actually earlier I said generateRecurrenceDates starts from "next". 
        // Let's stick to generating *additional* instances.

        // 1. Advance first
        if (rule.freq === "DAILY") current = addDays(current, rule.interval);
        if (rule.freq === "WEEKLY") current = addWeeks(current, rule.interval);

        while (current <= effectiveEnd) {
            dates.push(new Date(current));

            if (rule.freq === "DAILY") current = addDays(current, rule.interval);
            if (rule.freq === "WEEKLY") current = addWeeks(current, rule.interval);
        }
    }

    return dates;
}
