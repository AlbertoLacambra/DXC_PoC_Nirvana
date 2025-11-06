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
// GET /api/agent-hub/prompts/[id]
// =====================================================
// Get prompt details by ID

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
          error: 'Invalid prompt ID format',
          message: 'Prompt ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    const query = `
      SELECT 
        id, name, slug, description, file_path, content, template,
        mode, tools, variables, tags, category, use_case,
        author, source_url, usage_count, last_used_at,
        required_roles, is_active, created_at, updated_at,
        created_by, updated_by
      FROM prompts
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Prompt not found',
          message: `No prompt found with ID: ${id}`,
          code: 'PROMPT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        'prompt.viewed',
        'prompt',
        id,
        result.rows[0].name,
        'system', // TODO: Get from authenticated user
        'user@dxc.com',
        'read',
      ]
    );
    
    return NextResponse.json({
      data: result.rows[0],
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prompt', 
        message: error.message,
        code: 'FETCH_PROMPT_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT /api/agent-hub/prompts/[id]
// =====================================================
// Update prompt (admin only)

export async function PUT(
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
          error: 'Invalid prompt ID format',
          message: 'Prompt ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication middleware to verify admin role
    
    // Check if prompt exists
    const existingPrompt = await pool.query(
      'SELECT * FROM prompts WHERE id = $1',
      [id]
    );
    
    if (existingPrompt.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Prompt not found',
          message: `No prompt found with ID: ${id}`,
          code: 'PROMPT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Build dynamic UPDATE query
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    const allowedFields = [
      'name', 'slug', 'description', 'file_path', 'content', 'template',
      'mode', 'tools', 'variables', 'tags', 'category', 'use_case',
      'author', 'source_url', 'required_roles', 'is_active'
    ];
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateFields.push(`${field} = $${paramIndex++}`);
        
        // Handle JSON fields
        if (['tools', 'variables'].includes(field)) {
          values.push(JSON.stringify(body[field]));
        } else {
          values.push(body[field]);
        }
      }
    }
    
    if (updateFields.length === 0) {
      return NextResponse.json(
        { 
          error: 'No fields to update',
          message: 'Request body must contain at least one field to update',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Add updated_by field
    updateFields.push(`updated_by = $${paramIndex++}`);
    values.push('system'); // TODO: Get from authenticated user
    
    // Add ID to values
    values.push(id);
    
    const query = `
      UPDATE prompts
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, old_values, new_values
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        'prompt.updated',
        'prompt',
        id,
        result.rows[0].name,
        'system', // TODO: Get from authenticated user
        'admin@dxc.com',
        'update',
        JSON.stringify(existingPrompt.rows[0]),
        JSON.stringify(result.rows[0]),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Prompt updated successfully',
        data: result.rows[0],
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { 
          error: 'Duplicate value',
          message: 'A prompt with this name or slug already exists',
          code: 'DUPLICATE_PROMPT'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update prompt', 
        message: error.message,
        code: 'UPDATE_PROMPT_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE /api/agent-hub/prompts/[id]
// =====================================================
// Soft delete prompt (admin only)

export async function DELETE(
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
          error: 'Invalid prompt ID format',
          message: 'Prompt ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // TODO: Add authentication middleware to verify admin role
    
    // Check if prompt exists
    const existingPrompt = await pool.query(
      'SELECT * FROM prompts WHERE id = $1',
      [id]
    );
    
    if (existingPrompt.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Prompt not found',
          message: `No prompt found with ID: ${id}`,
          code: 'PROMPT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Soft delete
    const query = `
      UPDATE prompts
      SET is_active = false, updated_by = $1
      WHERE id = $2
      RETURNING id, name, slug, is_active
    `;
    
    const result = await pool.query(query, [
      'system', // TODO: Get from authenticated user
      id,
    ]);
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'prompt.deleted',
        'prompt',
        id,
        existingPrompt.rows[0].name,
        'system', // TODO: Get from authenticated user
        'admin@dxc.com',
        'delete',
        JSON.stringify({ soft_delete: true }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Prompt deleted successfully (soft delete)',
        data: result.rows[0],
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error deleting prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete prompt', 
        message: error.message,
        code: 'DELETE_PROMPT_ERROR'
      },
      { status: 500 }
    );
  }
}
