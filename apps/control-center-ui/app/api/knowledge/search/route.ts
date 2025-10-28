import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { AzureOpenAI } from 'openai';

/**
 * API Route: POST /api/knowledge/search
 * 
 * Búsqueda semántica en Knowledge Portal
 * Genera embedding de la query y busca chunks similares en PostgreSQL
 */
export async function POST(request: NextRequest) {
  console.log('[Knowledge Search] Request received');
  
  try {
    const { query, topK = 5, threshold = 0.50, sourceType, category } = await request.json();
    console.log('[Knowledge Search] Query:', query);

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Verificar variables de entorno
    if (!process.env.AZURE_OPENAI_API_KEY) {
      console.error('[Knowledge Search] Missing AZURE_OPENAI_API_KEY');
      return NextResponse.json(
        { error: 'Azure OpenAI not configured', details: 'Missing API key' },
        { status: 500 }
      );
    }

    if (!process.env.POSTGRES_PASSWORD) {
      console.error('[Knowledge Search] Missing POSTGRES_PASSWORD');
      return NextResponse.json(
        { error: 'PostgreSQL not configured', details: 'Missing password' },
        { status: 500 }
      );
    }

    // 1. Generar embedding de la query usando Azure OpenAI
    console.log('[Knowledge Search] Creating Azure OpenAI client...');
    const openaiClient = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY!,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT!,
      apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
    });

    console.log('[Knowledge Search] Generating embedding...');
    const embeddingResponse = await openaiClient.embeddings.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'text-embedding-3-large',
      input: query,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;
    console.log('[Knowledge Search] Embedding generated:', queryEmbedding.length, 'dimensions');

    // 2. Conectar a PostgreSQL
    console.log('[Knowledge Search] Connecting to PostgreSQL...');
    console.log('[Knowledge Search] Host:', process.env.POSTGRES_HOST);
    console.log('[Knowledge Search] Database:', process.env.POSTGRES_DB);
    console.log('[Knowledge Search] User:', process.env.POSTGRES_USER);
    
    const dbClient = new Client({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'nirvana_knowledge',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      // Forzar SSL para Azure PostgreSQL
      ssl: {
        rejectUnauthorized: false,
      },
    });

    await dbClient.connect();
    console.log('[Knowledge Search] PostgreSQL connected');

    // 3. Construir query SQL con filtros
    let whereClause = 'WHERE embedding IS NOT NULL';
    const params: any[] = [JSON.stringify(queryEmbedding), topK];

    if (sourceType) {
      whereClause += ' AND source_type = $3';
      params.push(sourceType);
    }

    if (category) {
      const paramIndex = params.length + 1;
      whereClause += ` AND category = $${paramIndex}`;
      params.push(category);
    }

    const sql = `
      SELECT 
        id,
        content,
        file_path,
        source_type,
        category,
        language,
        chunk_index,
        total_chunks,
        1 - (embedding <=> $1::vector(3072)) AS score
      FROM knowledge_chunks
      ${whereClause}
      ORDER BY embedding <=> $1::vector(3072)
      LIMIT $2
    `;

    // 4. Ejecutar búsqueda
    console.log('[Knowledge Search] Executing query...');
    const startTime = Date.now();
    const result = await dbClient.query(sql, params);
    const executionTime = Date.now() - startTime;
    console.log('[Knowledge Search] Query executed in', executionTime, 'ms, found', result.rows.length, 'rows');

    await dbClient.end();

    // 5. Filtrar por threshold y retornar
    const chunks = result.rows
      .filter((row: any) => row.score >= threshold)
      .map((row: any) => ({
        id: row.id,
        content: row.content,
        file_path: row.file_path,
        source_type: row.source_type,
        category: row.category,
        language: row.language,
        chunk_index: row.chunk_index,
        total_chunks: row.total_chunks,
        score: parseFloat(row.score),
      }));

    return NextResponse.json({
      chunks,
      query,
      execution_time_ms: executionTime,
      total_results: chunks.length,
      threshold_used: threshold,
    });

  } catch (error: any) {
    console.error('[Knowledge Search] Error occurred:', error);
    console.error('[Knowledge Search] Error stack:', error.stack);
    console.error('[Knowledge Search] Error message:', error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to search knowledge base',
        details: error.message,
        type: error.constructor.name
      },
      { status: 500 }
    );
  }
}
