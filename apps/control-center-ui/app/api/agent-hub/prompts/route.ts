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
// GET /api/agent-hub/prompts
// =====================================================
// List prompts with filters and pagination

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const category = searchParams.get('category'); // 'documentation', 'optimization', 'testing', etc.
    const mode = searchParams.get('mode'); // 'chat', 'edit', 'workspace'
    const tags = searchParams.get('tags')?.split(',');
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive') !== 'false';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'name';
    const sortOrder = searchParams.get('sortOrder') || 'asc';
    
    // Build WHERE clause
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (isActive) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(true);
    }
    
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    
    if (mode) {
      conditions.push(`mode = $${paramIndex++}`);
      values.push(mode);
    }
    
    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`);
      values.push(tags);
    }
    
    if (search) {
      conditions.push(`(
        name ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        use_case ILIKE $${paramIndex} OR
        $${paramIndex} = ANY(tags)
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Validate sortBy
    const validSortFields = ['name', 'created_at', 'usage_count', 'updated_at', 'category'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM prompts ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Fetch data
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        id, name, slug, description, file_path, mode,
        tools, variables, tags, category, use_case,
        author, source_url, usage_count, last_used_at,
        required_roles, is_active, created_at, updated_at
      FROM prompts
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
    
    return NextResponse.json({
      data: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: { category, mode, tags, search, isActive },
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch prompts', 
        message: error.message,
        code: 'FETCH_PROMPTS_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/agent-hub/prompts
// =====================================================
// Create new prompt (admin only)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    
    // Validate required fields
    const { name, slug, description, file_path, content, template } = body;
    
    if (!name || !slug || !description || !file_path || !content) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['name', 'slug', 'description', 'file_path', 'content'],
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json(
        { 
          error: 'Invalid slug format',
          message: 'Slug must contain only lowercase letters, numbers, and hyphens',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Validate mode if provided
    const validModes = ['chat', 'edit', 'workspace'];
    if (body.mode && !validModes.includes(body.mode)) {
      return NextResponse.json(
        { 
          error: 'Invalid mode',
          message: `Mode must be one of: ${validModes.join(', ')}`,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Insert prompt
    const query = `
      INSERT INTO prompts (
        name, slug, description, file_path, content, template,
        mode, tools, variables, tags, category, use_case,
        author, source_url, required_roles, is_active, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10, $11, $12,
        $13, $14, $15, $16, $17
      )
      RETURNING *
    `;
    
    const values = [
      name, slug, description, file_path, content, template || null,
      body.mode || null,
      JSON.stringify(body.tools || []),
      JSON.stringify(body.variables || []),
      body.tags || [],
      body.category || null,
      body.use_case || null,
      body.author || null,
      body.source_url || null,
      body.required_roles || ['developer'],
      body.is_active !== undefined ? body.is_active : true,
      'system', // TODO: Get from authenticated user
    ];
    
    const result = await pool.query(query, values);
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'prompt.created',
        'prompt',
        result.rows[0].id,
        name,
        'system', // TODO: Get from authenticated user
        'admin@dxc.com',
        'create',
        JSON.stringify({ category: body.category, mode: body.mode }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Prompt created successfully',
        data: result.rows[0],
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating prompt:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { 
          error: 'Prompt already exists',
          message: 'A prompt with this name or slug already exists',
          code: 'DUPLICATE_PROMPT'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create prompt', 
        message: error.message,
        code: 'CREATE_PROMPT_ERROR'
      },
      { status: 500 }
    );
  }
}
