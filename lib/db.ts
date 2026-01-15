import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"; // Using the 'postgres' package required by user
import * as schema from "@/db/schema";

const connectionString = process.env.DATABASE_URL || "";

// Disable prefetch as it is not supported for "Transaction" mode pooler in Supabase usually
// But broadly sticking to default unless issues arise. 
// However, 'postgres' client is good.
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });
