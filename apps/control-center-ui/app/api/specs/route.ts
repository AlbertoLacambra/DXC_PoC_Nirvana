/**
 * API Route: /api/specs
 * Handles listing and creating specs
 * 
 * GET /api/specs - List all specs with optional filters
 * POST /api/specs - Create a new spec
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Type definitions for enums
type SpecCategory = 'development' | 'infrastructure' | 'security' | 'testing' | 'observability' | 'finops' | 'compliance';
type SpecStatus = 'draft' | 'active' | 'deprecated' | 'archived';

// =============================================================================
// Types
// =============================================================================

interface SpecQueryParams {
  category?: SpecCategory;
  status?: SpecStatus;
  tags?: string[];
  required?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'popularity' | 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

interface CreateSpecBody {
  name: string;
  displayName: string;
  description?: string;
  category: SpecCategory;
  content: string;
  tags?: string[];
  applicableTo?: string[];
  dependencies?: string[];
  conflicts?: string[];
  required?: boolean;
  createdBy?: string;
}

// =============================================================================
// GET /api/specs - List all specs
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse query parameters
    const params: SpecQueryParams = {
      category: searchParams.get('category') as SpecCategory | undefined,
      status: (searchParams.get('status') as SpecStatus) || undefined,
      tags: searchParams.get('tags')?.split(','),
      required: searchParams.get('required') === 'true' ? true : searchParams.get('required') === 'false' ? false : undefined,
      search: searchParams.get('search') || undefined,
      limit: Math.min(parseInt(searchParams.get('limit') || '50'), 1000), // Cap at 1000
      offset: Math.max(parseInt(searchParams.get('offset') || '0'), 0), // Ensure non-negative
      sortBy: (searchParams.get('sortBy') as any) || 'popularity',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
    };

    // Build where clause
    const where: any = {};

    // Only apply category filter if it's a valid category
    const validCategories: SpecCategory[] = ['development', 'infrastructure', 'security', 'testing', 'observability', 'finops', 'compliance'];
    if (params.category && validCategories.includes(params.category)) {
      where.category = params.category;
    }

    // Only apply status filter if it's a valid status
    const validStatuses: SpecStatus[] = ['draft', 'active', 'deprecated', 'archived'];
    if (params.status && validStatuses.includes(params.status)) {
      where.status = params.status;
    }

    if (params.required !== undefined) {
      where.required = params.required;
    }

    if (params.tags && params.tags.length > 0) {
      where.tags = {
        hasSome: params.tags,
      };
    }

    if (params.search) {
      where.OR = [
        { name: { contains: params.search, mode: 'insensitive' } },
        { displayName: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
        { tags: { has: params.search } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    if (params.sortBy) {
      orderBy[params.sortBy] = params.sortOrder;
    }

    // Query specs
    const [specs, total] = await Promise.all([
      prisma.spec.findMany({
        where,
        orderBy,
        skip: params.offset,
        take: params.limit,
        select: {
          id: true,
          name: true,
          displayName: true,
          description: true,
          category: true,
          version: true,
          status: true,
          tags: true,
          applicableTo: true,
          required: true,
          projectCount: true,
          popularity: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              versions: true,
              usage: true,
            },
          },
        },
      }),
      prisma.spec.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: specs,
      meta: {
        total,
        limit: params.limit,
        offset: params.offset,
        hasMore: params.offset + specs.length < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching specs:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch specs',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/specs - Create a new spec
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: CreateSpecBody = await request.json();

    // Validation
    if (!body.name || !body.displayName || !body.category || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'name, displayName, category, and content are required',
        },
        { status: 400 }
      );
    }

    // Check if spec with same name already exists
    const existingSpec = await prisma.spec.findUnique({
      where: { name: body.name },
    });

    if (existingSpec) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spec already exists',
          message: `A spec with name "${body.name}" already exists`,
        },
        { status: 409 }
      );
    }

    // Create spec and initial version in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Create spec
      const spec = await tx.spec.create({
        data: {
          name: body.name,
          displayName: body.displayName,
          description: body.description,
          category: body.category,
          content: body.content,
          tags: body.tags || [],
          applicableTo: body.applicableTo || [],
          dependencies: body.dependencies || [],
          conflicts: body.conflicts || [],
          required: body.required || false,
          createdBy: body.createdBy || 'API',
          version: '1.0.0', // Initial version
        },
      });

      // Create initial version
      const version = await tx.specVersion.create({
        data: {
          specId: spec.id,
          version: '1.0.0',
          content: body.content,
          changelog: 'Initial version',
          createdBy: body.createdBy || 'API',
        },
      });

      return { spec, version };
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          spec: result.spec,
          version: result.version,
        },
        message: 'Spec created successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating spec:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create spec',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
