import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("super_secret_key_123");

/* =========================================================
    RESET PASSWORD (ADMIN ONLY)
========================================================= */
export async function PUT(req) {
    try {
        // 1. Auth (get token from cookies)
        const token = req.cookies.get("token")?.value;

        if (!token) {
            return Response.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { payload } = await jwtVerify(token, JWT_SECRET);

        // 2. Only admin allowed
        if (payload.role !== "admin") {
            return Response.json(
                { success: false, error: "Forbidden: Admin only" },
                { status: 403 }
            );
        }

        // 3. Read body
        const { userId, newPassword } = await req.json();

        const id = Number(userId);

        if (!id || Number.isNaN(id)) {
            return Response.json(
                { success: false, error: "Invalid user ID" },
                { status: 400 }
            );
        }

        if (!newPassword || newPassword.length < 6) {
            return Response.json(
                { success: false, error: "Password too short" },
                { status: 400 }
            );
        }

        // 4. Hash password
        const hashed = await bcrypt.hash(newPassword, 10);

        // 5. Update DB
        const [result] = await db.query(
            `UPDATE users 
             SET password = ?, must_reset_password = 0, updated_at = NOW()
             WHERE id = ?`,
            [hashed, id]
        );

        if (!result.affectedRows) {
            return Response.json(
                { success: false, error: "User not found" },
                { status: 404 }
            );
        }

        return Response.json({
            success: true,
            message: "Password reset successfully"
        });

    } catch (err) {
        console.error("RESET PASSWORD ERROR:", err);

        return Response.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}