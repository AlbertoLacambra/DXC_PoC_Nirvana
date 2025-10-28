import { NextRequest, NextResponse } from 'next/server';

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
  projectType: string;
  selectedSpecs: string[];
  configuration: ProjectConfiguration;
}

interface GeneratedProject {
  id: string;
  name: string;
  path: string;
  type: string;
  generatedFiles: number;
  specsApplied: number;
  createdAt: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Mock project generation
 * In Phase 3, this will be replaced with actual generation logic
 */
function mockGenerateProject(request: GenerateProjectRequest): GeneratedProject {
  const { projectType, selectedSpecs, configuration } = request;

  // Simulate file generation based on project type and specs
  const baseFiles = 10;
  const filesPerSpec = 3;
  const cicdFiles = configuration.options.createCiCd ? 2 : 0;
  const gitFiles = configuration.options.initGit ? 3 : 0;

  const totalFiles = baseFiles + (selectedSpecs.length * filesPerSpec) + cicdFiles + gitFiles;

  // Generate a mock project ID
  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return {
    id: projectId,
    name: configuration.name,
    path: configuration.directory,
    type: projectType,
    generatedFiles: totalFiles,
    specsApplied: selectedSpecs.length,
    createdAt: new Date().toISOString(),
  };
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
 * This is a mock implementation for Phase 2.7.
 * In Phase 3, this will trigger actual file generation using the spec engine.
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

    // Simulate processing delay (300-800ms)
    const delay = 300 + Math.random() * 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Generate the project (mock)
    const generatedProject = mockGenerateProject(body);

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Project generated successfully',
      data: generatedProject,
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
