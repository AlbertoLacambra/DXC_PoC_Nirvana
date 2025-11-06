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
// POST /api/agent-hub/chatmodes/[id]/session
// =====================================================
// Create new chat session for a chat mode

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { 
          error: 'Invalid chat mode ID format',
          message: 'Chat mode ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // Fetch chat mode details
    const chatModeQuery = await pool.query(
      `SELECT * FROM chat_modes WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    if (chatModeQuery.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Chat mode not found or not available',
          message: `No active chat mode found with ID: ${id}`,
          code: 'CHATMODE_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    const chatMode = chatModeQuery.rows[0];
    
    // TODO: Check user permissions against chatMode.required_roles
    
    // Extract session context
    const { context, initial_message } = body;
    
    // Create session
    const sessionQuery = await pool.query(
      `INSERT INTO sessions (
        session_type, chat_mode_id, user_id, user_email, user_roles,
        context, parameters, status, result
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, started_at`,
      [
        'chat_mode',
        id,
        'system', // TODO: Get from authenticated user
        'user@dxc.com', // TODO: Get from authenticated user
        ['developer'], // TODO: Get from authenticated user roles
        JSON.stringify(context || {}),
        JSON.stringify({ initial_message }),
        'active',
        JSON.stringify({ 
          messages: initial_message ? [
            {
              role: 'system',
              content: chatMode.system_prompt || chatMode.description,
              timestamp: new Date().toISOString(),
            },
            {
              role: 'user',
              content: initial_message,
              timestamp: new Date().toISOString(),
            },
          ] : [
            {
              role: 'system',
              content: chatMode.system_prompt || chatMode.description,
              timestamp: new Date().toISOString(),
            },
          ],
        }),
      ]
    );
    
    const sessionId = sessionQuery.rows[0].id;
    const startedAt = sessionQuery.rows[0].started_at;
    
    // Increment chat mode usage (new session)
    await pool.query(
      'SELECT increment_chat_mode_usage($1, $2)',
      [id, true] // true = new session
    );
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'chatmode.session_created',
        'chat_mode',
        id,
        chatMode.name,
        'system', // TODO: Get from authenticated user
        'user@dxc.com',
        'execute',
        JSON.stringify({ 
          session_id: sessionId,
          has_initial_message: !!initial_message,
        }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Chat session created successfully',
        session_id: sessionId,
        chat_mode: {
          id: chatMode.id,
          name: chatMode.name,
          role_category: chatMode.role_category,
          model: chatMode.model,
          temperature: chatMode.temperature,
        },
        session: {
          started_at: startedAt,
          status: 'active',
        },
        instructions: {
          send_message: `POST /api/agent-hub/chatmodes/${id}/sessions/${sessionId}/message`,
          get_history: `GET /api/agent-hub/chatmodes/sessions/${sessionId}`,
          end_session: `DELETE /api/agent-hub/chatmodes/sessions/${sessionId}`,
        },
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating chat session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create chat session', 
        message: error.message,
        code: 'CREATE_SESSION_ERROR'
      },
      { status: 500 }
    );
  }
}
