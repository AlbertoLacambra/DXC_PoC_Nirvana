import axios, { AxiosInstance } from 'axios';

export interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DifyConversationResponse {
  conversation_id: string;
  answer: string;
  created_at: number;
}

export interface DifyConfig {
  apiKey: string;
  baseUrl?: string;
}

export class DifyClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: DifyConfig) {
    this.apiKey = config.apiKey;
    const baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_DIFY_API_URL || 'http://dify-api.dify.svc.cluster.local:5001';
    
    this.client = axios.create({
      baseURL: baseUrl,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Send a message to a Dify chat app
   */
  async sendMessage(
    query: string,
    conversationId?: string,
    user: string = 'default-user'
  ): Promise<DifyConversationResponse> {
    try {
      const response = await this.client.post('/v1/chat-messages', {
        inputs: {},
        query,
        user,
        conversation_id: conversationId,
        response_mode: 'blocking',
      });

      return response.data;
    } catch (error) {
      console.error('Error sending message to Dify:', error);
      throw error;
    }
  }

  /**
   * Query a Dify completion app (for RAG/knowledge base)
   */
  async queryKnowledge(
    query: string,
    user: string = 'default-user'
  ): Promise<any> {
    try {
      const response = await this.client.post('/v1/completion-messages', {
        inputs: {},
        query,
        user,
        response_mode: 'blocking',
      });

      return response.data;
    } catch (error) {
      console.error('Error querying knowledge base:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages
   */
  async getConversationMessages(
    conversationId: string,
    user: string = 'default-user'
  ): Promise<any> {
    try {
      const response = await this.client.get('/v1/messages', {
        params: {
          conversation_id: conversationId,
          user,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Get conversation list
   */
  async getConversations(user: string = 'default-user'): Promise<any> {
    try {
      const response = await this.client.get('/v1/conversations', {
        params: { user },
      });

      return response.data;
    } catch (error) {
      console.error('Error getting conversations:', error);
      throw error;
    }
  }
}

// Singleton instance for use in API routes
let difyClient: DifyClient | null = null;

export function getDifyClient(): DifyClient {
  if (!difyClient) {
    const apiKey = process.env.DIFY_API_KEY;
    if (!apiKey) {
      throw new Error('DIFY_API_KEY environment variable is not set');
    }
    difyClient = new DifyClient({ apiKey });
  }
  return difyClient;
}
