import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

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
// POST /api/agent-hub/chatmodes/[id]/sessions/[sessionId]/message
// =====================================================
// Send message to chat session and get AI response

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string; sessionId: string } }
) {
  try {
    const { id: chatModeId, sessionId } = params;
    const body = await request.json();
    const { message } = body;
    
    // Validate UUID formats
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(chatModeId)) {
      return NextResponse.json(
        { error: 'Invalid chat mode ID format', code: 'INVALID_CHATMODE_ID' },
        { status: 400 }
      );
    }
    if (!uuidRegex.test(sessionId)) {
      return NextResponse.json(
        { error: 'Invalid session ID format', code: 'INVALID_SESSION_ID' },
        { status: 400 }
      );
    }
    
    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid message',
          message: 'Message is required and must be a non-empty string',
          code: 'INVALID_MESSAGE'
        },
        { status: 400 }
      );
    }
    
    // Fetch session details
    const sessionQuery = await pool.query(
      `SELECT 
        s.*,
        cm.name as chat_mode_name,
        cm.model as chat_mode_model,
        cm.temperature as chat_mode_temperature,
        cm.max_tokens as chat_mode_max_tokens
      FROM sessions s
      LEFT JOIN chat_modes cm ON s.chat_mode_id = cm.id
      WHERE s.id = $1 AND s.chat_mode_id = $2 AND s.session_type = 'chat_mode'`,
      [sessionId, chatModeId]
    );
    
    if (sessionQuery.rows.length === 0) {
      return NextResponse.json(
        { 
          error: 'Session not found',
          message: `No active session found with ID ${sessionId} for chat mode ${chatModeId}`,
          code: 'SESSION_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    const session = sessionQuery.rows[0];
    
    if (session.status !== 'active') {
      return NextResponse.json(
        { 
          error: 'Session is not active',
          message: `Session status is: ${session.status}. Only active sessions can receive messages.`,
          code: 'SESSION_INACTIVE'
        },
        { status: 400 }
      );
    }
    
    // TODO: Verify user owns this session
    
    // Get existing messages
    const messages = session.result?.messages || [];
    
    // Add user message
    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };
    messages.push(userMessage);
    
    // TODO: Call Dify API to get AI response
    // For now, simulate response
    const simulatedResponse = generateSimulatedResponse(
      message,
      session.chat_mode_name,
      messages.length
    );
    
    const assistantMessage = {
      role: 'assistant',
      content: simulatedResponse,
      timestamp: new Date().toISOString(),
    };
    messages.push(assistantMessage);
    
    // Update session with new messages
    const updateQuery = `
      UPDATE sessions
      SET result = jsonb_set(
        COALESCE(result, '{}'::jsonb),
        '{messages}',
        $1::jsonb
      )
      WHERE id = $2
      RETURNING id
    `;
    
    await pool.query(updateQuery, [JSON.stringify(messages), sessionId]);
    
    // Audit log
    const userId = 'system'; // TODO: Get from authenticated user
    await pool.query(
      `INSERT INTO audit_logs (event_type, entity_type, entity_id, user_id, action, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'chatmode.message_sent',
        'chat_mode_session',
        sessionId,
        userId,
        'send_message',
        JSON.stringify({
          chat_mode_id: chatModeId,
          message_length: message.length,
          response_length: simulatedResponse.length,
          total_messages: messages.length,
        }),
      ]
    );
    
    return NextResponse.json({
      session_id: sessionId,
      user_message: userMessage,
      assistant_response: assistantMessage,
      message_count: messages.length,
      session_status: session.status,
      chat_mode: {
        id: chatModeId,
        name: session.chat_mode_name,
        model: session.chat_mode_model,
      },
      note: 'Response simulated until Dify API integration (available 14/11)',
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send message', 
        message: error.message,
        code: 'SEND_MESSAGE_ERROR'
      },
      { status: 500 }
    );
  }
}

// =====================================================
// Helper: Generate Simulated Response
// =====================================================

function generateSimulatedResponse(
  userMessage: string,
  chatModeName: string,
  messageCount: number
): string {
  const responses = {
    'Azure Architect': `Based on Azure best practices, I recommend considering the following architecture patterns for your requirement. First, evaluate the scalability needs and choose between serverless (Azure Functions) or containerized (AKS) approaches. For data storage, consider Azure SQL Database for relational data or Cosmos DB for global distribution. Implement proper security with Azure AD and Key Vault.`,
    
    'Terraform Planning': `Let me help you structure your Terraform configuration. I recommend organizing your code into modules for reusability. Start with a proper provider configuration, define your variables in terraform.tfvars, and use remote state with Azure Storage. Consider implementing workspaces for multiple environments.`,
    
    'DevOps Engineer': `For your CI/CD pipeline, I suggest implementing GitOps principles with Azure DevOps or GitHub Actions. Set up automated testing stages, security scanning with tools like SonarQube, and progressive deployment strategies like blue-green or canary deployments. Use Azure Key Vault for secrets management.`,
    
    'Security Specialist': `From a security perspective, you should implement defense in depth. Use Azure Security Center for threat detection, enable MFA and conditional access policies, implement network segmentation with NSGs, encrypt data at rest and in transit, and follow the principle of least privilege for all access controls.`,
    
    'Frontend Developer': `For your React application, consider using Next.js for better SEO and performance. Implement proper state management with Context API or Zustand, use TypeScript for type safety, optimize bundle size with code splitting, and follow accessibility best practices. Consider deploying to Azure Static Web Apps.`,
    
    'Backend Developer': `For your backend API, I recommend implementing a clean architecture with proper separation of concerns. Use dependency injection, implement proper error handling and logging, add request validation with Joi or Zod, implement rate limiting and caching strategies, and use OpenAPI/Swagger for API documentation.`,
    
    default: `Thank you for your message. I'm here to help you with ${chatModeName} related questions. Based on your inquiry, I recommend breaking down the problem into smaller components and addressing each systematically. What specific aspect would you like to focus on first?`,
  };
  
  // Get response template based on chat mode name
  let response = responses[chatModeName as keyof typeof responses] || responses.default;
  
  // Add contextual elements based on message
  if (userMessage.toLowerCase().includes('cost') || userMessage.toLowerCase().includes('pricing')) {
    response += `\n\nRegarding costs, always use Azure Cost Management to monitor spending, implement resource tags for cost allocation, consider reserved instances for predictable workloads, and use auto-scaling to optimize resource usage.`;
  }
  
  if (userMessage.toLowerCase().includes('performance') || userMessage.toLowerCase().includes('optimization')) {
    response += `\n\nFor performance optimization, implement caching strategies, use CDN for static content, optimize database queries with proper indexing, enable Application Insights for monitoring, and consider implementing async patterns where appropriate.`;
  }
  
  if (userMessage.toLowerCase().includes('security') || userMessage.toLowerCase().includes('authentication')) {
    response += `\n\nFor security, implement OAuth 2.0 / OpenID Connect with Azure AD, use managed identities for Azure resources, encrypt sensitive data, implement proper CORS policies, and regularly update dependencies to patch vulnerabilities.`;
  }
  
  // Add conversational element
  if (messageCount === 2) {
    response += `\n\nFeel free to ask follow-up questions or request specific examples!`;
  } else if (messageCount > 5) {
    response += `\n\nIs there anything else I can help clarify?`;
  }
  
  return response;
}
