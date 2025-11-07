import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import path from 'path';

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
// GET /api/agent-hub/instructions/[id]
// =====================================================
// Get instruction details by ID

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
          error: 'Invalid instruction ID format',
          message: 'Instruction ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    const query = `
      SELECT 
        id, name, slug, description, file_path, content,
        technology, technology_version, apply_to,
        tags, related_technologies,
        author, source_url,
        apply_count, last_applied_at,
        required_roles, is_active,
        created_at, updated_at, created_by, updated_by
      FROM instructions
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Instruction not found',
          message: `No instruction found with ID: ${id}`,
          code: 'INSTRUCTION_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Load content from file if not cached
    let instruction = result.rows[0];
    if (!instruction.content) {
      try {
        const filePath = path.join(process.cwd(), '..', '..', instruction.file_path);
        instruction.content = await readFile(filePath, 'utf-8');
        
        // Cache in database
        await pool.query(
          'UPDATE instructions SET content = $1 WHERE id = $2',
          [instruction.content, id]
        );
      } catch (fileError) {
        console.error('Error loading instruction file:', fileError);
      }
    }
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'instruction.viewed',
        'instruction',
        id,
        instruction.name,
        'system', // TODO: Get from authenticated user
        'user@dxc.com',
        'read',
      ]
    );
    
    return NextResponse.json({
      data: instruction,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching instruction:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch instruction', 
        message: error.message,
        code: 'FETCH_INSTRUCTION_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/agent-hub/instructions/[id]
// =====================================================
// Update instruction (admin only)

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
        { error: 'Invalid instruction ID format', code: 'INVALID_ID' },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication middleware
    
    // Check existence
    const existing = await pool.query(
      'SELECT * FROM instructions WHERE id = $1',
      [id]
    );
    
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Instruction not found', code: 'INSTRUCTION_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // Build dynamic UPDATE
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = [
      'name', 'slug', 'description', 'file_path', 'content',
      'technology', 'technology_version', 'apply_to',
      'tags', 'related_technologies', 'author', 'source_url',
      'required_roles', 'is_active'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No fields to update', code: 'VALIDATION_ERROR' },
        { status: 400 }
      );
    }
    
    updateFields.push(`updated_by = $${paramIndex++}`);
    values.push('system'); // TODO: Get from authenticated user
    values.push(id);
    
    const query = `
      UPDATE instructions
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, old_values, new_values
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'instruction.updated',
        'instruction',
        id,
        result.rows[0].name,
        'system',
        'admin@dxc.com',
        'update',
        JSON.stringify(existing.rows[0]),
        JSON.stringify(result.rows[0]),
      ]
    );
    
    return NextResponse.json(
      { message: 'Instruction updated successfully', data: result.rows[0] },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error updating instruction:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Duplicate value', code: 'DUPLICATE_INSTRUCTION' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update instruction', message: error.message, code: 'UPDATE_ERROR' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/agent-hub/instructions/[id]
// =====================================================
// Soft delete instruction (admin only)

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
        { error: 'Invalid instruction ID format', code: 'INVALID_ID' },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication middleware
    
    // Check existence
    const existing = await pool.query(
      'SELECT * FROM instructions WHERE id = $1',
      [id]
    );
    
    if (existing.rows.length === 0) {
      return NextResponse.json(
        { error: 'Instruction not found', code: 'INSTRUCTION_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // Soft delete
    const query = `
      UPDATE instructions
      SET is_active = false, updated_by = $1
      WHERE id = $2
      RETURNING id, name, slug, is_active
    `;
    
    const result = await pool.query(query, ['system', id]);
    
    // Audit log
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'instruction.deleted',
        'instruction',
        id,
        existing.rows[0].name,
        'system',
        'admin@dxc.com',
        'delete',
        JSON.stringify({ soft_delete: true }),
      ]
    );
    
    return NextResponse.json(
      { message: 'Instruction deleted successfully (soft delete)', data: result.rows[0] },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error deleting instruction:', error);
    return NextResponse.json(
      { error: 'Failed to delete instruction', message: error.message, code: 'DELETE_ERROR' },
      { status: 500 }
    );
  }
}
