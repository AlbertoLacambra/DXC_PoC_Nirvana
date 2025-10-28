/**
 * API Route: /api/specs/[id]
 * Handles individual spec operations
 * 
 * GET /api/specs/:id - Get spec by ID
 * PUT /api/specs/:id - Update spec
 * DELETE /api/specs/:id - Delete spec
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Type definitions for enums
type SpecCategory = 'development' | 'infrastructure' | 'security' | 'testing' | 'observability' | 'finops' | 'compliance';
type SpecStatus = 'draft' | 'active' | 'deprecated' | 'archived';

// =============================================================================
// Types
// =============================================================================

interface UpdateSpecBody {
  displayName?: string;
  description?: string;
  category?: SpecCategory;
  status?: SpecStatus;
  content?: string;
  tags?: string[];
  applicableTo?: string[];
  dependencies?: string[];
  conflicts?: string[];
  required?: boolean;
  minVersion?: string;
  maxVersion?: string;
}

// =============================================================================
// GET /api/specs/:id - Get spec by ID
// =============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const spec = await prisma.spec.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { createdAt: 'desc' },
          take: 5, // Last 5 versions
        },
        usage: {
          orderBy: { appliedAt: 'desc' },
          take: 10, // Last 10 usage records
        },
        _count: {
          select: {
            versions: true,
            usage: true,
          },
        },
      },
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

    return NextResponse.json({
      success: true,
      data: spec,
    });
  } catch (error: any) {
    console.error('Error fetching spec:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch spec',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// PUT /api/specs/:id - Update spec
// =============================================================================

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body: UpdateSpecBody = await request.json();

    // Check if spec exists
    const existingSpec = await prisma.spec.findUnique({
      where: { id },
    });

    if (!existingSpec) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spec not found',
          message: `No spec found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Update spec
    const updatedSpec = await prisma.spec.update({
      where: { id },
      data: {
        displayName: body.displayName,
        description: body.description,
        category: body.category,
        status: body.status,
        content: body.content,
        tags: body.tags,
        applicableTo: body.applicableTo,
        dependencies: body.dependencies,
        conflicts: body.conflicts,
        required: body.required,
        minVersion: body.minVersion,
        maxVersion: body.maxVersion,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedSpec,
      message: 'Spec updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating spec:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update spec',
        message: error.message,
      },
      { status: 500 }
    );
  }
}

// =============================================================================
// DELETE /api/specs/:id - Delete spec
// =============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if spec exists
    const existingSpec = await prisma.spec.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            usage: true,
          },
        },
      },
    });

    if (!existingSpec) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spec not found',
          message: `No spec found with ID: ${id}`,
        },
        { status: 404 }
      );
    }

    // Check if spec is being used
    if (existingSpec._count.usage > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Spec is in use',
          message: `Cannot delete spec. It is currently used in ${existingSpec._count.usage} project(s). Consider archiving instead.`,
        },
        { status: 409 }
      );
    }

    // Delete spec (cascade will delete versions and usage)
    await prisma.spec.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Spec deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting spec:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete spec',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
