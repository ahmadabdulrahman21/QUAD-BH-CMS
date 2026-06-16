import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};
// Helper function to transform content for display
const transformContent = (content) => {
    try {
        const parsed = typeof content === 'string' ? JSON.parse(content) : content;

        // If already in the correct format (array with type property)
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0]?.type) {
            return parsed;
        }

        // If it's the details object format from your JSON
        if (parsed && parsed.details) {
            const blocks = [];

            // Add subtitle if exists
            if (parsed.details.subtitle) {
                blocks.push({
                    type: 'text',
                    value: parsed.details.subtitle
                });
            }

            // Add description if exists
            if (parsed.details.description) {
                blocks.push({
                    type: 'text',
                    value: parsed.details.description
                });
            }

            // Add gallery images if they exist
            if (parsed.details.gallery && Array.isArray(parsed.details.gallery)) {
                parsed.details.gallery.forEach(img => {
                    blocks.push({
                        type: 'image',
                        url: img.url
                    });
                });
            }

            // Add goals if they exist
            if (parsed.details.goals && Array.isArray(parsed.details.goals)) {
                parsed.details.goals.forEach(goal => {
                    blocks.push({
                        type: 'text',
                        value: `🎯 ${goal.text}`
                    });
                });
            }

            // Add achievements if they exist
            if (parsed.details.achievements && Array.isArray(parsed.details.achievements)) {
                parsed.details.achievements.forEach(achievement => {
                    blocks.push({
                        type: 'text',
                        value: `🏆 ${achievement.title}: ${achievement.description}`
                    });
                });
            }

            // Add stats if they exist
            if (parsed.details.stats && Array.isArray(parsed.details.stats)) {
                parsed.details.stats.forEach(stat => {
                    blocks.push({
                        type: 'text',
                        value: `📊 ${stat.label}: ${stat.value}`
                    });
                });
            }

            return blocks.length > 0 ? blocks : [];
        }

        // If content is a string, treat it as text
        if (typeof parsed === 'string') {
            return [{
                type: 'text',
                value: parsed
            }];
        }

        return [];
    } catch (e) {
        // If parsing fails, return empty array
        return [];
    }
};

// Helper function to validate content
const validateContent = (content) => {
    if (!Array.isArray(content)) {
        throw new Error('Content must be an array');
    }

    if (content.length === 0) {
        throw new Error('Content cannot be empty');
    }

    // Check each block has required fields
    content.forEach((block, index) => {
        if (!block.type) {
            throw new Error(`Block ${index + 1} missing 'type' field`);
        }
        if (!['text', 'image'].includes(block.type)) {
            throw new Error(`Block ${index + 1} has invalid type '${block.type}'. Must be 'text' or 'image'`);
        }
        if (block.type === 'text' && typeof block.value !== 'string') {
            throw new Error(`Block ${index + 1} (text) missing 'value' field`);
        }
        if (block.type === 'image' && typeof block.url !== 'string') {
            throw new Error(`Block ${index + 1} (image) missing 'url' field`);
        }
    });

    return true;
};

// Helper function to transform content for storage
const transformContentForStorage = (content) => {
    // Clean up empty text blocks
    const cleaned = content.filter(block => {
        if (block.type === 'text' && (!block.value || block.value.trim() === '')) {
            return false;
        }
        if (block.type === 'image' && (!block.url || block.url.trim() === '')) {
            return false;
        }
        return true;
    });

    // If all blocks were empty, return a default text block
    if (cleaned.length === 0) {
        return [{ type: 'text', value: 'New section' }];
    }

    return cleaned;
};

