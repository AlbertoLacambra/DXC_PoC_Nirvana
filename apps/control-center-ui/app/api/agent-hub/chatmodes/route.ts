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
// GET /api/agent-hub/chatmodes
// =====================================================
// List chat modes with filters and pagination

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const roleCategory = searchParams.get('roleCategory'); // 'architect', 'developer', 'dba', 'devops', 'security'
    const expertiseAreas = searchParams.get('expertiseAreas')?.split(',');
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
    
    if (roleCategory) {
      conditions.push(`role_category = $${paramIndex++}`);
      values.push(roleCategory);
    }
    
    if (expertiseAreas && expertiseAreas.length > 0) {
      conditions.push(`expertise_areas && $${paramIndex++}`);
      values.push(expertiseAreas);
    }
    
    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`);
      values.push(tags);
    }
    
    if (search) {
      conditions.push(`(
        name ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR
        role_category ILIKE $${paramIndex} OR
        $${paramIndex} = ANY(tags) OR
        $${paramIndex} = ANY(expertise_areas)
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Validate sortBy
    const validSortFields = ['name', 'role_category', 'created_at', 'session_count', 'message_count', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Count total
    const countQuery = `SELECT COUNT(*) as total FROM chat_modes ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Fetch data
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        id, name, slug, description, file_path,
        model, temperature, tools,
        role_category, expertise_areas, tags,
        author, source_url,
        session_count, message_count, last_used_at,
        required_roles, is_active,
        created_at, updated_at
      FROM chat_modes
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
    
    // Group by role category for faceted search
    const categoriesQuery = `
      SELECT role_category, COUNT(*) as count
      FROM chat_modes
      WHERE is_active = true
      GROUP BY role_category
      ORDER BY count DESC
    `;
    const categoriesResult = await pool.query(categoriesQuery);
    
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
      filters: {
        roleCategory,
        expertiseAreas,
        tags,
        search,
        isActive,
      },
      facets: {
        role_categories: categoriesResult.rows,
      },
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching chat modes:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch chat modes', 
        message: error.message,
        code: 'FETCH_CHATMODES_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/agent-hub/chatmodes
// =====================================================
// Create new chat mode (admin only)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    
    // Validate required fields
    const { name, slug, description, file_path, content } = body;
    
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
    
    // Insert chat mode
    const query = `
      INSERT INTO chat_modes (
        name, slug, description, file_path, content, system_prompt,
        model, temperature, tools,
        role_category, expertise_areas, tags,
        author, source_url, required_roles, is_active, created_by
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9,
        $10, $11, $12,
        $13, $14, $15, $16, $17
      )
      RETURNING *
    `;
    
    const values = [
      name, slug, description, file_path, content, body.system_prompt || null,
      body.model || 'gpt-4', body.temperature || 0.7, JSON.stringify(body.tools || []),
      body.role_category || null, body.expertise_areas || [], body.tags || [],
      body.author || null, body.source_url || null,
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
        'chatmode.created',
        'chat_mode',
        result.rows[0].id,
        name,
        'system', // TODO: Get from authenticated user
        'admin@dxc.com',
        'create',
        JSON.stringify({ role_category: body.role_category, slug }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Chat mode created successfully',
        data: result.rows[0],
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating chat mode:', error);
    
    if (error.code === '23505') {
      return NextResponse.json(
        { 
          error: 'Chat mode already exists',
          message: 'A chat mode with this name or slug already exists',
          code: 'DUPLICATE_CHATMODE'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create chat mode', 
        message: error.message,
        code: 'CREATE_CHATMODE_ERROR'
      },
      { status: 500 }
    );
  }
}
