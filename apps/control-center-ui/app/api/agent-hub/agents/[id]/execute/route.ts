import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { readFile } from 'fs/promises';
import path from 'path';

// =====================================================
// PostgreSQL Connection Pool
// =====================================================

const pool = new Pool({
  host: process.env.AGENT_HUB_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.AGENT_HUB_DB_PORT || process.env.POSTGRES_PORT || '5432'),
  database: process.env.AGENT_HUB_DB_NAME || 'nirvana_agent_hub',
  user: process.env.AGENT_HUB_DB_USER || process.env.POSTGRES_USER || 'postgres',
  password: process.env.AGENT_HUB_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// =====================================================
// POST /api/agent-hub/agents/[id]/execute
// =====================================================
// Execute agent with context and parameters

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
          error: 'Invalid agent ID format',
          message: 'Agent ID must be a valid UUID',
          code: 'INVALID_ID'
        },
        { status: 400 }
      );
    }
    
    // Fetch agent details
    const agentQuery = await pool.query(
      `SELECT * FROM agents WHERE id = $1 AND is_active = true AND is_approved = true`,
      [id]
    );
    
    if (agentQuery.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Agent not found or not available',
          message: `No active and approved agent found with ID: ${id}`,
          code: 'AGENT_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    const agent = agentQuery.rows[0];
    
    // TODO: Check user permissions against agent.required_roles
    // For now, we'll allow any request
    
    // Extract execution parameters
    const { context, parameters } = body;
    
    if (!context) {
      return NextResponse.json(
        { 
          error: 'Missing context',
          message: 'Execution context is required',
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Load agent content from file if not cached
    let agentContent = agent.content;
    if (!agentContent) {
      try {
        const filePath = path.join(process.cwd(), '..', '..', agent.file_path);
        agentContent = await readFile(filePath, 'utf-8');
        
        // Cache content in database for future use
        await pool.query(
          'UPDATE agents SET content = $1 WHERE id = $2',
          [agentContent, id]
        );
      } catch (fileError: any) {
        console.error('Error loading agent file:', fileError);
        return NextResponse.json(
          { 
            error: 'Agent content not available',
            message: `Failed to load agent content from ${agent.file_path}`,
            code: 'FILE_READ_ERROR'
          },
          { status: 500 }
        );
      }
    }
    
    // Create execution session
    const sessionQuery = await pool.query(
      `INSERT INTO sessions (
        session_type, agent_id, user_id, user_email, user_roles,
        context, parameters, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, started_at`,
      [
        'agent',
        id,
        'system', // TODO: Get from authenticated user
        'user@dxc.com', // TODO: Get from authenticated user
        ['developer'], // TODO: Get from authenticated user roles
        JSON.stringify(context),
        JSON.stringify(parameters || {}),
        'active',
      ]
    );
    
    const sessionId = sessionQuery.rows[0].id;
    const startedAt = sessionQuery.rows[0].started_at;
    
    // =====================================================
    // AGENT EXECUTION SIMULATION
    // =====================================================
    // In production, this would:
    // 1. Call Dify API with agent configuration
    // 2. Inject context and parameters
    // 3. Execute agent workflow
    // 4. Return results
    //
    // For now, we'll simulate a response
    // =====================================================
    
    const executionResult = {
      status: 'completed',
      message: `Agent "${agent.name}" executed successfully`,
      context_received: context,
      parameters_received: parameters || {},
      agent_info: {
        name: agent.name,
        category: agent.category,
        tools: agent.tools,
        mcp_servers: agent.mcp_servers,
      },
      simulation_note: 'This is a simulated response. Actual execution will be implemented when Dify API is available (14/11).',
      suggested_actions: [
        'Review agent configuration',
        'Prepare MCP server connections',
        'Define tool execution handlers',
      ],
    };
    
    // Update session with result
    const completedAt = new Date();
    const durationSeconds = Math.floor(
      (completedAt.getTime() - new Date(startedAt).getTime()) / 1000
    );
    
    await pool.query(
      `UPDATE sessions 
       SET status = $1, ended_at = $2, duration_seconds = $3, result = $4
       WHERE id = $5`,
      [
        'completed',
        completedAt,
        durationSeconds,
        JSON.stringify(executionResult),
        sessionId,
      ]
    );
    
    // Increment agent usage counter
    await pool.query(
      'SELECT increment_agent_usage($1)',
      [id]
    );
    
    // Log audit trail
    await pool.query(
      `INSERT INTO audit_logs (
        event_type, entity_type, entity_id, entity_name,
        user_id, user_email, action, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'agent.executed',
        'agent',
        id,
        agent.name,
        'system', // TODO: Get from authenticated user
        'user@dxc.com', // TODO: Get from authenticated user
        'execute',
        JSON.stringify({ 
          session_id: sessionId,
          duration_seconds: durationSeconds,
        }),
      ]
    );
    
    return NextResponse.json(
      {
        message: 'Agent executed successfully',
        session_id: sessionId,
        agent: {
          id: agent.id,
          name: agent.name,
          category: agent.category,
        },
        execution: {
          started_at: startedAt,
          completed_at: completedAt,
          duration_seconds: durationSeconds,
          status: 'completed',
        },
        result: executionResult,
      },
      { status: 200 }
    );
    
  } catch (error: any) {
    console.error('Error executing agent:', error);
    
    // Try to update session status to failed
    try {
      await pool.query(
        `UPDATE sessions 
         SET status = $1, ended_at = $2, error_message = $3
         WHERE id = $4 AND status = 'active'`,
        ['failed', new Date(), error.message, 'current-session-id'] // TODO: Track session ID properly
      );
    } catch (updateError) {
      console.error('Failed to update session status:', updateError);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to execute agent', 
        message: error.message,
        code: 'EXECUTION_ERROR'
      },
      { status: 500 }
    );
  }
}
