import { db } from "@/lib/db";

/* =========================================================
    GET: FETCH LATEST SECTION CONTENT + MEDIA + STATUS
========================================================= */
export async function GET(request, { params }) {
    try {
        const resolvedParams = await params;
        const type = resolvedParams?.type;

        if (!type) {
            return Response.json(
                { success: false, message: "Missing type parameter" },
                { status: 400 }
            );
        }

        // 1. Fetch master section
        const [sections] = await db.query(
            "SELECT id, type, `order` FROM sections WHERE type = ? LIMIT 1",
            [type]
        );

        if (!sections.length) {
            return Response.json(
                { success: false, message: `Section '${type}' not found.` },
                { status: 404 }
            );
        }

        const sectionId = sections[0].id;

        let content = {};
        let isActive = true;
        let itemId = null;
        let updatedAt = null;

        // 2. Fetch latest section_item (NOW includes updated_at)
        const [itemRows] = await db.query(
            `SELECT id, content, updated_at 
             FROM section_items 
             WHERE section_id = ? 
             ORDER BY id DESC 
             LIMIT 1`,
            [sectionId]
        );

        if (itemRows.length > 0) {
            const row = itemRows[0];

            itemId = row.id;
            updatedAt = row.updated_at;

            if (row.content) {
                try {
                    const parsed =
                        typeof row.content === "string"
                            ? JSON.parse(row.content)
                            : row.content;

                    content = typeof parsed === "string" ? JSON.parse(parsed) : parsed;
                } catch {
                    content = {};
                }
            }

            isActive = content.hasOwnProperty("isActive")
                ? Boolean(content.isActive)
                : true;

            delete content.isActive;
        }

        // 3. MEDIA LAYER
        let mediaRows = [];

        if (type === "hero") {
            const [rows] = await db.query(
                `SELECT id, url, type, owner_type, owner_id FROM media 
                 WHERE (owner_type = 'section' AND owner_id = ?) 
                    OR (owner_type = 'section_item' AND owner_id = ?)
                    OR (owner_type = 'section_item' AND owner_id = '0')
                    OR (owner_type = 'section_item' AND owner_id LIKE ?)
                 ORDER BY id ASC`,
                [String(sectionId), String(itemId), `hero-%`]
            );
            mediaRows = rows;
        } else {
            if (itemId) {
                const [rows] = await db.query(
                    `SELECT id, url, type, owner_type, owner_id FROM media 
                     WHERE (owner_type = 'section' AND owner_id = ?) 
                        OR (owner_type = 'section_item' AND owner_id = ?)
                        OR (owner_type = 'section_item' AND owner_id = '0')
                     ORDER BY id ASC`,
                    [String(sectionId), String(itemId)]
                );
                mediaRows = rows;
            }
        }

        // 4. RESPONSE
        return Response.json({
            success: true,
            section: {
                id: sectionId,
                type: sections[0].type,
                order: sections[0].order,
                isActive,
                sectionItemId: itemId,

                // ✅ ADDED FIELD
                updatedAt,

                content,
                media: mediaRows || []
            }
        });

    } catch (err) {
        console.error("GET API ERROR:", err);
        return Response.json(
            { success: false, error: err.message },
            { status: 500 }
        );
    }
}

/* =========================================================
    PUT: UPDATE SECTION CONTENT
========================================================= */
export async function PUT(request, { params }) {
    try {
        const resolvedParams = await params;
        const type = resolvedParams?.type;

        if (!type) {
            return Response.json(
                { success: false, message: "Missing type parameter" },
                { status: 400 }
            );
        }

        let body;
        try {
            body = await request.json();
        } catch {
            return Response.json(
                { success: false, message: "Invalid or empty JSON payload sent." },
                { status: 400 }
            );
        }

        const { content, media, isActive } = body;

        // Fetch section
        const [sections] = await db.query(
            "SELECT id FROM sections WHERE type = ? LIMIT 1",
            [type]
        );

        if (!sections.length) {
            return Response.json(
                { success: false, message: `Section '${type}' not found.` },
                { status: 404 }
            );
        }

        const sectionId = sections[0].id;

        let finalizedContent = { ...(content || {}) };

        // Brands normalization
        if (type === "brands" && Array.isArray(content?.brandItem)) {
            finalizedContent.brandItem = content.brandItem.map((brand) => ({
                name: String(brand.name || "").trim(),
                nameColor: String(brand.nameColor || "").trim(),
                nameBackgroundColor: String(brand.nameBackgroundColor || "").trim(),
                title: String(brand.title || "").trim(),
                titleColor: String(brand.titleColor || "").trim(),
                description: String(brand.description || "").trim(),
                descriptionColor: String(brand.descriptionColor || "").trim(),
                buttonText: String(brand.buttonText || "").trim(),
                buttonColor: String(brand.buttonColor || "").trim(),// optional UI extras
                image: String(brand.image || "").trim(),
                link: String(brand.link || "").trim(),

            }));
        }

        // Qoworking normalization
        if (type === "qoworking" && Array.isArray(content?.qoworking)) {
            finalizedContent.qoworking = content.qoworking.map((space) => ({
                title: String(space.title || "").trim(),
                subtitle: String(space.subtitle || "").trim(),
                description: String(space.description || "").trim(),
                capacity: String(space.capacity || "").trim(),
                price: String(space.price || "").trim(),
                image: String(space.image || "").trim(),
            }));
        }

        finalizedContent.isActive = isActive ?? true;

        const contentString = JSON.stringify(finalizedContent);

        // Find existing item
        const [existingItems] = await db.query(
            "SELECT id FROM section_items WHERE section_id = ? ORDER BY id DESC LIMIT 1",
            [sectionId]
        );

        let itemId;

        if (existingItems.length > 0) {
            itemId = existingItems[0].id;

            await db.query(
                "UPDATE section_items SET content = ? WHERE id = ?",
                [contentString, itemId]
            );
        } else {
            const [insertResult] = await db.query(
                "INSERT INTO section_items (section_id, content) VALUES (?, ?)",
                [sectionId, contentString]
            );

            itemId = insertResult.insertId;
        }

        // MEDIA handling
        const isInlineMediaSection = ["brands", "qoworking"].includes(type);

        if (!isInlineMediaSection && Array.isArray(media)) {
            const currentUrls = media.map((m) => m.url).filter(Boolean);

            if (currentUrls.length > 0) {
                await db.query(
                    `DELETE FROM media 
                     WHERE owner_type = 'section_item' 
                     AND (owner_id = ? OR owner_id = 0) 
                     AND url NOT IN (?)`,
                    [String(itemId), currentUrls]
                );
            } else {
                await db.query(
                    `DELETE FROM media 
                     WHERE owner_type = 'section_item' 
                     AND owner_id = ?`,
                    [String(itemId)]
                );
            }

            await db.query(
                `UPDATE media 
                 SET owner_id = ? 
                 WHERE owner_type = 'section_item' 
                 AND owner_id = '0'`,
                [String(itemId)]
            );
        }

        return Response.json({
            success: true,
            message: `Section ${type} updated successfully.`,
            itemId
        });

    } catch (err) {
        console.error("PUT API ERROR:", err);
        return Response.json(
            { success: false, message: err.message },
            { status: 500 }
        );
    }
}