import { NextRequest, NextResponse } from 'next/server';
import { getAllMCPTools } from '@/lib/mcp/mcp-registry';

/**
 * GET /api/mcp/tools
 * List all available tools across all MCP servers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const serverId = searchParams.get('server_id');
    const search = searchParams.get('search');

    let tools = getAllMCPTools();

    // Filter by category
    if (category) {
      tools = tools.filter(tool => tool.category === category);
    }

    // Filter by server
    if (serverId) {
      tools = tools.filter(tool => tool.server_id === serverId);
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      tools = tools.filter(
        tool =>
          tool.name.toLowerCase().includes(searchLower) ||
          tool.description.toLowerCase().includes(searchLower)
      );
    }

    // Group by category
    const toolsByCategory = tools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);

    return NextResponse.json({
      tools,
      total: tools.length,
      by_category: toolsByCategory,
      categories: Object.keys(toolsByCategory),
    });
  } catch (error: any) {
    console.error('[MCP] Error listing tools:', error);
    return NextResponse.json(
      { error: 'Failed to list MCP tools', message: error.message },
      { status: 500 }
    );
  }
}
