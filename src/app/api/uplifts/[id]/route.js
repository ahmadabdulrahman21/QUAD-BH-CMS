import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import fs from 'fs/promises';
import path from 'path';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// =========================
// GET SINGLE UPLIFT
// =========================
export async function GET(request, { params }) {
    let connection;

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            `SELECT 
                u.id, 
                u.title, 
                u.description, 
                MAX(m.id) AS media_id,
                MAX(m.url) AS image_url
             FROM uplifts u
             LEFT JOIN media m ON m.owner_id = u.id AND m.owner_type = 'uplift'
             WHERE u.id = ? 
             GROUP BY u.id
             LIMIT 1`,
            [id]
        );

        if (!rows.length) {
            return NextResponse.json(
                { success: false, message: 'Uplift not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: rows[0],
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}

// =========================
// UPDATE UPLIFT
// =========================
export async function PUT(request, { params }) {
    let connection;

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const title = body?.title ?? null;
        const description = body?.description ?? null;
        const media_id = body?.media_id;

        connection = await mysql.createConnection(dbConfig);

        await connection.execute(
            `UPDATE uplifts 
             SET title = ?, description = ?, updated_at = NOW()
             WHERE id = ?`,
            [title, description, id]
        );

        if (media_id === null) {
            await connection.execute(
                `DELETE FROM media WHERE owner_id = ? AND owner_type = 'uplift'`,
                [id]
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Uplift updated successfully',
        });

    } catch (error) {
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}

// ========================================================
// DELETE UPLIFT (WITH ROOT FILE SYSTEM UNLINK PARSING)
// ========================================================
// ========================================================
// DELETE UPLIFT (WITH ALL RELATED DATA - FIXED)
// ========================================================
export async function DELETE(request, { params }) {
    let connection;

    try {
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);
        await connection.beginTransaction();

        // 1. Get all uplift_items IDs to delete their media too
        const [upliftItems] = await connection.execute(
            `SELECT id FROM uplift_items WHERE uplift_id = ?`,
            [id]
        );

        const itemIds = upliftItems.map(item => item.id);

        // 2. Delete media for uplift_items if they exist
        if (itemIds.length > 0) {
            // Fetch media for all uplift_items
            const placeholders = itemIds.map(() => '?').join(',');
            const [itemMediaFiles] = await connection.execute(
                `SELECT url FROM media WHERE owner_id IN (${placeholders}) AND owner_type = 'uplift_item'`,
                itemIds
            );

            // Delete physical media files for uplift_items
            for (const media of itemMediaFiles) {
                if (media.url) {
                    try {
                        const cleanPath = media.url.split('?')[0];
                        const absoluteFilePath = path.join(process.cwd(), 'public', cleanPath);
                        await fs.access(absoluteFilePath);
                        await fs.unlink(absoluteFilePath);
                    } catch (fsErr) {
                        console.warn(`File system cleanup skipped for: ${media.url}`, fsErr.message);
                    }
                }
            }

            // Delete media records for uplift_items
            await connection.execute(
                `DELETE FROM media WHERE owner_id IN (${placeholders}) AND owner_type = 'uplift_item'`,
                itemIds
            );
        }

        // 3. Fetch and delete media for the main uplift
        const [mediaFiles] = await connection.execute(
            `SELECT url FROM media WHERE owner_id = ? AND owner_type = 'uplift'`,
            [id]
        );

        // Delete physical media files for main uplift
        for (const media of mediaFiles) {
            if (media.url) {
                try {
                    const cleanPath = media.url.split('?')[0];
                    const absoluteFilePath = path.join(process.cwd(), 'public', cleanPath);
                    await fs.access(absoluteFilePath);
                    await fs.unlink(absoluteFilePath);
                } catch (fsErr) {
                    console.warn(`File system cleanup skipped for: ${media.url}`, fsErr.message);
                }
            }
        }

        // 4. Delete media records for main uplift
        await connection.execute(
            `DELETE FROM media WHERE owner_id = ? AND owner_type = 'uplift'`,
            [id]
        );

        // 5. Delete uplift_items records
        await connection.execute(
            `DELETE FROM uplift_items WHERE uplift_id = ?`,
            [id]
        );

        // 6. Finally, delete the uplift record
        const [result] = await connection.execute(
            `DELETE FROM uplifts WHERE id = ?`,
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error('Uplift not found');
        }

        await connection.commit();

        return NextResponse.json({
            success: true,
            message: `Uplift and ${itemIds.length} associated item(s) successfully deleted.`,
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }

        console.error('Delete error:', error);

        return NextResponse.json(
            { success: false, message: error.message || 'Failed to delete uplift' },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}