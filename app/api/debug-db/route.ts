import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

export const dynamic = 'force-dynamic';

export async function GET() {
    const start = performance.now();
    try {
        // 1. Check Env Var presence (mask secret)
        const dbUrl = process.env.DATABASE_URL;
        const configStatus = {
            hasUrl: !!dbUrl,
            urlPrefix: dbUrl?.split(":")[0],
            host: dbUrl?.split("@")[1]?.split(":")[0],
            isSsl: true // We enforced it in lib/db.ts
        };

        // 2. Test Connection
        const result = await db.execute(sql`SELECT 1 as connected, version() as version`);

        const duration = performance.now() - start;

        return NextResponse.json({
            status: "success",
            message: "Database connected successfully",
            latency: `${duration.toFixed(2)}ms`,
            config: configStatus,
            db_version: result[0]?.version,
            data: result
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            status: "error",
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint || "Check Vercel Env Vars and Supabase IP Restrictions",
            full_error: String(error)
        }, { status: 500 });
    }
}
