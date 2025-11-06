import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// =====================================================
// PostgreSQL Connection Pool
// =====================================================

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE || 'nirvana',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// =====================================================
// GET /api/agent-hub/chatmodes/sessions/[sessionId]
// =====================================================
// Get session history and details

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { 
          error: 'Invalid session ID format',
          message: 'Session ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // Fetch session details
    const sessionQuery = await pool.query(
      `SELECT 
        s.*,
        cm.name as chat_mode_name,
        cm.model as chat_mode_model,
        cm.temperature as chat_mode_temperature
      FROM sessions s
      LEFT JOIN chat_modes cm ON s.chat_mode_id = cm.id
      WHERE s.id = $1 AND s.session_type = 'chat_mode'`,
      [sessionId]
    );
    
    if (sessionQuery.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Session not found',
          message: `No chat mode session found with ID: ${sessionId}`,
          code: 'SESSION_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    const session = sessionQuery.rows[0];
    
    // TODO: Verify user has access to this session
    
    // Parse messages from result
    const messages = session.result?.messages || [];
    
    return NextResponse.json({
      session_id: session.id,
      chat_mode: {
        id: session.chat_mode_id,
        name: session.chat_mode_name,
        model: session.chat_mode_model,
        temperature: session.chat_mode_temperature,
      },
      status: session.status,
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_seconds: session.duration_seconds,
      message_count: messages.length,
      messages: messages,
      context: session.context,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch session', 
        message: error.message,
        code: 'FETCH_SESSION_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/agent-hub/chatmodes/sessions/[sessionId]
// =====================================================
// End chat session

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format', code: 'INVALID_ID' },
        { status: 400 }
      );
    }
    
    // Check session exists and is active
    const existing = await pool.query(
      `SELECT * FROM sessions WHERE id = $1 AND session_type = 'chat_mode'`,
      [sessionId]
    );
    
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Session not found', code: 'SESSION_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    if (existing.rows[0].status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Session already ended',
          message: `Session status is: ${existing.rows[0].status}`,
          code: 'SESSION_ALREADY_ENDED'
        },
        { status: 400 }
      );
    }
    
    // TODO: Verify user owns this session
    
    // End session
    const endedAt = new Date();
    const startedAt = new Date(existing.rows[0].started_at);
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000);
    
    const query = `
      UPDATE sessions
      SET status = 'completed', ended_at = $1, duration_seconds = $2
      WHERE id = $3
      RETURNING id, status, started_at, ended_at, duration_seconds
    `;
    
    const result = await pool.query(query, [endedAt, durationSeconds, sessionId]);
    
    return NextResponse.json(
      {
        message: 'Session ended successfully',
        session: result.rows[0],
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error ending session:', error);
    return NextResponse.json(
      { error: 'Failed to end session', message: error.message, code: 'END_SESSION_ERROR' },
      { status: 500 }
    );
  }
}
