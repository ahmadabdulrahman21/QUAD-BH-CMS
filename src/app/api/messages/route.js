import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
};

// GET all messages
export async function GET() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        const [rows] = await connection.execute(
            'SELECT id, name, email, message, created_at FROM contacts ORDER BY created_at DESC'
        );

        return NextResponse.json({
            success: true,
            data: rows,
        });

    } catch (error) {
        console.error('🔥 GET ERROR:', error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}

// POST - Create new message
export async function POST(req) {
    let connection;

    try {
        const body = await req.json();
        const { name, email, message } = body;

        console.log("📨 CONTACT FORM SUBMISSION:", { name, email });

        // Validate required fields
        const errors = [];

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            errors.push('Name is required');
        } else if (name.trim().length < 2) {
            errors.push('Name must be at least 2 characters');
        } else if (name.trim().length > 100) {
            errors.push('Name must be less than 100 characters');
        }

        if (!email || typeof email !== 'string' || email.trim().length === 0) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.push('Please provide a valid email address');
        }

        if (!message || typeof message !== 'string' || message.trim().length === 0) {
            errors.push('Message is required');
        } else if (message.trim().length < 10) {
            errors.push('Message must be at least 10 characters');
        } else if (message.trim().length > 5000) {
            errors.push('Message must be less than 5000 characters');
        }

        // Return validation errors if any
        if (errors.length > 0) {
            console.log("❌ Validation failed:", errors);
            return NextResponse.json(
                {
                    success: false,
                    message: 'Validation failed',
                    errors
                },
                { status: 400 }
            );
        }

        // Connect to database
        connection = await mysql.createConnection(dbConfig);

        // Insert the message
        const [result] = await connection.execute(
            'INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)',
            [name.trim(), email.trim().toLowerCase(), message.trim()]
        );

        console.log("✅ Message saved with ID:", result.insertId);

        return NextResponse.json(
            {
                success: true,
                message: 'Message sent successfully! We\'ll get back to you soon.',
                data: {
                    id: result.insertId,
                    name: name.trim(),
                    email: email.trim().toLowerCase(),
                    createdAt: new Date().toISOString()
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error('🔥 POST ERROR:', error);

        // Handle specific database errors
        if (error.code === 'ER_NO_SUCH_TABLE') {
            console.error("❌ Table 'contacts' not found! Please create the table first.");
            return NextResponse.json(
                {
                    success: false,
                    message: 'System error. Please try again later.',
                    errors: ['Database configuration error']
                },
                { status: 500 }
            );
        }

        if (error.code === 'ECONNREFUSED') {
            return NextResponse.json(
                {
                    success: false,
                    message: 'Unable to connect to database. Please try again later.',
                    errors: ['Database connection failed']
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to send message. Please try again later.',
                errors: ['Internal server error']
            },
            { status: 500 }
        );
    } finally {
        if (connection) {
            try {
                await connection.end();
            } catch (err) {
                console.error('Error closing connection:', err);
            }
        }
    }
}

// DELETE ALL messages
export async function DELETE() {
    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        await connection.execute('DELETE FROM contacts');

        return NextResponse.json({
            success: true,
            message: 'All messages deleted',
        });

    } catch (error) {
        console.error('🔥 DELETE ALL ERROR:', error);

        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}