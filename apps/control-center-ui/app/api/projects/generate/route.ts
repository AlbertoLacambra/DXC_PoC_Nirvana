import { NextRequest, NextResponse } from 'next/server';
import { generateProject, GenerateProjectInput } from '@/lib/generator/project-generator';
import { ProjectType } from '@/lib/generator/template-manager';
import { CiCdProvider } from '@/lib/generator/cicd-generator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// =============================================================================
// Types
// =============================================================================

interface ProjectConfiguration {
  name: string;
  directory: string;
  variables: Record<string, string>;
  options: {
    initGit: boolean;
    createCiCd: boolean;
    ciCdProvider: 'azure-pipelines' | 'github-actions' | 'gitlab-ci';
  };
}

interface GenerateProjectRequest {
  projectType: ProjectType;
  selectedSpecs: string[];
  configuration: ProjectConfiguration;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Fetch specs from database
 */
async function fetchSpecs(specIds: string[]): Promise<Array<{ id: string; name: string; content: string }>> {
  try {
    const specs = await prisma.spec.findMany({
      where: {
        id: {
          in: specIds,
        },
      },
      select: {
        id: true,
        name: true,
        content: true,
      },
    });
    
    return specs;
  } catch (error) {
    console.error('Error fetching specs:', error);
    return [];
  }
}

/**
 * Validate the generation request
 */
function validateRequest(request: any): { valid: boolean; error?: string } {
  if (!request.projectType) {
    return { valid: false, error: 'Project type is required' };
  }

  if (!request.selectedSpecs || !Array.isArray(request.selectedSpecs)) {
    return { valid: false, error: 'Selected specs must be an array' };
  }

  if (!request.configuration) {
    return { valid: false, error: 'Configuration is required' };
  }

  if (!request.configuration.name || !request.configuration.name.trim()) {
    return { valid: false, error: 'Project name is required' };
  }

  if (!request.configuration.directory || !request.configuration.directory.trim()) {
    return { valid: false, error: 'Project directory is required' };
  }

  // Validate project name (alphanumeric and hyphens only)
  const nameRegex = /^[a-zA-Z0-9-]+$/;
  if (!nameRegex.test(request.configuration.name)) {
    return {
      valid: false,
      error: 'Project name must contain only letters, numbers, and hyphens',
    };
  }

  return { valid: true };
}

// =============================================================================
// API Handler
// =============================================================================

/**
 * POST /api/projects/generate
 * 
 * Generate a new project based on the wizard selections.
 * Phase 3 implementation with actual file generation.
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateProjectRequest = await request.json();

    // Validate the request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error,
        },
        { status: 400 }
      );
    }

    // Fetch specs from database
    const specs = await fetchSpecs(body.selectedSpecs);
    
    if (specs.length === 0 && body.selectedSpecs.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No valid specs found',
        },
        { status: 400 }
      );
    }

    // Prepare generation input
    const generationInput: GenerateProjectInput = {
      projectType: body.projectType,
      projectName: body.configuration.name,
      directory: body.configuration.directory,
      specs: specs,
      variables: body.configuration.variables || {},
      options: {
        initGit: body.configuration.options.initGit,
        createCiCd: body.configuration.options.createCiCd,
        ciCdProvider: body.configuration.options.ciCdProvider as CiCdProvider,
      },
    };

    // Generate the project
    const result = await generateProject(generationInput);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Project generation failed',
          errors: result.errors,
        },
        { status: 500 }
      );
    }

    // Generate project ID
    const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // TODO: Track usage in database (spec_usage table)
    // This will be implemented once we have the projects table created

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Project generated successfully',
      data: {
        id: projectId,
        name: body.configuration.name,
        path: result.projectPath,
        type: body.projectType,
        generatedFiles: result.generatedFiles,
        specsApplied: result.appliedSpecs,
        gitCommit: result.gitCommit,
        duration: result.duration,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error generating project:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'An error occurred while generating the project',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * GET /api/projects/generate
 * 
 * Returns information about the generation endpoint
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Project generation endpoint',
    data: {
      method: 'POST',
      description: 'Generate a new project from specifications',
      requiredFields: ['projectType', 'selectedSpecs', 'configuration'],
      configurationFields: ['name', 'directory', 'options'],
      supportedProjectTypes: [
        'nextjs-app',
        'react-spa',
        'terraform-infra',
        'python-api',
        'azure-function',
        'nodejs-microservice',
      ],
    },
  });
}
