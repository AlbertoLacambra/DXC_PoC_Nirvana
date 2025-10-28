/**
 * Spec Parser
 * 
 * Extracts code blocks, file definitions, and metadata from Markdown specification files.
 * Specs can contain code blocks with language identifiers that indicate file types.
 */

// =============================================================================
// Types
// =============================================================================

export interface CodeBlock {
  language: string;
  code: string;
  filename?: string; // Extracted from comments or metadata
  description?: string;
}

export interface FileDefinition {
  path: string; // Relative path where file should be created
  content: string;
  language: string;
  merge?: boolean; // Whether to merge with existing file or replace
}

export interface ParsedSpec {
  id: string;
  name: string;
  content: string; // Original Markdown content
  codeBlocks: CodeBlock[];
  fileDefinitions: FileDefinition[];
  variables: Record<string, string>; // Variables that can be interpolated
  dependencies: string[]; // Other spec IDs this depends on
  conflicts: string[]; // Spec IDs that conflict with this one
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Extract all code blocks from Markdown content
 */
function extractCodeBlocks(markdown: string): CodeBlock[] {
  const codeBlocks: CodeBlock[] = [];
  
  // Regex to match code blocks: ```language\ncode\n```
  const codeBlockRegex = /```(\w+)?\s*(?:\/\/\s*(.+?))?\n([\s\S]*?)```/g;
  
  let match;
  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1] || 'text';
    const comment = match[2]; // Optional comment after language (e.g., ```typescript // filename.ts)
    const code = match[3].trim();
    
    // Try to extract filename from comment
    let filename: string | undefined;
    if (comment) {
      // Comment might be: "filename.ts" or "Path: src/filename.ts"
      const filenameMatch = comment.match(/(?:(?:Path|File):\s*)?(.+)/);
      if (filenameMatch) {
        filename = filenameMatch[1].trim();
      }
    }
    
    codeBlocks.push({
      language,
      code,
      filename,
    });
  }
  
  return codeBlocks;
}

/**
 * Extract file definitions from code blocks
 * File definitions are code blocks with explicit file paths
 */
function extractFileDefinitions(codeBlocks: CodeBlock[]): FileDefinition[] {
  const fileDefs: FileDefinition[] = [];
  
  for (const block of codeBlocks) {
    if (block.filename) {
      fileDefs.push({
        path: block.filename,
        content: block.code,
        language: block.language,
        merge: false, // Default: replace, can be overridden
      });
    }
  }
  
  return fileDefs;
}

/**
 * Extract variables from spec metadata section
 * Variables are defined in a YAML-like section:
 * 
 * ## Variables
 * - projectName: string
 * - azureRegion: string
 */
function extractVariables(markdown: string): Record<string, string> {
  const variables: Record<string, string> = {};
  
  // Look for Variables section
  const variablesSection = markdown.match(/##\s*Variables\s*\n([\s\S]*?)(?:\n##|$)/i);
  
  if (variablesSection) {
    const content = variablesSection[1];
    
    // Extract variable definitions (e.g., - variableName: type)
    const variableRegex = /-\s+(\w+):\s*(.+)/g;
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      const varName = match[1];
      const varType = match[2].trim();
      variables[varName] = varType;
    }
  }
  
  return variables;
}

/**
 * Extract dependencies from spec metadata
 * Dependencies are listed in metadata section
 */
function extractDependencies(markdown: string): string[] {
  const dependencies: string[] = [];
  
  // Look for Dependencies section
  const depsSection = markdown.match(/##\s*Dependencies\s*\n([\s\S]*?)(?:\n##|$)/i);
  
  if (depsSection) {
    const content = depsSection[1];
    
    // Extract spec IDs or names
    const depRegex = /-\s+(.+)/g;
    let match;
    
    while ((match = depRegex.exec(content)) !== null) {
      dependencies.push(match[1].trim());
    }
  }
  
  return dependencies;
}

/**
 * Extract conflicts from spec metadata
 */
function extractConflicts(markdown: string): string[] {
  const conflicts: string[] = [];
  
  // Look for Conflicts section
  const conflictsSection = markdown.match(/##\s*Conflicts?\s*\n([\s\S]*?)(?:\n##|$)/i);
  
  if (conflictsSection) {
    const content = conflictsSection[1];
    
    // Extract spec IDs or names
    const conflictRegex = /-\s+(.+)/g;
    let match;
    
    while ((match = conflictRegex.exec(content)) !== null) {
      conflicts.push(match[1].trim());
    }
  }
  
  return conflicts;
}

// =============================================================================
// Main Parser
// =============================================================================

/**
 * Parse a specification Markdown file
 */
export function parseSpec(
  id: string,
  name: string,
  content: string
): ParsedSpec {
  const codeBlocks = extractCodeBlocks(content);
  const fileDefinitions = extractFileDefinitions(codeBlocks);
  const variables = extractVariables(content);
  const dependencies = extractDependencies(content);
  const conflicts = extractConflicts(content);
  
  return {
    id,
    name,
    content,
    codeBlocks,
    fileDefinitions,
    variables,
    dependencies,
    conflicts,
  };
}

/**
 * Parse multiple specs
 */
export function parseSpecs(
  specs: Array<{ id: string; name: string; content: string }>
): ParsedSpec[] {
  return specs.map((spec) => parseSpec(spec.id, spec.name, spec.content));
}

/**
 * Get language-to-extension mapping
 */
export function getFileExtension(language: string): string {
  const extensionMap: Record<string, string> = {
    javascript: '.js',
    typescript: '.ts',
    tsx: '.tsx',
    jsx: '.jsx',
    python: '.py',
    bash: '.sh',
    shell: '.sh',
    yaml: '.yaml',
    yml: '.yml',
    json: '.json',
    markdown: '.md',
    md: '.md',
    terraform: '.tf',
    hcl: '.tf',
    dockerfile: 'Dockerfile',
    docker: 'Dockerfile',
    sql: '.sql',
    html: '.html',
    css: '.css',
    scss: '.scss',
    sass: '.sass',
    less: '.less',
  };
  
  return extensionMap[language.toLowerCase()] || '.txt';
}

/**
 * Infer file path from code block language and content
 * Used when filename is not explicitly provided
 */
export function inferFilePath(block: CodeBlock, projectType: string): string {
  const extension = getFileExtension(block.language);
  
  // Default paths based on project type and language
  const defaultPaths: Record<string, Record<string, string>> = {
    'nextjs-app': {
      typescript: 'src/index.ts',
      tsx: 'src/components/Component.tsx',
      javascript: 'src/index.js',
      json: 'package.json',
    },
    'react-spa': {
      typescript: 'src/index.ts',
      tsx: 'src/App.tsx',
      javascript: 'src/index.js',
      json: 'package.json',
    },
    'terraform-infra': {
      terraform: 'main.tf',
      hcl: 'main.tf',
    },
    'python-api': {
      python: 'main.py',
      requirements: 'requirements.txt',
    },
    'azure-function': {
      python: 'function_app.py',
      json: 'function.json',
    },
    'nodejs-microservice': {
      typescript: 'src/index.ts',
      javascript: 'src/index.js',
      json: 'package.json',
    },
  };
  
  const projectPaths = defaultPaths[projectType] || {};
  return projectPaths[block.language.toLowerCase()] || `file${extension}`;
}
