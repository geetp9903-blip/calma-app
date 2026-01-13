import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => {
                        request.cookies.set(name, value);
                    });
                    response = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Route Protection Logic
    const path = request.nextUrl.pathname;
    const isAuthRoute = path.startsWith("/auth");
    const isDashboardRoute = path.startsWith("/dashboard");

    // 1. Not logged in -> Redirect to /login
    // Protect dashboard
    if (!user && isDashboardRoute) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Logged in -> Check Profile Setup
    if (user) {
        // NOTE: We cannot easily check the database (Drizzle) here in middleware due to edge runtime limitations usually.
        // We will rely on the Server Component / Action checks on the pages themselves to redirect if profile is missing.
        // Middleware mainly refreshes the session here.

        // However, if user is on /login, redirect to /dashboard
        if (path === "/login") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return response;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
