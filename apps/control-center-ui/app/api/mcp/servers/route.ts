import { NextRequest, NextResponse } from 'next/server';
import { getEnabledMCPServers, getAllMCPTools } from '@/lib/mcp/mcp-registry';
import { createMCPClient } from '@/lib/mcp/mcp-client';

/**
 * GET /api/mcp/servers
 * List all MCP servers and their tools
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeTools = searchParams.get('include_tools') === 'true';
    const testConnection = searchParams.get('test_connection') === 'true';

    const servers = getEnabledMCPServers();

    const serversWithStatus = await Promise.all(
      servers.map(async (server) => {
        const client = createMCPClient(server);
        const serverInfo = client.getServerInfo();

        let connectionStatus = undefined;
        if (testConnection) {
          connectionStatus = await client.testConnection();
        }

        return {
          ...serverInfo,
          endpoint: server.endpoint,
          authentication_type: server.authentication.type,
          tools: includeTools ? server.tools : undefined,
          connection_status: connectionStatus,
          metadata: server.metadata,
        };
      })
    );

    return NextResponse.json({
      servers: serversWithStatus,
      total: serversWithStatus.length,
    });
  } catch (error: any) {
    console.error('[MCP] Error listing servers:', error);
    return NextResponse.json(
      { error: 'Failed to list MCP servers', message: error.message },
      { status: 500 }
    );
  }
}
