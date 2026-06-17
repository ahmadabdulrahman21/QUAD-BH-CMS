// src/app/api/messages/[id]/route.js
import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

export async function DELETE(req, { params }) {
    let connection;

    try {
        // In Next.js 15+, params might be a Promise
        const resolvedParams = await params;
        const id = resolvedParams?.id;

        console.log("DELETE REQUEST - Full params:", resolvedParams);
        console.log("DELETE REQUEST ID:", id);

        if (!id) {
            return NextResponse.json(
                { success: false, message: "Missing message ID" },
                { status: 400 }
            );
        }

        connection = await mysql.createConnection(dbConfig);

        // First check if the message exists
        const [checkResult] = await connection.execute(
            "SELECT id FROM contacts WHERE id = ?",
            [id]
        );

        if (checkResult.length === 0) {
            return NextResponse.json(
                { success: false, message: "Message not found" },
                { status: 404 }
            );
        }

        // Delete the message
        const [result] = await connection.execute(
            "DELETE FROM contacts WHERE id = ?",
            [id]
        );

        console.log("DELETE RESULT:", result);

        return NextResponse.json({
            success: true,
            message: "Message deleted successfully",
            deletedId: id
        });

    } catch (error) {
        console.error("DELETE ERROR:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to delete message",
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error("Error closing connection:", err);
            }
        }
    }
}