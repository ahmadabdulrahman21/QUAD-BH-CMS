import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = "super_secret_key_123";

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Not authenticated",
                },
                { status: 401 }
            );
        }

        const user = jwt.verify(token, JWT_SECRET);

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        return NextResponse.json(
            {
                success: false,
                error: "Invalid token",
            },
            { status: 401 }
        );
    }
}