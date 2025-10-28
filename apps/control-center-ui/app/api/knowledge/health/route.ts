import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route: GET /api/knowledge/health
 * 
 * Health check para Knowledge Portal
 * Verifica configuración sin ejecutar búsquedas
 */
export async function GET(request: NextRequest) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    config: {
      azureOpenAI: {
        configured: !!process.env.AZURE_OPENAI_API_KEY,
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'not set',
        deployment: process.env.AZURE_OPENAI_DEPLOYMENT || 'not set',
      },
      postgres: {
        configured: !!process.env.POSTGRES_PASSWORD,
        host: process.env.POSTGRES_HOST || 'not set',
        database: process.env.POSTGRES_DB || 'not set',
        user: process.env.POSTGRES_USER || 'not set',
      },
    },
  };

  return NextResponse.json(health);
}
