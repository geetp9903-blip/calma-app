
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        await db.execute(sql`TRUNCATE TABLE tasks CASCADE;`);
        console.log("Tasks table truncated.");
        process.exit(0);
    } catch (e) {
        console.error("Error truncating:", e);
        process.exit(1);
    }
}
main();
