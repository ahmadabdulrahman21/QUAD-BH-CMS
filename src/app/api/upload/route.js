export const runtime = "nodejs";

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { Buffer } from "buffer";
import { db } from "@/lib/db";

/* =========================================================
   POST: UPLOAD FILE OR EXTERNAL URL
========================================================= */
export async function POST(req) {
    try {
        const formData = await req.formData();

        const file = formData.get("file");
        const urlInput = formData.get("url");
        const sectionItemId = formData.get("sectionItemId");

        if (!sectionItemId) {
            return NextResponse.json(
                { error: "sectionItemId is required" },
                { status: 400 }
            );
        }

        let url = null;

        /* ================= FILE UPLOAD ================= */
        if (file && typeof file.arrayBuffer === "function") {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const fileName = `${uuidv4()}-${file.name}`;
            const uploadDir = path.join(process.cwd(), "public/uploads");

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);

            url = `/uploads/${fileName}`;
        }

        /* ================= EXTERNAL URL ================= */
        else if (urlInput && typeof urlInput === "string") {
            url = urlInput.trim();
        }

        else {
            return NextResponse.json(
                { error: "No file or URL provided" },
                { status: 400 }
            );
        }

        /* ================= SAVE DB ================= */
        const [result] = await db.query(
            `INSERT INTO media (url, type, section_item_id, created_at, brand_item_id)
             VALUES (?, 'image', ?, NOW(), ?)`,
            [url, sectionItemId, null]
        );

        return NextResponse.json({
            success: true,
            media: {
                id: result.insertId,
                url,
                type: "image",
                section_item_id: Number(sectionItemId),
            },
        });

    } catch (err) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

/* =========================================================
   DELETE: REMOVE FROM DB + LOCAL FILE
========================================================= */
export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json(
                { error: "Media ID required" },
                { status: 400 }
            );
        }

        const [rows] = await db.query(
            "SELECT url FROM media WHERE id = ?",
            [id]
        );

        if (!rows.length) {
            return NextResponse.json(
                { error: "Media not found" },
                { status: 404 }
            );
        }

        const fileUrl = rows[0].url;

        /* ================= DELETE FILE ================= */
        if (fileUrl.startsWith("/uploads/")) {
            const filePath = path.join(process.cwd(), "public", fileUrl);

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        /* ================= DELETE DB ================= */
        await db.query(
            "DELETE FROM media WHERE id = ?",
            [id]
        );

        return NextResponse.json({
            success: true,
            message: "Media deleted successfully",
        });

    } catch (err) {
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}