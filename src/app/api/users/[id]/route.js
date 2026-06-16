import { db } from "@/lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode("super_secret_key_123");

export async function DELETE(req, { params }) {
    try {
        // 1. Authenticate and get current user ID
        const token = req.cookies.get("token")?.value;
        if (!token) {
            return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const currentUserId = Number(payload.id);

        // 2. Await params and get target ID
        const { id } = await params;
        const targetUserId = Number(id);

        if (!targetUserId || isNaN(targetUserId)) {
            return Response.json({ success: false, error: "Invalid user ID" }, { status: 400 });
        }

        // 3. Prevent Self-Deletion
        if (currentUserId === targetUserId) {
            return Response.json(
                { success: false, error: "You cannot delete your own account." },
                { status: 403 }
            );
        }

        // 4. Database Execution
        const [result] = await db.query("DELETE FROM users WHERE id = ?", [targetUserId]);

        if (result.affectedRows === 0) {
            return Response.json({ success: false, error: "User not found" }, { status: 404 });
        }

        return Response.json({ success: true, message: "User deleted successfully" });

    } catch (err) {
        console.error("API DELETE ERROR:", err);
        return Response.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}