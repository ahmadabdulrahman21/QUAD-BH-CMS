import { NextResponse } from "next/server";
import mysql from "mysql2/promise";

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// =========================================
// GET: FETCH UPLIFTS WITH IMAGE JOIN (ALL OR LIMIT)
// =========================================
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const limitParam = url.searchParams.get("limit");

    const connection = await mysql.createConnection(dbConfig);

    let rows;

    // MAX() coupled with GROUP BY deduplicates rows if a target item has multiple records in the media table
    if (limitParam !== null) {
      const limit = Number(limitParam);

      const [result] = await connection.execute(
        `SELECT 
            u.id, 
            u.title, 
            u.description, 
            u.created_at,
            MAX(m.url) AS image_url
         FROM uplifts u
         LEFT JOIN media m ON m.owner_id = u.id AND m.owner_type = 'uplift'
         GROUP BY u.id
         ORDER BY u.created_at DESC
         LIMIT ?`,
        [limit]
      );

      rows = result;
    } else {
      const [result] = await connection.execute(
        `SELECT 
            u.id, 
            u.title, 
            u.description, 
            u.created_at,
            MAX(m.url) AS image_url
         FROM uplifts u
         LEFT JOIN media m ON m.owner_id = u.id AND m.owner_type = 'uplift'
         GROUP BY u.id
         ORDER BY u.created_at DESC`
      );

      rows = result;
    }

    await connection.end();

    // Wrapped response cleanly inside a structured payload to satisfy frontend array fallbacks
    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  }
}

// =========================================
// POST: CREATE UPLIFT
// =========================================
export async function POST(req) {
  let connection;

  try {
    const { title, description } = await req.json();

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    connection = await mysql.createConnection(dbConfig);

    const [result] = await connection.execute(
      `INSERT INTO uplifts (title, description)
       VALUES (?, ?)`,
      [title, description]
    );

    return NextResponse.json({
      success: true,
      id: result.insertId,
    });

  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message },
      { status: 500 }
    );
  } finally {
    if (connection) await connection.end();
  }
}