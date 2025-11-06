import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

// =====================================================
// PostgreSQL Connection Pool
// =====================================================

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: process.env.POSTGRES_DATABASE || 'nirvana',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// =====================================================
// Template Variable Interface
// =====================================================

interface TemplateVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  required: boolean;
  description?: string;
  default?: any;
}

// =====================================================
// POST /api/agent-hub/prompts/[id]/render
// =====================================================
// Render prompt template with provided variables

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { 
          error: 'Invalid prompt ID format',
          message: 'Prompt ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // Fetch prompt details
    const promptQuery = await pool.query(
      `SELECT * FROM prompts WHERE id = $1 AND is_active = true`,
      [id]
    );
    
    if (promptQuery.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Prompt not found or not available',
          message: `No active prompt found with ID: ${id}`,
          code: 'PROMPT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    const prompt = promptQuery.rows[0];
    const variables: TemplateVariable[] = prompt.variables || [];
    const providedValues = body.variables || {};
    
    // Validate required variables
    const missingRequired: string[] = [];
    for (const variable of variables) {
      if (variable.required && !providedValues.hasOwnProperty(variable.name)) {
        if (!variable.default) {
          missingRequired.push(variable.name);
        }
      }
    }
    
    if (missingRequired.length > 0) {
      return NextResponse.json(
        { 
          error: 'Missing required variables',
          message: `The following required variables are missing: ${missingRequired.join(', ')}`,
          missing: missingRequired,
          code: 'MISSING_VARIABLES'
        },
        { status: 400 }
      );
    }
    
    // Validate variable types
    const typeErrors: string[] = [];
    for (const variable of variables) {
      const value = providedValues[variable.name];
      
      if (value !== undefined) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (variable.type !== actualType && actualType !== 'undefined') {
          typeErrors.push(
            `Variable "${variable.name}" expected type "${variable.type}" but got "${actualType}"`
          );
        }
      }
    }
    
    if (typeErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Variable type mismatch',
          message: 'One or more variables have incorrect types',
          errors: typeErrors,
          code: 'TYPE_MISMATCH'
        },
        { status: 400 }
      );
    }
    
    // Build final values object with defaults
    const finalValues: Record<string, any> = {};
    for (const variable of variables) {
      if (providedValues.hasOwnProperty(variable.name)) {
        finalValues[variable.name] = providedValues[variable.name];
      } else if (variable.default !== undefined) {
        finalValues[variable.name] = variable.default;
      }
    }
    
    // Render template
    // Use template if available, otherwise use full content
    const templateText = prompt.template || prompt.content;
    
    let renderedPrompt = templateText;
    
    // Simple template rendering: Replace {{variableName}} with values
    // For production, consider using a proper template engine like Handlebars or Mustache
    for (const [key, value] of Object.entries(finalValues)) {
      const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      const replacement = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      renderedPrompt = renderedPrompt.replace(placeholder, replacement);
    }
    
    // Check for unresolved variables
    const unresolvedMatches = renderedPrompt.match(/{{[^}]+}}/g);
    const unresolvedVariables = unresolvedMatches 
      ? unresolvedMatches.map(match => match.replace(/[{}]/g, '').trim())
      : [];
    
    // Create session for tracking
    const sessionQuery = await pool.query(
      `INSERT INTO sessions (
        session_type, prompt_id, user_id, user_email, user_roles,
        parameters, status, result
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id`,
      [
        'prompt',
        id,
        'system', // TODO: Get from authenticated user
        'user@dxc.com', // TODO: Get from authenticated user
        ['developer'], // TODO: Get from authenticated user roles
        JSON.stringify({ variables: finalValues }),
        'completed',
        JSON.stringify({ 
          rendered_prompt: renderedPrompt,
          unresolved_variables: unresolvedVariables,
        }),
      ]
    );
    
    const sessionId = sessionQuery.rows[0].id;
    
    // Increment prompt usage counter
    await pool.query(
      'SELECT increment_prompt_usage($1)',
      [id]
    );
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'prompt.rendered',
        'prompt',
        id,
        prompt.name,
        'system', // TODO: Get from authenticated user
        'user@dxc.com',
        'execute',
        JSON.stringify({ 
          session_id: sessionId,
          variables_provided: Object.keys(finalValues).length,
          unresolved_count: unresolvedVariables.length,
        }),
      ]
    );
    
    // Build response
    return NextResponse.json(
      {
        message: 'Prompt rendered successfully',
        session_id: sessionId,
        prompt: {
          id: prompt.id,
          name: prompt.name,
          category: prompt.category,
          mode: prompt.mode,
        },
        rendered: renderedPrompt,
        variables_used: finalValues,
        unresolved_variables: unresolvedVariables,
        warnings: unresolvedVariables.length > 0 
          ? [`Found ${unresolvedVariables.length} unresolved variable(s): ${unresolvedVariables.join(', ')}`]
          : [],
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error rendering prompt:', error);
    return NextResponse.json(
      { 
        error: 'Failed to render prompt', 
        message: error.message,
        code: 'RENDER_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// GET /api/agent-hub/prompts/[id]/render
// =====================================================
// Get rendering instructions (variable schema)

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { 
          error: 'Invalid prompt ID format',
          message: 'Prompt ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // Fetch prompt details
    const query = `
      SELECT id, name, slug, description, variables, template, content
      FROM prompts
      WHERE id = $1 AND is_active = true
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Prompt not found',
          message: `No active prompt found with ID: ${id}`,
          code: 'PROMPT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    const prompt = result.rows[0];
    const variables: TemplateVariable[] = prompt.variables || [];
    
    // Build example payload
    const exampleVariables: Record<string, any> = {};
    for (const variable of variables) {
      if (variable.default !== undefined) {
        exampleVariables[variable.name] = variable.default;
      } else {
        // Provide example values based on type
        switch (variable.type) {
          case 'string':
            exampleVariables[variable.name] = `example_${variable.name}`;
            break;
          case 'number':
            exampleVariables[variable.name] = 42;
            break;
          case 'boolean':
            exampleVariables[variable.name] = true;
            break;
          case 'array':
            exampleVariables[variable.name] = ['item1', 'item2'];
            break;
          case 'object':
            exampleVariables[variable.name] = { key: 'value' };
            break;
        }
      }
    }
    
    return NextResponse.json({
      prompt: {
        id: prompt.id,
        name: prompt.name,
        slug: prompt.slug,
        description: prompt.description,
      },
      variables: variables,
      example_request: {
        variables: exampleVariables,
      },
      usage: {
        endpoint: `POST /api/agent-hub/prompts/${id}/render`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          variables: exampleVariables,
        },
      },
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error fetching render instructions:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch render instructions', 
        message: error.message,
        code: 'FETCH_INSTRUCTIONS_ERROR'
      },
      { status: 500 }
    );
  }
}
