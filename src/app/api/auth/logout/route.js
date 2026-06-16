import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    try {
        // 1. Await cookies() to comply with modern Next.js async requirements
        const cookieStore = await cookies();

        // 2. Use .delete() to instantly wipe out the token cookie globally
        cookieStore.delete({
            name: "token",
            path: "/", // Matches the exact path the cookie was created on
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json(
            { success: false, error: "Failed to log out" },
            { status: 500 }
        );
    }
}