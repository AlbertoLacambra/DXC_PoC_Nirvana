/**
 * API Route: /api/specs/search
 * Handles dedicated full-text search across specs
 * 
 * GET /api/specs/search?q=<query>&limit=<limit>&offset=<offset>
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// =============================================================================
// Types
// =============================================================================

interface SearchQueryParams {
  q?: string;
  limit?: string;
  offset?: string;
}

// =============================================================================
// GET /api/specs/search - Full-text search
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params: SearchQueryParams = {
      q: searchParams.get('q') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    // Validate query parameter
    if (!params.q || params.q.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing query parameter',
          message: 'Query parameter "q" is required for search',
        },
        { status: 400 }
      );
    }

    const searchQuery = params.q.trim();
    const limit = params.limit ? parseInt(params.limit) : 50;
    const offset = params.offset ? parseInt(params.offset) : 0;

    // Build search pattern for PostgreSQL full-text search
    // Escape special characters and convert to tsquery format
    const searchPattern = searchQuery
      .split(/\s+/)
      .filter(word => word.length > 0)
      .map(word => `${word}:*`)
      .join(' & ');

    // Execute raw SQL for full-text search using PostgreSQL's to_tsvector
    // This searches across name, displayName, description, and tags
    const specs = await prisma.$queryRaw<any[]>`
      SELECT 
        s.id,
        s.name,
        s.display_name,
        s.description,
        s.category,
        s.status,
        s.tags,
        s.applicable_to,
        s.required,
        s.popularity,
        s.created_at,
        s.updated_at,
        ts_rank(
          to_tsvector('english', 
            COALESCE(s.name, '') || ' ' || 
            COALESCE(s.display_name, '') || ' ' || 
            COALESCE(s.description, '') || ' ' || 
            COALESCE(array_to_string(s.tags, ' '), '')
          ),
          to_tsquery('english', ${searchPattern})
        ) as relevance,
        (SELECT COUNT(*) FROM spec_versions WHERE spec_id = s.id) as version_count,
        (SELECT COUNT(*) FROM spec_usage WHERE spec_id = s.id) as usage_count
      FROM specs s
      WHERE to_tsvector('english', 
        COALESCE(s.name, '') || ' ' || 
        COALESCE(s.display_name, '') || ' ' || 
        COALESCE(s.description, '') || ' ' || 
        COALESCE(array_to_string(s.tags, ' '), '')
      ) @@ to_tsquery('english', ${searchPattern})
      ORDER BY relevance DESC, s.popularity DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Get total count for matching specs
    const totalResult = await prisma.$queryRaw<any[]>`
      SELECT COUNT(*) as total
      FROM specs s
      WHERE to_tsvector('english', 
        COALESCE(s.name, '') || ' ' || 
        COALESCE(s.display_name, '') || ' ' || 
        COALESCE(s.description, '') || ' ' || 
        COALESCE(array_to_string(s.tags, ' '), '')
      ) @@ to_tsquery('english', ${searchPattern})
    `;

    const total = parseInt(totalResult[0]?.total || '0');

    // Transform snake_case to camelCase for consistency with other endpoints
    const transformedSpecs = specs.map((spec: any) => ({
      id: spec.id,
      name: spec.name,
      displayName: spec.display_name,
      description: spec.description,
      category: spec.category,
      status: spec.status,
      tags: spec.tags,
      applicableTo: spec.applicable_to,
      required: spec.required,
      popularity: spec.popularity,
      createdAt: spec.created_at,
      updatedAt: spec.updated_at,
      relevance: parseFloat(spec.relevance),
      versionCount: parseInt(spec.version_count),
      usageCount: parseInt(spec.usage_count),
    }));

    return NextResponse.json({
      success: true,
      data: transformedSpecs,
      meta: {
        query: searchQuery,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Error searching specs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search specs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
