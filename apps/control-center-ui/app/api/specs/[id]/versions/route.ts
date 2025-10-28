/**
 * API Route: /api/specs/[id]/versions
 * Handles spec version management
 * 
 * GET /api/specs/:id/versions - List all versions for a spec
 * POST /api/specs/:id/versions - Create new version
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// =============================================================================
// Types
// =============================================================================

interface CreateVersionBody {
  version: string;
  content: string;
  changelog?: string;
}

interface VersionQueryParams {
  limit?: string;
  offset?: string;
}

// =============================================================================
// GET /api/specs/:id/versions - List versions
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    
    const queryParams: VersionQueryParams = {
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    };

    const limit = queryParams.limit ? parseInt(queryParams.limit) : 50;
    const offset = queryParams.offset ? parseInt(queryParams.offset) : 0;

    // Check if spec exists
    const spec = await prisma.spec.findUnique({
      where: { id },
    });

    if (!spec) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spec not found',
          message: `No spec found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Get versions with pagination
    const [versions, total] = await Promise.all([
      prisma.specVersion.findMany({
        where: { specId: id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.specVersion.count({
        where: { specId: id },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: versions,
      meta: {
        specId: id,
        specName: spec.name,
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error: any) {
    console.error('Error fetching versions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch versions',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// POST /api/specs/:id/versions - Create new version
// =============================================================================

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: CreateVersionBody = await request.json();

    // Validate required fields
    if (!body.version || !body.content) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          message: 'Fields "version" and "content" are required',
        },
        { status: 400 }
      );
    }

    // Validate semantic version format (e.g., 1.0.0, 2.1.3)
    const semverRegex = /^\d+\.\d+\.\d+$/;
    if (!semverRegex.test(body.version)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid version format',
          message: 'Version must follow semantic versioning format (e.g., 1.0.0)',
        },
        { status: 400 }
      );
    }

    // Check if spec exists
    const spec = await prisma.spec.findUnique({
      where: { id },
    });

    if (!spec) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spec not found',
          message: `No spec found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Check if version already exists
    const existingVersion = await prisma.specVersion.findUnique({
      where: {
        specId_version: {
          specId: id,
          version: body.version,
        },
      },
    });

    if (existingVersion) {
      return NextResponse.json(
        {
          success: false,
          error: 'Version already exists',
          message: `Version ${body.version} already exists for spec ${spec.name}`,
        },
        { status: 409 }
      );
    }

    // Create new version
    const newVersion = await prisma.specVersion.create({
      data: {
        specId: id,
        version: body.version,
        content: body.content,
        changelog: body.changelog || `Version ${body.version}`,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: newVersion,
        message: `Version ${body.version} created successfully`,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating version:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create version',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
