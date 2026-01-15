import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "@/db/schema";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

dotenv.config({ path: ".env.local" });

const run = async () => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error("❌ DATABASE_URL is missing in .env.local");
        process.exit(1);
    }

    console.log(`🔌 Connecting to: ${connectionString.replace(/:[^:@]+@/, ":****@")}`); // Log masked URL

    // Test configuration matching lib/db.ts
    const client = postgres(connectionString, {
        prepare: false,
        ssl: 'require'
    });

    const db = drizzle(client, { schema });

    try {
        console.log("⏳ Pinging database...");
        // Simple raw query to test connection
        await client`SELECT 1`;
        console.log("✅ Connection established!");

        console.log("⏳ Checking 'users' table...");
        const result = await db.select().from(users).limit(1);
        console.log("✅ Query successful!", result);

    } catch (error: any) {
        console.error("❌ Database Failure:", error);
        console.error("DETAILS:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
        });
    } finally {
        await client.end();
        process.exit(0);
    }
};

run();
