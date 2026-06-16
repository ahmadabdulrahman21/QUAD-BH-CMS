import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Total sections
        const [sectionsResult] = await db.query(`
            SELECT COUNT(*) AS count
            FROM sections
        `);

        // Last edited section based on section_items.updated_at
        const [recentResult] = await db.query(`
            SELECT
                s.id,
                s.type,
                si.updated_at
            FROM section_items si
            INNER JOIN sections s
                ON s.id = si.section_id
            ORDER BY si.updated_at DESC
            LIMIT 1
        `);

        return NextResponse.json({
            sections: sectionsResult[0]?.count || 0,
            recent: recentResult[0] || null,
        });

    } catch (err) {
        console.error('Admin stats error:', err);

        return NextResponse.json(
            {
                sections: 0,
                recent: null,
                error: err.message,
            },
            { status: 500 }
        );
    }
}