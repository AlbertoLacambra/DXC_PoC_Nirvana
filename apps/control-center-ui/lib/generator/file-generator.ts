/**
 * File Generator
 * 
 * Core logic for creating directories and files with template interpolation.
 * Uses Handlebars for variable substitution.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';

// =============================================================================
// Types
// =============================================================================

export interface GenerationContext {
  projectType: string;
  projectName: string;
  directory: string;
  variables: Record<string, any>;
  options: {
    initGit: boolean;
    createCiCd: boolean;
    ciCdProvider: 'azure-pipelines' | 'github-actions' | 'gitlab-ci';
  };
}

export interface FileToGenerate {
  path: string; // Relative path from project root
  content: string;
  overwrite?: boolean; // Default: false
}

export interface GenerationResult {
  success: boolean;
  createdFiles: string[];
  createdDirectories: string[];
  errors: string[];
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Ensure a directory exists, creating it if necessary
 */
async function ensureDirectory(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Interpolate template variables using Handlebars
 */
function interpolateTemplate(template: string, variables: Record<string, any>): string {
  const compiledTemplate = Handlebars.compile(template);
  return compiledTemplate(variables);
}

/**
 * Register common Handlebars helpers
 */
function registerHandlebarsHelpers() {
  // Helper: Convert to kebab-case
  Handlebars.registerHelper('kebabCase', (str: string) => {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2')
              .replace(/[\s_]+/g, '-')
              .toLowerCase();
  });
  
  // Helper: Convert to camelCase
  Handlebars.registerHelper('camelCase', (str: string) => {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
  });
  
  // Helper: Convert to PascalCase
  Handlebars.registerHelper('pascalCase', (str: string) => {
    return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '')
              .replace(/^(.)/, (c) => c.toUpperCase());
  });
  
  // Helper: Convert to snake_case
  Handlebars.registerHelper('snakeCase', (str: string) => {
    return str.replace(/([a-z])([A-Z])/g, '$1_$2')
              .replace(/[\s-]+/g, '_')
              .toLowerCase();
  });
  
  // Helper: Convert to UPPER_CASE
  Handlebars.registerHelper('upperCase', (str: string) => {
    return str.toUpperCase();
  });
  
  // Helper: Conditional equality
  Handlebars.registerHelper('eq', (a: any, b: any) => {
    return a === b;
  });
  
  // Helper: Conditional inequality
  Handlebars.registerHelper('ne', (a: any, b: any) => {
    return a !== b;
  });
}

// Register helpers on module load
registerHandlebarsHelpers();

// =============================================================================
// File Generation Functions
// =============================================================================

/**
 * Generate a single file
 */
export async function generateFile(
  projectRoot: string,
  file: FileToGenerate,
  context: GenerationContext
): Promise<{ success: boolean; filePath: string; error?: string }> {
  const filePath = path.join(projectRoot, file.path);
  const fileDir = path.dirname(filePath);
  
  try {
    // Ensure parent directory exists
    await ensureDirectory(fileDir);
    
    // Check if file exists
    const exists = await fileExists(filePath);
    
    if (exists && !file.overwrite) {
      return {
        success: false,
        filePath,
        error: `File already exists: ${file.path}`,
      };
    }
    
    // Interpolate template variables
    const interpolatedContent = interpolateTemplate(file.content, {
      ...context.variables,
      projectName: context.projectName,
      projectType: context.projectType,
      ...context.options,
    });
    
    // Write file
    await fs.writeFile(filePath, interpolatedContent, 'utf-8');
    
    return {
      success: true,
      filePath,
    };
  } catch (error: any) {
    return {
      success: false,
      filePath,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Generate multiple files
 */
export async function generateFiles(
  projectRoot: string,
  files: FileToGenerate[],
  context: GenerationContext
): Promise<GenerationResult> {
  const createdFiles: string[] = [];
  const createdDirectories: Set<string> = new Set();
  const errors: string[] = [];
  
  // Track all directories we need to create
  for (const file of files) {
    const fileDir = path.dirname(path.join(projectRoot, file.path));
    let currentDir = projectRoot;
    
    // Add all parent directories
    const relativePath = path.relative(projectRoot, fileDir);
    const parts = relativePath.split(path.sep).filter(p => p && p !== '.');
    
    for (const part of parts) {
      currentDir = path.join(currentDir, part);
      createdDirectories.add(currentDir);
    }
  }
  
  // Create all directories
  for (const dir of Array.from(createdDirectories)) {
    try {
      await ensureDirectory(dir);
    } catch (error: any) {
      errors.push(`Failed to create directory ${dir}: ${error.message}`);
    }
  }
  
  // Generate all files
  for (const file of files) {
    const result = await generateFile(projectRoot, file, context);
    
    if (result.success) {
      createdFiles.push(result.filePath);
    } else {
      errors.push(result.error || `Failed to create ${file.path}`);
    }
  }
  
  return {
    success: errors.length === 0,
    createdFiles,
    createdDirectories: Array.from(createdDirectories),
    errors,
  };
}

/**
 * Create project root directory
 */
export async function createProjectRoot(
  directory: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if directory already exists
    const exists = await fileExists(directory);
    
    if (exists) {
      // Check if directory is empty
      const files = await fs.readdir(directory);
      if (files.length > 0) {
        return {
          success: false,
          error: `Directory ${directory} already exists and is not empty`,
        };
      }
    } else {
      // Create directory
      await ensureDirectory(directory);
    }
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to create project directory',
    };
  }
}

/**
 * Read an existing file for merging
 */
export async function readFile(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Merge content into an existing file
 * This is a simple append for now, can be made smarter later
 */
export async function mergeIntoFile(
  filePath: string,
  newContent: string,
  mergeStrategy: 'append' | 'prepend' | 'replace' = 'append'
): Promise<{ success: boolean; error?: string }> {
  try {
    const existingContent = await readFile(filePath);
    
    let finalContent: string;
    if (existingContent === null) {
      // File doesn't exist, just write new content
      finalContent = newContent;
    } else {
      // Merge based on strategy
      switch (mergeStrategy) {
        case 'append':
          finalContent = existingContent + '\n\n' + newContent;
          break;
        case 'prepend':
          finalContent = newContent + '\n\n' + existingContent;
          break;
        case 'replace':
          finalContent = newContent;
          break;
        default:
          finalContent = newContent;
      }
    }
    
    await fs.writeFile(filePath, finalContent, 'utf-8');
    
    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Failed to merge file',
    };
  }
}

/**
 * Delete a file (for rollback)
 */
export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Delete a directory (for rollback)
 */
export async function deleteDirectory(dirPath: string): Promise<void> {
  try {
    await fs.rm(dirPath, { recursive: true, force: true });
  } catch {
    // Ignore errors during cleanup
  }
}

/**
 * Rollback file generation (delete all created files and directories)
 */
export async function rollbackGeneration(result: GenerationResult): Promise<void> {
  // Delete files first
  for (const file of result.createdFiles) {
    await deleteFile(file);
  }
  
  // Delete directories (in reverse order to delete children first)
  const dirs = result.createdDirectories.sort().reverse();
  for (const dir of dirs) {
    await deleteDirectory(dir);
  }
}
