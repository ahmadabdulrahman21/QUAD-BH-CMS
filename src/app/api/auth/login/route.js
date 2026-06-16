import { db } from "../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = "super_secret_key_123"; // MUST match middleware

export async function POST(req) {
    try {
        const { email, password } =
            await req.json();

        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );

        const user = users[0];

        if (!user) {
            return NextResponse.json({
                success: false,
                error: "Invalid credentials",
            });
        }

        const isValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isValid) {
            return NextResponse.json({
                success: false,
                error: "Invalid credentials",
            });
        }

        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET,
            { expiresIn: "1d" }
        );

        const response =
            NextResponse.json({
                success: true,
            });

        response.cookies.set("token", token, {
            httpOnly: true,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24,
        });

        return response;
    } catch (err) {
        return NextResponse.json({
            success: false,
            error: err.message,
        });
    }
}