import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

/**
 * GET /api/projects
 * Retrieves all projects from database
 */
export async function GET(request: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        description,
        repository_owner,
        repository_name,
        status,
        created_at,
        deployed_at,
        updated_at
      FROM github_projects
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      projects: result.rows,
      count: result.rows.length,
    });
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch projects',
      },
      { status: 500 }
    );
  }
}
