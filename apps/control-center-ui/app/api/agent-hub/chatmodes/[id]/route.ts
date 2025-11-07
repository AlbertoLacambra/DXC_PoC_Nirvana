import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// =====================================================
// PostgreSQL Connection Pool
// =====================================================

const pool = new Pool({
  host: process.env.AGENT_HUB_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.AGENT_HUB_DB_PORT || process.env.POSTGRES_PORT || '5432'),
  database: process.env.AGENT_HUB_DB_NAME || 'nirvana_agent_hub',
  user: process.env.AGENT_HUB_DB_USER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.AGENT_HUB_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// =====================================================
// GET /api/agent-hub/chatmodes/[id]
// =====================================================
// Get chat mode details by ID

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
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
    
    const query = `
      SELECT * FROM chat_modes
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Chat mode not found',
          message: `No chat mode found with ID: ${id}`,
          code: 'CHATMODE_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0], { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching chat mode:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat mode', 
        message: error.message,
        code: 'FETCH_CHATMODE_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/agent-hub/chatmodes/[id]
// =====================================================
// Update chat mode

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid chat mode ID format', code: 'INVALID_ID' },
        { status: 400 }
      );
    }
    
    // Check chat mode exists
    const existing = await pool.query('SELECT * FROM chat_modes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Chat mode not found', code: 'CHATMODE_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // TODO: Verify user has admin permissions
    
    // Build dynamic update query
    const allowedFields = [
      'name', 'description', 'slug', 'role_category', 'expertise_areas',
      'system_prompt', 'model', 'temperature', 'max_tokens', 'top_p',
      'frequency_penalty', 'presence_penalty', 'tags', 'is_active',
      'is_approved', 'approval_notes', 'required_roles',
    ];
    
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramCount}`);
        values.push(body[field]);
        paramCount++;
      }
    }
    
    if (updates.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }
    
    // Add ID as last parameter
    values.push(id);
    
    const query = `
      UPDATE chat_modes
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    // Audit log
    const userId = 'system'; // TODO: Get from authenticated user
    await pool.query(
      `INSERT INTO audit_logs (event_type, entity_type, entity_id, user_id, action, old_values, new_values)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'chatmode.updated',
        'chat_mode',
        id,
        userId,
        'update',
        JSON.stringify(existing.rows[0]),
        JSON.stringify(result.rows[0]),
      ]
    );
    
    return NextResponse.json(result.rows[0], { status: 200 });
    
  } catch (error: any) {
    console.error('Error updating chat mode:', error);
    return NextResponse.json(
      { error: 'Failed to update chat mode', message: error.message, code: 'UPDATE_CHATMODE_ERROR' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/agent-hub/chatmodes/[id]
// =====================================================
// Soft delete chat mode

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid chat mode ID format', code: 'INVALID_ID' },
        { status: 400 }
      );
    }
    
    // Check chat mode exists
    const existing = await pool.query('SELECT * FROM chat_modes WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Chat mode not found', code: 'CHATMODE_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // TODO: Verify user has admin permissions
    
    // Soft delete
    const query = `
      UPDATE chat_modes
      SET is_active = false
      WHERE id = $1
      RETURNING id, name, is_active
    `;
    
    const result = await pool.query(query, [id]);
    
    // Audit log
    const userId = 'system'; // TODO: Get from authenticated user
    await pool.query(
      `INSERT INTO audit_logs (event_type, entity_type, entity_id, user_id, action, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'chatmode.deleted',
        'chat_mode',
        id,
        userId,
        'soft_delete',
        JSON.stringify({ name: existing.rows[0].name }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Chat mode deactivated successfully',
        chat_mode: result.rows[0],
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error deleting chat mode:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat mode', message: error.message, code: 'DELETE_CHATMODE_ERROR' },
      { status: 500 }
    );
  }
}
