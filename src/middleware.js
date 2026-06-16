import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("super_secret_key_123");

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Always allow login page
    if (pathname.startsWith("/admin/login")) {
        return NextResponse.next();
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
        // Decode JWT
        const { payload } = await jwtVerify(token, JWT_SECRET);

        const userRole = payload?.role;

        // Attach user info to request (optional use in app)
        const requestHeaders = new Headers(req.headers);
        requestHeaders.set("x-user-role", userRole || "");

        const response = NextResponse.next({
            request: {
                headers: requestHeaders
            }
        });

        /**
         * 🔐 ROLE PROTECTION LOGIC
         */

        // Example: ONLY admin can access /admin/users
        if (pathname.startsWith("/admin/users")) {
            if (userRole !== "admin") {
                return NextResponse.redirect(new URL("/admin", req.url));
            }
        }

        return response;

    } catch (err) {
        console.error("JWT Error:", err.message);

        const response = NextResponse.redirect(new URL("/admin/login", req.url));
        response.cookies.delete("token");
        return response;
    }
}

export const config = {
    matcher: ["/admin/:path*"],
};