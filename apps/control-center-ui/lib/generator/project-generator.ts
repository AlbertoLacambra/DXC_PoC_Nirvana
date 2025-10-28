/**
 * Project Generator
 * 
 * Main orchestrator that coordinates all generation steps:
 * 1. Validate input
 * 2. Create project structure
 * 3. Generate base files
 * 4. Apply specs
 * 5. Initialize Git
 * 6. Create CI/CD
 * 7. Track usage
 */

import {
  GenerationContext,
  FileToGenerate,
  createProjectRoot,
  generateFiles,
  GenerationResult,
  rollbackGeneration,
} from './file-generator';
import {
  ProjectType,
  compileTemplates,
} from './template-manager';
import {
  initializeGit,
  GitInitResult,
} from './git-initializer';
import {
  CiCdProvider,
  generateCiCdPipeline,
} from './cicd-generator';
import { parseSpec, ParsedSpec } from './spec-parser';

// =============================================================================
// Types
// =============================================================================

export interface GenerateProjectInput {
  projectType: ProjectType;
  projectName: string;
  directory: string;
  specs: Array<{
    id: string;
    name: string;
    content: string;
  }>;
  variables: Record<string, any>;
  options: {
    initGit: boolean;
    createCiCd: boolean;
    ciCdProvider: CiCdProvider;
  };
}

export interface GenerateProjectOutput {
  success: boolean;
  projectPath: string;
  generatedFiles: number;
  generatedDirectories: number;
  appliedSpecs: number;
  gitCommit?: string;
  duration: number; // milliseconds
  errors: string[];
}

// =============================================================================
// Validation
// =============================================================================

function validateInput(input: GenerateProjectInput): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!input.projectName || !input.projectName.trim()) {
    errors.push('Project name is required');
  }
  
  if (!input.directory || !input.directory.trim()) {
    errors.push('Project directory is required');
  }
  
  if (!input.projectType) {
    errors.push('Project type is required');
  }
  
  // Validate project name format
  const nameRegex = /^[a-zA-Z0-9-]+$/;
  if (input.projectName && !nameRegex.test(input.projectName)) {
    errors.push('Project name must contain only letters, numbers, and hyphens');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =============================================================================
// Main Generation Function
// =============================================================================

/**
 * Generate a complete project
 */
export async function generateProject(
  input: GenerateProjectInput
): Promise<GenerateProjectOutput> {
  const startTime = Date.now();
  const errors: string[] = [];
  let generationResult: GenerationResult | null = null;
  let gitResult: GitInitResult | null = null;
  
  try {
    // Step 1: Validate input
    const validation = validateInput(input);
    if (!validation.valid) {
      return {
        success: false,
        projectPath: input.directory,
        generatedFiles: 0,
        generatedDirectories: 0,
        appliedSpecs: 0,
        duration: Date.now() - startTime,
        errors: validation.errors,
      };
    }
    
    // Step 2: Create project root directory
    const rootResult = await createProjectRoot(input.directory);
    if (!rootResult.success) {
      return {
        success: false,
        projectPath: input.directory,
        generatedFiles: 0,
        generatedDirectories: 0,
        appliedSpecs: 0,
        duration: Date.now() - startTime,
        errors: [rootResult.error || 'Failed to create project directory'],
      };
    }
    
    // Step 3: Prepare generation context
    const context: GenerationContext = {
      projectType: input.projectType,
      projectName: input.projectName,
      directory: input.directory,
      variables: input.variables,
      options: input.options,
    };
    
    // Step 4: Compile base project templates
    const baseFiles = await compileTemplates(
      input.projectType,
      {
        projectName: input.projectName,
        ...input.variables,
      }
    );
    
    // Step 5: Parse specs and extract file definitions
    const parsedSpecs: ParsedSpec[] = input.specs.map(spec =>
      parseSpec(spec.id, spec.name, spec.content)
    );
    
    // Collect all file definitions from specs
    const specFiles: FileToGenerate[] = [];
    for (const spec of parsedSpecs) {
      for (const fileDef of spec.fileDefinitions) {
        specFiles.push({
          path: fileDef.path,
          content: fileDef.content,
          overwrite: fileDef.merge || false,
        });
      }
    }
    
    // Step 6: Generate CI/CD files if requested
    let cicdFiles: FileToGenerate[] = [];
    if (input.options.createCiCd) {
      cicdFiles = generateCiCdPipeline(
        input.options.ciCdProvider,
        input.projectType,
        input.projectName
      );
    }
    
    // Step 7: Combine all files
    const allFiles = [...baseFiles, ...specFiles, ...cicdFiles];
    
    // Step 8: Generate all files
    generationResult = await generateFiles(input.directory, allFiles, context);
    
    if (!generationResult.success) {
      errors.push(...generationResult.errors);
      // Rollback if generation failed
      await rollbackGeneration(generationResult);
      
      return {
        success: false,
        projectPath: input.directory,
        generatedFiles: generationResult.createdFiles.length,
        generatedDirectories: generationResult.createdDirectories.length,
        appliedSpecs: 0,
        duration: Date.now() - startTime,
        errors,
      };
    }
    
    // Step 9: Initialize Git if requested
    if (input.options.initGit) {
      gitResult = await initializeGit(input.directory, input.projectName);
      
      if (!gitResult.success) {
        errors.push(gitResult.error || 'Failed to initialize Git repository');
        // Don't rollback for Git failure, project is still valid
      }
    }
    
    // Step 10: Success!
    return {
      success: true,
      projectPath: input.directory,
      generatedFiles: generationResult.createdFiles.length,
      generatedDirectories: generationResult.createdDirectories.length,
      appliedSpecs: parsedSpecs.length,
      gitCommit: gitResult?.commitHash,
      duration: Date.now() - startTime,
      errors,
    };
  } catch (error: any) {
    // Unexpected error, rollback if we have a result
    if (generationResult) {
      await rollbackGeneration(generationResult);
    }
    
    return {
      success: false,
      projectPath: input.directory,
      generatedFiles: 0,
      generatedDirectories: 0,
      appliedSpecs: 0,
      duration: Date.now() - startTime,
      errors: [error.message || 'An unexpected error occurred'],
    };
  }
}
