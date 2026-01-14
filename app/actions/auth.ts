"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// --- Types ---
export type AuthResponse = {
    success?: boolean;
    error?: string;
    message?: string;
    session?: any;
};

// --- Helpers ---
const PEPPER = process.env.PIN_PEPPER || "default-pepper-ChangeThisInProd"; // Use env var in real app

function hashPin(pin: string): string {
    return bcrypt.hashSync(pin, 10);
}

function verifyPinHash(pin: string, hash: string): boolean {
    return bcrypt.compareSync(pin, hash);
}

/* 
 * We map the 4-digit PIN to a "password" for Supabase Auth 
 * so we can use standard sign-in methods without magic links.
 * Password = PIN + PEPPER (simple deterministic combo for recovery/login)
 * Note: Ideally, we'd use a Custom Auth Provider, but 'password' is easiest 
 * to hijack for this "Pin only" feel while keeping Supabase happy.
 */
function getSupabasePassword(pin: string): string {
    return `${pin}-${PEPPER}`;
}

// --- Actions ---

/**
 * 1. Send OTP to Email (Step 1 of Register/Login/Forgot)
 */
export async function sendOtp(email: string): Promise<AuthResponse> {
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            shouldCreateUser: true, // Allow creating user if not exists (we'll claim them later)
            // options: { data: { ... } } // Can pass metadata if needed
        }
    });

    if (error) return { error: error.message };
    return { success: true, message: "Code sent to email." };
}

/**
 * 2. Verify OTP (Step 2)
 * Used during Registration or Forgot Pin to prove email ownership before sensitive ops.
 */
export async function verifyOtp(email: string, code: string): Promise<AuthResponse> {
    const supabase = await createClient();

    // VerifyOtp with Supabase
    // type: 'email' | 'recovery' | 'signup' -> 'email' is magic link usually, 
    // but for OTP code verification we use 'email' w/ token.
    const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'email',
    });

    if (error) return { error: error.message };

    // Session is now active
    return { success: true, session: data.session };
}

/**
 * 3. Register Profile (Step 3 of Signup)
 * Only call this AFTER verifying OTP (user should be authenticated via OTP session).
 */
export async function registerProfile(username: string, pin: string): Promise<AuthResponse> {
    const supabase = await createClient();

    // 1. Check if user is currently logged in (via the OTP verify step)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Session expired. Please verify email again." };

    // 2. Validate Username Uniqueness
    const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (existingUser) {
        return { error: "Username already taken." };
    }

    // 3. Update Supabase User: Set "Password" so they can login with Pin later
    // We set the password to something deterministic based on the Pin.
    const { error: updateError } = await supabase.auth.updateUser({
        password: getSupabasePassword(pin)
    });

    if (updateError) return { error: `Failed to set pin: ${updateError.message}` };

    // 4. Create Public Profile in Postgres
    // Check if profile exists already? (Maybe partially created?)
    const existingProfile = await db.query.users.findFirst({
        where: eq(users.id, user.id)
    });

    if (existingProfile) {
        // Update existing (maybe they backed out halfway before)
        await db.update(users).set({
            username,
            pin_hash: hashPin(pin),
            email: user.email!,
        }).where(eq(users.id, user.id));
    } else {
        // Insert new
        await db.insert(users).values({
            id: user.id,
            email: user.email!,
            username,
            pin_hash: hashPin(pin),
        });
    }

    revalidatePath("/dashboard");
    return { success: true, message: "Profile created!" };
}

/**
 * 4. Login (Username + Pin)
 */
export async function loginWithPin(username: string, pin: string): Promise<AuthResponse> {
    const supabase = await createClient();

    // 1. Lookup Email by Username
    const userRecord = await db.query.users.findFirst({
        where: eq(users.username, username)
    });

    if (!userRecord) {
        return { error: "Invalid username or pin." }; // Generic error
    }

    // 2. SignIn with Password (mapped from Pin)
    // We rely on Supabase to handle the password verification (security, timing attacks, etc.)
    const { data, error } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password: getSupabasePassword(pin),
    });

    if (error) {
        console.error("Supabase Login Error:", error);
        return { error: "Login failed. Please try again." };
    }

    return { success: true, session: data.session };
}

/**
 * 5. Forgot Pin (Reset Flow)
 * Requires active session (verified via OTP)
 */
export async function resetPin(newPin: string): Promise<AuthResponse> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Not authenticated." };

    // 1. Update Supabase Password (for login)
    const { error: updateError } = await supabase.auth.updateUser({
        password: getSupabasePassword(newPin)
    });

    if (updateError) return { error: updateError.message };

    // 2. Update DB Hash (for verification)
    await db.update(users)
        .set({ pin_hash: hashPin(newPin) })
        .where(eq(users.id, user.id));

    return { success: true, message: "Pin reset successfully." };
}

/**
 * 6. Update Email
 */
export async function updateEmail(newEmail: string): Promise<AuthResponse> {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ email: newEmail });

    if (error) return { error: error.message };

    return { success: true, message: "Confirmation link sent to new email." };
}
