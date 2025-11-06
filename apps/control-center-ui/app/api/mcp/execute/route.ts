import { NextRequest, NextResponse } from 'next/server';
import { getMCPServer } from '@/lib/mcp/mcp-registry';
import { createMCPClient, MCPToolExecutionRequest } from '@/lib/mcp/mcp-client';

/**
 * POST /api/mcp/execute
 * Execute a tool on an MCP server
 */
export async function POST(request: NextRequest) {
  try {
    const body: MCPToolExecutionRequest = await request.json();

    // Validate request
    if (!body.server_id || !body.tool_name) {
      return NextResponse.json(
        { error: 'Missing required fields: server_id, tool_name' },
        { status: 400 }
      );
    }

    // Get MCP server configuration
    const serverConfig = getMCPServer(body.server_id);
    if (!serverConfig) {
      return NextResponse.json(
        { error: `MCP server '${body.server_id}' not found` },
        { status: 404 }
      );
    }

    if (!serverConfig.enabled) {
      return NextResponse.json(
        { error: `MCP server '${body.server_id}' is disabled` },
        { status: 403 }
      );
    }

    // Find the tool
    const tool = serverConfig.tools.find(t => t.name === body.tool_name);
    if (!tool) {
      return NextResponse.json(
        { error: `Tool '${body.tool_name}' not found in server '${body.server_id}'` },
        { status: 404 }
      );
    }

    // TODO: Check user permissions against tool.required_permissions
    // For now, we'll use mock user context
    const userContext = body.user_context || {
      user_id: 'current-user',
      roles: ['admin'], // TODO: Get from auth session
    };

    // Check permissions
    const hasPermission = tool.required_permissions.length === 0 || 
                         userContext.roles.includes('admin') ||
                         tool.required_permissions.some(perm => userContext.roles.includes(perm));

    if (!hasPermission) {
      return NextResponse.json(
        { 
          error: 'Insufficient permissions',
          required_permissions: tool.required_permissions,
        },
        { status: 403 }
      );
    }

    // Create MCP client and execute tool
    const client = createMCPClient(serverConfig);
    const result = await client.executeTool(
      body.tool_name,
      body.parameters || {},
      userContext
    );

    // Log execution for audit
    console.log('[MCP] Tool execution:', {
      server: body.server_id,
      tool: body.tool_name,
      success: result.success,
      duration_ms: result.execution_time_ms,
      user: userContext.user_id,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[MCP] Execution error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
      },
      { status: 500 }
    );
  }
}
