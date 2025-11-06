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
// GET /api/agent-hub/instructions/search
// =====================================================
// Advanced search for instructions by technology stack

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Query parameters
    const technologies = searchParams.get('technologies')?.split(',') || [];
    const fileExtension = searchParams.get('fileExtension'); // e.g., '.tf', '.py', '.ts'
    const matchMode = searchParams.get('matchMode') || 'any'; // 'any' or 'all'
    const includeRelated = searchParams.get('includeRelated') === 'true';
    
    if (technologies.length === 0 && !fileExtension) {
      return NextResponse.json(
        { 
          error: 'Missing search criteria',
          message: 'Provide at least one technology or fileExtension parameter',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    const conditions: string[] = ['is_active = true'];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Technology matching
    if (technologies.length > 0) {
      if (matchMode === 'all') {
        // All technologies must match
        for (const tech of technologies) {
          conditions.push(`(
            technology ILIKE $${paramIndex} OR
            $${paramIndex} = ANY(related_technologies)
          )`);
          values.push(`%${tech}%`);
          paramIndex++;
        }
      } else {
        // Any technology matches
        const techConditions = technologies.map(tech => {
          const condition = `(
            technology ILIKE $${paramIndex} OR
            $${paramIndex} = ANY(related_technologies)
          )`;
          values.push(`%${tech}%`);
          paramIndex++;
          return condition;
        });
        conditions.push(`(${techConditions.join(' OR ')})`);
      }
    }
    
    // File extension matching
    if (fileExtension) {
      conditions.push(`apply_to ILIKE $${paramIndex}`);
      values.push(`%${fileExtension}%`);
      paramIndex++;
    }
    
    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    
    // Execute query
    const query = `
      SELECT 
        id, name, slug, description, file_path, content,
        technology, technology_version, apply_to,
        tags, related_technologies,
        author, source_url,
        apply_count, last_applied_at,
        required_roles, is_active,
        created_at, updated_at
      FROM instructions
      ${whereClause}
      ORDER BY 
        CASE 
          WHEN technology = ANY($${paramIndex}) THEN 1
          ELSE 2
        END,
        apply_count DESC,
        name ASC
    `;
    
    values.push(technologies);
    
    const result = await pool.query(query, values);
    
    // Group results by technology
    const grouped = result.rows.reduce((acc: any, instruction: any) => {
      const tech = instruction.technology;
      if (!acc[tech]) {
        acc[tech] = [];
      }
      acc[tech].push(instruction);
      return acc;
    }, {});
    
    return NextResponse.json({
      data: result.rows,
      grouped_by_technology: grouped,
      search_criteria: {
        technologies,
        file_extension: fileExtension,
        match_mode: matchMode,
        include_related: includeRelated,
      },
      total_results: result.rows.length,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error searching instructions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search instructions', 
        message: error.message,
        code: 'SEARCH_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// POST /api/agent-hub/instructions/search
// =====================================================
// Advanced search with complex criteria (POST for complex payloads)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      technologies = [],
      tags = [],
      file_patterns = [],
      exclude_technologies = [],
      min_apply_count = 0,
    } = body;
    
    const conditions: string[] = ['is_active = true'];
    const values: any[] = [];
    let paramIndex = 1;
    
    // Include technologies
    if (technologies.length > 0) {
      const techConditions = technologies.map((tech: string) => {
        const condition = `(technology ILIKE $${paramIndex} OR $${paramIndex} = ANY(related_technologies))`;
        values.push(`%${tech}%`);
        paramIndex++;
        return condition;
      });
      conditions.push(`(${techConditions.join(' OR ')})`);
    }
    
    // Exclude technologies
    if (exclude_technologies.length > 0) {
      for (const tech of exclude_technologies) {
        conditions.push(`technology NOT ILIKE $${paramIndex}`);
        values.push(`%${tech}%`);
        paramIndex++;
      }
    }
    
    // Tags
    if (tags.length > 0) {
      conditions.push(`tags && $${paramIndex}`);
      values.push(tags);
      paramIndex++;
    }
    
    // File patterns
    if (file_patterns.length > 0) {
      const patternConditions = file_patterns.map((pattern: string) => {
        const condition = `apply_to ILIKE $${paramIndex}`;
        values.push(`%${pattern}%`);
        paramIndex++;
        return condition;
      });
      conditions.push(`(${patternConditions.join(' OR ')})`);
    }
    
    // Minimum apply count
    if (min_apply_count > 0) {
      conditions.push(`apply_count >= $${paramIndex}`);
      values.push(min_apply_count);
      paramIndex++;
    }
    
    const whereClause = `WHERE ${conditions.join(' AND ')}`;
    
    const query = `
      SELECT 
        id, name, slug, description, file_path, content,
        technology, technology_version, apply_to,
        tags, related_technologies,
        apply_count, last_applied_at
      FROM instructions
      ${whereClause}
      ORDER BY apply_count DESC, name ASC
    `;
    
    const result = await pool.query(query, values);
    
    return NextResponse.json({
      data: result.rows,
      total_results: result.rows.length,
      search_criteria: body,
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform advanced search', 
        message: error.message,
        code: 'ADVANCED_SEARCH_ERROR'
      },
      { status: 500 }
    );
  }
}
