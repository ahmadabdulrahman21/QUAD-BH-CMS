import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/lib/db";

export async function POST(req) {
    try {
        const formData = await req.formData();
        
        const file = formData.get("file");
        const urlInput = formData.get("url");
        const owner_type = formData.get("owner_type");
        const owner_id = formData.get("owner_id");

        if (!owner_type || !owner_id) {
            return NextResponse.json(
                { error: "owner_type and owner_id are required" },
                { status: 400 }
            );
        }

        let url = "";
        let assetType = "image";

        // Handle FILE upload
        if (file && file.size > 0) {
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const fileName = `${uuidv4()}-${file.name.replace(/\s+/g, "_")}`;
            const uploadDir = path.join(process.cwd(), "public", "uploads");
            
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, fileName);
            fs.writeFileSync(filePath, buffer);
            url = `/uploads/${fileName}`;
            
            if (file.type?.startsWith("video/")) {
                assetType = "video";
            }
        }
        // Handle URL input
        else if (urlInput && urlInput.toString().trim()) {
            url = urlInput.toString().trim();
            assetType = url.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image";
        } else {
            return NextResponse.json(
                { error: "Provide either file or URL" },
                { status: 400 }
            );
        }

        // Save to database
        const [result] = await db.query(
            `INSERT INTO media (url, type, owner_type, owner_id, created_at) 
             VALUES (?, ?, ?, ?, NOW())`,
            [url, assetType, owner_type, owner_id]
        );

        return NextResponse.json({
            success: true,
            media: {
                id: result.insertId,
                url,
                type: assetType,
                owner_type,
                owner_id
            }
        });

    } catch (err) {
        console.error("MEDIA UPLOAD ERROR:", err);
        return NextResponse.json(
            { error: err.message },
            { status: 500 }
        );
    }
}

export async function DELETE(req) {
    try {
        const body = await req.json();
        const { url, media_id, image_url } = body;
        
        let imageUrl = url || image_url;
        
        if (!imageUrl && !media_id) {
            return NextResponse.json(
                { error: "URL, image_url, or media_id is required" },
                { status: 400 }
            );
        }

        let mediaRecord = null;

        // If media_id is provided, try to get the URL from database first
        if (media_id) {
            const [mediaRows] = await db.query(
                `SELECT * FROM media WHERE id = ?`,
                [media_id]
            );
            
            if (mediaRows.length > 0) {
                mediaRecord = mediaRows[0];
                imageUrl = mediaRecord.url;
            } else {
                // Media record not found with ID
                return NextResponse.json(
                    { error: "No media record found with the provided ID" },
                    { status: 404 }
                );
            }
        }

        // If we have a URL but no media_id, try to find by URL
        if (imageUrl && !mediaRecord) {
            const [mediaRows] = await db.query(
                `SELECT * FROM media WHERE url = ?`,
                [imageUrl]
            );
            
            if (mediaRows.length > 0) {
                mediaRecord = mediaRows[0];
            } else {
                // No media record found with URL
                return NextResponse.json(
                    { error: "No media record found with the provided URL" },
                    { status: 404 }
                );
            }
        }

        // If we have a media record, delete it from database
        if (mediaRecord) {
            // Delete from database
            await db.query(`DELETE FROM media WHERE id = ?`, [mediaRecord.id]);
            console.log(`Deleted media record ${mediaRecord.id} from database`);

            // Delete file if it's a local upload
            if (mediaRecord.url && mediaRecord.url.startsWith('/uploads/')) {
                const filePath = path.join(process.cwd(), "public", mediaRecord.url);
                try {
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log(`Deleted file: ${filePath}`);
                    } else {
                        console.log(`File not found: ${filePath}`);
                    }
                } catch (fileErr) {
                    console.error("Error deleting file:", fileErr);
                    // Continue even if file deletion fails
                }
            }

            return NextResponse.json({
                success: true,
                message: "Media deleted successfully",
                deletedMedia: mediaRecord
            });
        }

        return NextResponse.json(
            { error: "No media record found to delete" },
            { status: 404 }
        );

    } catch (err) {
        console.error("MEDIA DELETE ERROR:", err);
        return NextResponse.json(
            { error: err.message || "Failed to delete media" },
            { status: 500 }
        );
    }
}

// GET endpoint to fetch media
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const owner_type = searchParams.get('owner_type');
        const owner_id = searchParams.get('owner_id');
        
        if (owner_type && owner_id) {
            const [rows] = await db.query(
                `SELECT * FROM media WHERE owner_type = ? AND owner_id = ? ORDER BY created_at DESC`,
                [owner_type, owner_id]
            );
            return NextResponse.json({ success: true, media: rows });
        }
        
        return NextResponse.json({ success: true, media: [] });
    } catch (err) {
        console.error("MEDIA FETCH ERROR:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
