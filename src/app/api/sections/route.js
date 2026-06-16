import { db } from "@/lib/db";

// ==========================================
// GET: FETCH ALL SECTIONS WITH JSON CONTENT
// ==========================================
export async function GET() {
    try {
        // 1. Fetch sections + section_items + UPDATED_AT FIX
        const [rows] = await db.query(`
            SELECT 
                s.id AS section_id, 
                s.type, 
                s.\`order\`, 
                s.created_at AS section_created_at,
                s.updated_at AS section_updated_at,

                COALESCE(s.isActive, 1) AS isActive, 

                si.id AS item_id,
                si.content AS item_content,
                si.updated_at AS item_updated_at

            FROM sections s
            LEFT JOIN section_items si ON s.id = si.section_id
            ORDER BY s.\`order\` ASC
        `);

        // 2. Fetch all media
        const [mediaRows] = await db.query(`SELECT * FROM media`);

        // 3. Group sections
        const sectionsMap = rows.reduce((acc, row) => {
            if (!acc.has(row.section_id)) {

                // Parse content safely
                let parsedContent = {};
                if (row.item_content) {
                    try {
                        parsedContent =
                            typeof row.item_content === "string"
                                ? JSON.parse(row.item_content)
                                : row.item_content;
                    } catch (e) {
                        parsedContent = { raw_text: row.item_content };
                    }
                }

                // Inject optional title fallback (if exists)
                if (row.title) {
                    parsedContent.title = row.title;
                }

                acc.set(row.section_id, {
                    id: row.section_id,
                    type: row.type,
                    order: row.order,
                    isActive: row.isActive,

                    created_at: row.section_created_at,

                    // ✅ IMPORTANT FIX: use item updated_at first
                    updated_at:
                        row.item_updated_at || row.section_updated_at,

                    content: parsedContent,
                    section_item_id: row.item_id,

                    // Media linking
                    media: Array.isArray(mediaRows)
                        ? mediaRows.filter(
                            (m) =>
                                (m.owner_type === "section_item" &&
                                    m.owner_id === row.item_id) ||
                                (m.owner_type === "section" &&
                                    m.owner_id === row.section_id)
                        )
                        : [],
                });
            }

            return acc;
        }, new Map());

        return Response.json({
            success: true,
            sections: Array.from(sectionsMap.values()),
        });

    } catch (err) {
        return Response.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

export async function PATCH(req) {
    try {
        const body = await req.json();
        const { id, swapWith } = body;

        if (!id) {
            return Response.json(
                { success: false, error: "Missing id" },
                { status: 400 }
            );
        }

        // =========================
        // SWAP ORDER
        // =========================
        if (swapWith) {
            const [[current]] = await db.query(
                "SELECT `order` FROM sections WHERE id = ?",
                [id]
            );

            const [[target]] = await db.query(
                "SELECT `order` FROM sections WHERE id = ?",
                [swapWith]
            );

            if (!current || !target) {
                return Response.json(
                    { success: false, error: "Section not found" },
                    { status: 404 }
                );
            }

            await db.query(
                "UPDATE sections SET `order` = ? WHERE id = ?",
                [target.order, id]
            );

            await db.query(
                "UPDATE sections SET `order` = ? WHERE id = ?",
                [current.order, swapWith]
            );

            return Response.json({
                success: true,
                message: "Order swapped successfully",
            });
        }

        return Response.json(
            { success: false, error: "No action provided" },
            { status: 400 }
        );

    } catch (err) {
        return Response.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}