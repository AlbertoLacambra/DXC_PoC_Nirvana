import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// =====================================================
// PostgreSQL Connection Pool
// =====================================================
// Agent Hub local DB (temporary until Azure subscription reactivated on 11/17)

const pool = new Pool({
  host: process.env.AGENT_HUB_DB_HOST || process.env.AGENT_HUB_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.AGENT_HUB_DB_PORT || process.env.AGENT_HUB_DB_PORT || process.env.POSTGRES_PORT || '5432'),
  database: process.env.AGENT_HUB_DB_NAME || 'nirvana_agent_hub',
  user: process.env.AGENT_HUB_DB_USER || process.env.AGENT_HUB_DB_USER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.AGENT_HUB_DB_PASSWORD || process.env.AGENT_HUB_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// =====================================================
// GET /api/agent-hub/agents
// =====================================================
// List agents with filters and pagination

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const category = searchParams.get('category'); // 'community' | 'dxc-custom'
    const tags = searchParams.get('tags')?.split(','); // Array of tags
    const search = searchParams.get('search'); // Full-text search
    const isActive = searchParams.get('isActive') !== 'false'; // Default true
    const isApproved = searchParams.get('isApproved') !== 'false'; // Default true
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const sortBy = searchParams.get('sortBy') || 'name'; // name, created_at, execution_count
    const sortOrder = searchParams.get('sortOrder') || 'asc'; // asc, desc
    
    // Build WHERE clause dynamically
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (isActive) {
      conditions.push(`is_active = $${paramIndex++}`);
      values.push(true);
    }
    
    if (isApproved) {
      conditions.push(`is_approved = $${paramIndex++}`);
      values.push(true);
    }
    
    if (category) {
      conditions.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    
    if (tags && tags.length > 0) {
      conditions.push(`tags && $${paramIndex++}`);
      values.push(tags);
    }
    
    if (search) {
      conditions.push(`(
        name ILIKE $${paramIndex} OR 
        description ILIKE $${paramIndex} OR 
        $${paramIndex} = ANY(tags)
      )`);
      values.push(`%${search}%`);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 
      ? `WHERE ${conditions.join(' AND ')}` 
      : '';
    
    // Validate sortBy to prevent SQL injection
    const validSortFields = ['name', 'created_at', 'execution_count', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    // Count total records
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM agents 
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);
    
    // Fetch paginated data
    const offset = (page - 1) * limit;
    const dataQuery = `
      SELECT 
        id,
        name,
        slug,
        category,
        description,
        file_path,
        tools,
        mcp_servers,
        tags,
        author,
        source_url,
        execution_count,
        last_executed_at,
        required_roles,
        is_approved,
        is_active,
        created_at,
        updated_at
      FROM agents
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    
    const dataResult = await pool.query(dataQuery, [...values, limit, offset]);
    
    // Build response
    const response = {
      agents: dataResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
      filters: {
        category,
        tags,
        search,
        isActive,
        isApproved,
      },
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch agents', 
        message: error.message,
        code: 'FETCH_AGENTS_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/agent-hub/agents
// =====================================================
// Create new agent (admin only)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Add authentication middleware to verify admin role
    // For now, we'll accept any request
    
    // Validate required fields
    const { name, slug, category, description, file_path } = body;
    
    if (!name || !slug || !category || !description || !file_path) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          required: ['name', 'slug', 'category', 'description', 'file_path'],
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Validate category
    if (!['community', 'dxc-custom'].includes(category)) {
      return NextResponse.json(
        { 
          error: 'Invalid category',
          message: 'Category must be either "community" or "dxc-custom"',
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
    
    // Insert agent
    const query = `
      INSERT INTO agents (
        name, slug, category, description, file_path,
        content, tools, mcp_servers, tags, author, source_url,
        required_roles, is_approved, is_active, created_by
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15
      )
      RETURNING *
    `;
    
    const values = [
      name,
      slug,
      category,
      description,
      file_path,
      body.content || null,
      JSON.stringify(body.tools || []),
      JSON.stringify(body.mcp_servers || []),
      body.tags || [],
      body.author || null,
      body.source_url || null,
      body.required_roles || ['developer'],
      body.is_approved !== undefined ? body.is_approved : false, // Default to false for admin approval
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
        'agent.created',
        'agent',
        result.rows[0].id,
        name,
        'system', // TODO: Get from authenticated user
        'admin@dxc.com', // TODO: Get from authenticated user
        'create',
        JSON.stringify({ category, slug }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Agent created successfully',
        data: result.rows[0],
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Error creating agent:', error);
    
    // Handle unique constraint violations
    if (error.code === '23505') {
      return NextResponse.json(
        { 
          error: 'Agent already exists',
          message: 'An agent with this name or slug already exists',
          code: 'DUPLICATE_AGENT'
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create agent', 
        message: error.message,
        code: 'CREATE_AGENT_ERROR'
      },
      { status: 500 }
    );
  }
}
