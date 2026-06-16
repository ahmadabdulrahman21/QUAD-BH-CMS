import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/* ================= GET USERS ================= */
export async function GET() {
    try {
        const [users] = await db.query(`
            SELECT 
                id,
                name,
                email,
                role,
                created_at,
                updated_at,
                must_reset_password
            FROM users
            ORDER BY id DESC
        `);

        return Response.json({
            success: true,
            users
        });

    } catch (err) {
        return Response.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/* ================= CREATE USER (NO DUPLICATE EMAILS) ================= */
export async function POST(req) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return Response.json(
                { success: false, error: "Missing fields" },
                { status: 400 }
            );
        }

        // 🔥 CHECK DUPLICATE EMAIL
        const [existing] = await db.query(
            "SELECT id FROM users WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return Response.json(
                { success: false, error: "Email already exists" },
                { status: 409 }
            );
        }

        const hashed = await bcrypt.hash(password, 10);

        await db.query(
            `INSERT INTO users (name, email, password, role)
             VALUES (?, ?, ?, ?)`,
            [name, email, hashed, role || "editor"]
        );

        return Response.json({ success: true });

    } catch (err) {
        return Response.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}