// GET - Fetch all items for an uplift
export async function GET(request, { params }) {
    let connection;

    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        // Get uplift details
        const [upliftRows] = await connection.execute(
            `SELECT id, title, description, created_at FROM uplifts WHERE id = ?`,
            [id]
        );

        if (!upliftRows.length) {
            return NextResponse.json(
                { success: false, message: 'Uplift not found' },
                { status: 404 }
            );
        }

        // Get items
        const [items] = await connection.execute(
            `SELECT id, content, created_at, updated_at
             FROM uplift_items 
             WHERE uplift_id = ? 
             ORDER BY created_at ASC`,
            [id]
        );

        // Transform each item's content
        const transformedItems = items.map(item => ({
            ...item,
            content: transformContent(item.content)
        }));

        // If there are no items, create a default item from uplift description
        if (transformedItems.length === 0) {
            const defaultContent = [
                {
                    type: 'text',
                    value: upliftRows[0].description || 'No description available'
                }
            ];

            transformedItems.push({
                id: `default-${Date.now()}`,
                content: defaultContent,
                created_at: upliftRows[0].created_at,
                updated_at: upliftRows[0].created_at
            });
        }

        // Try to extract details from the first item if it exists
        let details = null;
        try {
            const firstItemRaw = items[0]?.content;
            if (firstItemRaw) {
                const parsed = typeof firstItemRaw === 'string' ? JSON.parse(firstItemRaw) : firstItemRaw;
                if (parsed && parsed.details) {
                    details = parsed.details;
                }
            }
        } catch (e) {
            // Ignore parsing errors
        }

        return NextResponse.json({
            success: true,
            data: {
                uplift: {
                    id: upliftRows[0].id,
                    title: upliftRows[0].title,
                    description: upliftRows[0].description,
                    created_at: upliftRows[0].created_at,
                    details: details
                },
                items: transformedItems,
            },
        });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json(
            { success: false, message: err.message || 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}

// POST - Create a new item
export async function POST(request, { params }) {
    let connection;

    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { content } = body;

        if (!content) {
            return NextResponse.json(
                { success: false, message: 'Content is required' },
                { status: 400 }
            );
        }

        // Validate content
        try {
            validateContent(content);
        } catch (err) {
            return NextResponse.json(
                { success: false, message: err.message },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        // Check if uplift exists
        const [upliftRows] = await connection.execute(
            `SELECT id FROM uplifts WHERE id = ?`,
            [id]
        );

        if (!upliftRows.length) {
            return NextResponse.json(
                { success: false, message: 'Uplift not found' },
                { status: 404 }
            );
        }

        // Transform content for storage
        const transformedContent = transformContentForStorage(content);
        const contentJson = JSON.stringify(transformedContent);

        // Insert new item
        const [result] = await connection.execute(
            `INSERT INTO uplift_items (uplift_id, content, created_at, updated_at) 
             VALUES (?, ?, NOW(), NOW())`,
            [id, contentJson]
        );

        // Get the newly created item
        const [newItem] = await connection.execute(
            `SELECT id, content, created_at, updated_at
             FROM uplift_items 
             WHERE id = ?`,
            [result.insertId]
        );

        if (!newItem.length) {
            throw new Error('Failed to retrieve created item');
        }

        // Parse content for response
        const parsedContent = typeof newItem[0].content === 'string'
            ? JSON.parse(newItem[0].content)
            : newItem[0].content;

        return NextResponse.json({
            success: true,
            data: {
                id: newItem[0].id,
                content: parsedContent,
                created_at: newItem[0].created_at,
                updated_at: newItem[0].updated_at,
                uplift_id: id
            },
            message: 'Item created successfully'
        });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json(
            { success: false, message: err.message || 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}

// PUT - Update or Create an item (UPSERT)
export async function PUT(request, { params }) {
    let connection;

    try {
        const { id: upliftId } = await params;

        if (!upliftId) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { content, id: itemId } = body;

        if (!itemId) {
            return NextResponse.json(
                { success: false, message: 'Missing item id in request body' },
                { status: 400 }
            );
        }

        if (!content) {
            return NextResponse.json(
                { success: false, message: 'Content is required' },
                { status: 400 }
            );
        }

        // Validate content
        try {
            validateContent(content);
        } catch (err) {
            return NextResponse.json(
                { success: false, message: err.message },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        // Check if uplift exists
        const [upliftRows] = await connection.execute(
            `SELECT id FROM uplifts WHERE id = ?`,
            [upliftId]
        );

        if (!upliftRows.length) {
            return NextResponse.json(
                { success: false, message: 'Uplift not found' },
                { status: 404 }
            );
        }

        const transformedContent = transformContentForStorage(content);
        const contentJson = JSON.stringify(transformedContent);

        let resultItem;

        // Check if this is a temporary/default ID or if the item exists
        if (typeof itemId === 'string' && itemId.startsWith('default-')) {
            // It's a default item - create a new one
            const [result] = await connection.execute(
                `INSERT INTO uplift_items (uplift_id, content, created_at, updated_at) 
                 VALUES (?, ?, NOW(), NOW())`,
                [upliftId, contentJson]
            );

            const [newItem] = await connection.execute(
                `SELECT id, content, created_at, updated_at, uplift_id FROM uplift_items WHERE id = ?`,
                [result.insertId]
            );

            if (!newItem.length) {
                throw new Error('Failed to retrieve created item');
            }

            resultItem = newItem[0];
        } else {
            // Check if item exists and belongs to the uplift
            const [itemRows] = await connection.execute(
                `SELECT id, uplift_id FROM uplift_items WHERE id = ? AND uplift_id = ?`,
                [itemId, upliftId]
            );

            if (!itemRows.length) {
                // Item doesn't exist - create it
                const [result] = await connection.execute(
                    `INSERT INTO uplift_items (uplift_id, content, created_at, updated_at) 
                     VALUES (?, ?, NOW(), NOW())`,
                    [upliftId, contentJson]
                );

                const [newItem] = await connection.execute(
                    `SELECT id, content, created_at, updated_at, uplift_id FROM uplift_items WHERE id = ?`,
                    [result.insertId]
                );

                if (!newItem.length) {
                    throw new Error('Failed to retrieve created item');
                }

                resultItem = newItem[0];
            } else {
                // Item exists - update it
                await connection.execute(
                    `UPDATE uplift_items 
                     SET content = ?, updated_at = NOW() 
                     WHERE id = ? AND uplift_id = ?`,
                    [contentJson, itemId, upliftId]
                );

                const [updatedItem] = await connection.execute(
                    `SELECT id, content, created_at, updated_at, uplift_id FROM uplift_items WHERE id = ?`,
                    [itemId]
                );

                if (!updatedItem.length) {
                    throw new Error('Failed to retrieve updated item');
                }

                resultItem = updatedItem[0];
            }
        }

        // Parse content for response
        const parsedContent = typeof resultItem.content === 'string'
            ? JSON.parse(resultItem.content)
            : resultItem.content;

        return NextResponse.json({
            success: true,
            data: {
                id: resultItem.id,
                content: parsedContent,
                created_at: resultItem.created_at,
                updated_at: resultItem.updated_at,
                uplift_id: resultItem.uplift_id
            },
            message: 'Item saved successfully'
        });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json(
            { success: false, message: err.message || 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}

// DELETE - Remove an item
export async function DELETE(request, { params }) {
    let connection;

    try {
        const { id: upliftId } = await params;

        if (!upliftId) {
            return NextResponse.json(
                { success: false, message: 'Missing uplift id' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { id: itemId } = body;

        if (!itemId) {
            return NextResponse.json(
                { success: false, message: 'Missing item id in request body' },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        // Check if uplift exists
        const [upliftRows] = await connection.execute(
            `SELECT id FROM uplifts WHERE id = ?`,
            [upliftId]
        );

        if (!upliftRows.length) {
            return NextResponse.json(
                { success: false, message: 'Uplift not found' },
                { status: 404 }
            );
        }

        // Check if this is a temporary/default ID
        if (typeof itemId === 'string' && itemId.startsWith('default-')) {
            return NextResponse.json({
                success: true,
                message: 'Temporary item removed'
            });
        }

        // Check if item exists and belongs to the uplift
        const [itemRows] = await connection.execute(
            `SELECT id, uplift_id FROM uplift_items WHERE id = ? AND uplift_id = ?`,
            [itemId, upliftId]
        );

        if (!itemRows.length) {
            return NextResponse.json(
                { success: false, message: `Item not found for uplift ${upliftId}` },
                { status: 404 }
            );
        }

        // Delete item
        await connection.execute(
            `DELETE FROM uplift_items WHERE id = ? AND uplift_id = ?`,
            [itemId, upliftId]
        );

        return NextResponse.json({
            success: true,
            message: 'Item deleted successfully'
        });

    } catch (err) {
        console.error('API Error:', err);
        return NextResponse.json(
            { success: false, message: err.message || 'Internal server error' },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}