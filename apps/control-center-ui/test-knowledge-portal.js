#!/usr/bin/env node

/**
 * Script de prueba para verificar conexión a Knowledge Portal
 * Prueba: PostgreSQL + Azure OpenAI
 */

const { Client } = require('pg');
const { AzureOpenAI } = require('openai');

async function testKnowledgePortal() {
  console.log('🧪 Testing Knowledge Portal Connection...\n');

  // 1. Test PostgreSQL Connection
  console.log('📊 Testing PostgreSQL connection...');
  const dbClient = new Client({
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    database: process.env.POSTGRES_DB || 'nirvana_knowledge',
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await dbClient.connect();
    console.log('✅ PostgreSQL connected successfully!');

    // Count chunks
    const countResult = await dbClient.query(
      'SELECT COUNT(*) as total FROM knowledge_chunks WHERE embedding IS NOT NULL'
    );
    console.log(`   📄 Chunks indexed: ${countResult.rows[0].total}`);

    // Sample chunk
    const sampleResult = await dbClient.query(
      'SELECT file_path, source_type FROM knowledge_chunks LIMIT 1'
    );
    if (sampleResult.rows.length > 0) {
      console.log(`   📁 Sample file: ${sampleResult.rows[0].file_path}`);
      console.log(`   📝 Source type: ${sampleResult.rows[0].source_type}`);
    }

    await dbClient.end();
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error.message);
    process.exit(1);
  }

  // 2. Test Azure OpenAI
  console.log('\n🤖 Testing Azure OpenAI connection...');
  const openaiClient = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-02-01',
  });

  try {
    const response = await openaiClient.embeddings.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'text-embedding-3-large',
      input: 'test query',
    });

    console.log('✅ Azure OpenAI connected successfully!');
    console.log(`   🔢 Embedding dimensions: ${response.data[0].embedding.length}`);
    console.log(`   📊 Model: ${process.env.AZURE_OPENAI_DEPLOYMENT}`);
  } catch (error) {
    console.error('❌ Azure OpenAI connection failed:', error.message);
    process.exit(1);
  }

  // 3. Test Full Search
  console.log('\n🔍 Testing full search flow...');
  try {
    const dbClient2 = new Client({
      host: process.env.POSTGRES_HOST,
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'nirvana_knowledge',
      user: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      ssl: { rejectUnauthorized: false },
    });

    await dbClient2.connect();

    // Generate embedding
    const queryText = '¿Cómo configurar Azure OpenAI?';
    console.log(`   ❓ Query: "${queryText}"`);

    const embeddingResponse = await openaiClient.embeddings.create({
      model: process.env.AZURE_OPENAI_DEPLOYMENT || 'text-embedding-3-large',
      input: queryText,
    });

    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search
    const searchResult = await dbClient2.query(
      `SELECT 
        file_path,
        source_type,
        1 - (embedding <=> $1::vector(3072)) AS score
      FROM knowledge_chunks
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector(3072)
      LIMIT 5`,
      [JSON.stringify(queryEmbedding)]
    );

    console.log(`   ✅ Found ${searchResult.rows.length} results:`);
    searchResult.rows.forEach((row, i) => {
      console.log(`      ${i + 1}. ${row.file_path} (${(row.score * 100).toFixed(1)}%)`);
    });

    await dbClient2.end();
  } catch (error) {
    console.error('❌ Search test failed:', error.message);
    process.exit(1);
  }

  console.log('\n✅ All tests passed! Knowledge Portal is ready to use.');
  console.log('\n🌐 Access the search UI at: http://localhost:3001/knowledge-search');
}

// Load env vars from .env.local
require('dotenv').config({ path: '.env.local' });

testKnowledgePortal();
