/**
 * MCP Client
 * 
 * Provides a unified interface for interacting with MCP servers.
 * Handles authentication, request/response formatting, error handling,
 * and tool execution.
 */

import { MCPServerConfig, MCPTool, MCPToolParameter } from './mcp-registry';

export interface MCPToolExecutionRequest {
  server_id: string;
  tool_name: string;
  parameters: Record<string, any>;
  user_context?: {
    user_id: string;
    roles: string[];
  };
}

export interface MCPToolExecutionResponse {
  success: boolean;
  result?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  execution_time_ms: number;
  server_id: string;
  tool_name: string;
}

export class MCPClient {
  private serverConfig: MCPServerConfig;

  constructor(serverConfig: MCPServerConfig) {
    this.serverConfig = serverConfig;
  }

  /**
   * Execute a tool on the MCP server
   */
  async executeTool(
    toolName: string,
    parameters: Record<string, any>,
    userContext?: { user_id: string; roles: string[] }
  ): Promise<MCPToolExecutionResponse> {
    const startTime = Date.now();

    try {
      // Find the tool definition
      const tool = this.serverConfig.tools.find(t => t.name === toolName);
      if (!tool) {
        throw new Error(`Tool '${toolName}' not found in server '${this.serverConfig.name}'`);
      }

      // Validate parameters
      this.validateParameters(tool, parameters);

      // Build request headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add authentication
      if (this.serverConfig.authentication.type === 'bearer') {
        const token = this.serverConfig.authentication.credentials?.token;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else if (this.serverConfig.authentication.type === 'api-key') {
        const apiKey = this.serverConfig.authentication.credentials?.apiKey;
        if (apiKey) {
          headers['X-API-Key'] = apiKey;
        }
      }

      // Execute request
      const response = await fetch(`${this.serverConfig.endpoint}/tools/${toolName}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          parameters,
          user_context: userContext,
        }),
      });

      const executionTimeMs = Date.now() - startTime;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        return {
          success: false,
          error: {
            code: `HTTP_${response.status}`,
            message: errorData.message || 'MCP server request failed',
            details: errorData,
          },
          execution_time_ms: executionTimeMs,
          server_id: this.serverConfig.id,
          tool_name: toolName,
        };
      }

      const result = await response.json();

      return {
        success: true,
        result,
        execution_time_ms: executionTimeMs,
        server_id: this.serverConfig.id,
        tool_name: toolName,
      };
    } catch (error: any) {
      const executionTimeMs = Date.now() - startTime;
      return {
        success: false,
        error: {
          code: 'EXECUTION_ERROR',
          message: error.message || 'Unknown error occurred',
          details: error,
        },
        execution_time_ms: executionTimeMs,
        server_id: this.serverConfig.id,
        tool_name: toolName,
      };
    }
  }

  /**
   * Validate tool parameters against tool definition
   */
  private validateParameters(tool: MCPTool, parameters: Record<string, any>): void {
    // Check required parameters
    const missingParams = tool.parameters
      .filter(param => param.required)
      .filter(param => !(param.name in parameters))
      .map(param => param.name);

    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    // Validate parameter types
    for (const paramDef of tool.parameters) {
      if (paramDef.name in parameters) {
        const value = parameters[paramDef.name];
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        
        if (actualType !== paramDef.type && value !== null && value !== undefined) {
          throw new Error(
            `Parameter '${paramDef.name}' expected type '${paramDef.type}' but got '${actualType}'`
          );
        }

        // Validate enum values
        if (paramDef.enum && !paramDef.enum.includes(value)) {
          throw new Error(
            `Parameter '${paramDef.name}' must be one of: ${paramDef.enum.join(', ')}`
          );
        }
      }
    }
  }

  /**
   * Test connectivity to the MCP server
   */
  async testConnection(): Promise<{ success: boolean; message: string; latency_ms?: number }> {
    const startTime = Date.now();

    try {
      const headers: Record<string, string> = {};

      // Add authentication
      if (this.serverConfig.authentication.type === 'bearer') {
        const token = this.serverConfig.authentication.credentials?.token;
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } else if (this.serverConfig.authentication.type === 'api-key') {
        const apiKey = this.serverConfig.authentication.credentials?.apiKey;
        if (apiKey) {
          headers['X-API-Key'] = apiKey;
        }
      }

      const response = await fetch(`${this.serverConfig.endpoint}/health`, {
        method: 'GET',
        headers,
      });

      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          message: 'Connection successful',
          latency_ms: latencyMs,
        };
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.statusText}`,
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Connection error: ${error.message}`,
      };
    }
  }

  /**
   * Get server information
   */
  getServerInfo(): {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    tool_count: number;
    version: string;
  } {
    return {
      id: this.serverConfig.id,
      name: this.serverConfig.name,
      description: this.serverConfig.description,
      enabled: this.serverConfig.enabled,
      tool_count: this.serverConfig.tools.length,
      version: this.serverConfig.metadata.version,
    };
  }

  /**
   * Get available tools
   */
  getAvailableTools(): MCPTool[] {
    return this.serverConfig.tools;
  }
}

/**
 * Factory function to create MCP client instances
 */
export function createMCPClient(serverConfig: MCPServerConfig): MCPClient {
  return new MCPClient(serverConfig);
}

/**
 * Execute tool with automatic server selection
 */
export async function executeToolOnServer(
  request: MCPToolExecutionRequest,
  serverConfig: MCPServerConfig
): Promise<MCPToolExecutionResponse> {
  const client = createMCPClient(serverConfig);
  return client.executeTool(
    request.tool_name,
    request.parameters,
    request.user_context
  );
}
