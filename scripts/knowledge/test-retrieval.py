#!/usr/bin/env python3
"""
Test retrieval queries against the knowledge base.
This script performs vector similarity search using pgvector.
"""

import os
import sys
from typing import List, Dict, Any
import psycopg2
from psycopg2.extras import RealDictCursor
from openai import AzureOpenAI

class KnowledgeRetrieval:
    def __init__(self):
        """Initialize connections to PostgreSQL and Azure OpenAI."""
        # PostgreSQL connection
        self.conn = psycopg2.connect(
            host=os.getenv('POSTGRES_HOST'),
            port=int(os.getenv('POSTGRES_PORT', '5432')),
            database=os.getenv('POSTGRES_DB', 'nirvana_knowledge'),
            user=os.getenv('POSTGRES_USER'),
            password=os.getenv('POSTGRES_PASSWORD')
        )
        
        # Azure OpenAI client for generating query embeddings
        self.openai_client = AzureOpenAI(
            api_key=os.getenv('AZURE_OPENAI_API_KEY'),
            azure_endpoint=os.getenv('AZURE_OPENAI_ENDPOINT'),
            api_version='2024-02-01'
        )
        
        self.embedding_model = os.getenv('EMBEDDING_MODEL', 'text-embedding-3-large')
        
    def generate_query_embedding(self, query: str) -> List[float]:
        """Generate embedding for search query."""
        try:
            response = self.openai_client.embeddings.create(
                model=self.embedding_model,
                input=query
            )
            return response.data[0].embedding
        except Exception as e:
            print(f"❌ Error generating embedding: {e}")
            return None
    
    def search_chunks(
        self, 
        query: str, 
        top_k: int = 5, 
        score_threshold: float = 0.70,
        category_filter: str = None
    ) -> List[Dict[str, Any]]:
        """
        Search for relevant chunks using vector similarity.
        
        Args:
            query: Search query text
            top_k: Number of results to return
            score_threshold: Minimum similarity score (0-1)
            category_filter: Optional category to filter by
        """
        print(f"\n🔍 Searching for: '{query}'")
        print(f"   Parameters: top_k={top_k}, threshold={score_threshold}")
        
        # Generate query embedding
        query_embedding = self.generate_query_embedding(query)
        if not query_embedding:
            return []
        
        # Build SQL query
        sql = """
        SELECT 
            content,
            file_path,
            repository,
            category,
            tags,
            language,
            quality_score,
            1 - (embedding <=> %s::vector) AS similarity_score
        FROM knowledge_chunks
        WHERE embedding IS NOT NULL
        """
        
        params = [query_embedding]
        
        if category_filter:
            sql += " AND category = %s"
            params.append(category_filter)
        
        sql += """
        ORDER BY embedding <=> %s::vector
        LIMIT %s
        """
        params.append(query_embedding)
        params.append(top_k)
        
        # Execute query
        cursor = self.conn.cursor(cursor_factory=RealDictCursor)
        cursor.execute(sql, params)
        results = cursor.fetchall()
        cursor.close()
        
        # Filter by score threshold
        filtered_results = [r for r in results if r['similarity_score'] >= score_threshold]
        
        print(f"   Found {len(results)} results, {len(filtered_results)} above threshold")
        
        # Show top scores even if below threshold for debugging
        if results and not filtered_results:
            top_scores = [r['similarity_score'] for r in results[:3]]
            print(f"   ⚠️  Top scores: {', '.join([f'{s:.4f}' for s in top_scores])}")
        
        # Return all results for display (threshold filter for production use)
        return results
    
    def display_results(self, results: List[Dict[str, Any]], threshold: float = 0.70):
        """Display search results in a readable format."""
        if not results:
            print("\n❌ No results found")
            return
        
        # Separate results by threshold
        above_threshold = [r for r in results if r['similarity_score'] >= threshold]
        below_threshold = [r for r in results if r['similarity_score'] < threshold]
        
        if above_threshold:
            print(f"\n✅ {len(above_threshold)} Results Above Threshold ({threshold}):\n")
            print("=" * 120)
            self._print_results(above_threshold)
        
        if below_threshold:
            print(f"\n⚠️  {len(below_threshold)} Results Below Threshold ({threshold}) [For Analysis]:\n")
            print("=" * 120)
            self._print_results(below_threshold[:3])  # Show top 3 below threshold
        
        if not above_threshold:
            print(f"\n❌ No results found above threshold {threshold}")
            print(f"   Consider lowering threshold - best score was {results[0]['similarity_score']:.4f}")
    
    def _print_results(self, results: List[Dict[str, Any]]):
        """Helper to print results."""
    def _print_results(self, results: List[Dict[str, Any]]):
        """Helper to print results."""
        
        for i, result in enumerate(results, 1):
            print(f"\n{i}. 📄 {result['file_path']}")
            print(f"   📊 Score: {result['similarity_score']:.4f}")
            print(f"   🏷️  Category: {result['category'] or 'N/A'}")
            print(f"   🔖 Tags: {', '.join(result['tags']) if result['tags'] else 'N/A'}")
            print(f"   📝 Language: {result['language'] or 'N/A'}")
            print(f"   ⭐ Quality: {result['quality_score']:.2f}")
            print(f"\n   💬 Content Preview:")
            # Show first 300 chars
            preview = result['content'][:300].replace('\n', ' ')
            print(f"   {preview}...")
            print("   " + "-" * 116)
        
        print("\n" + "=" * 120)
    
    def run_test_queries(self):
        """Run a set of test queries to validate the knowledge base."""
        test_queries = [
            {
                "query": "¿Cómo configurar Azure OpenAI en Dify?",
                "category": None,
                "description": "Azure OpenAI configuration"
            },
            {
                "query": "Explica la arquitectura hub-spoke del proyecto",
                "category": "architecture",
                "description": "Hub-spoke architecture"
            },
            {
                "query": "¿Qué es el FinOps Optimizer y cómo funciona?",
                "category": "runbook",
                "description": "FinOps Optimizer functionality"
            },
            {
                "query": "Muestra código del componente DifyChatButton",
                "category": None,
                "description": "DifyChatButton component code"
            },
            {
                "query": "¿Cómo se configura el drift detection?",
                "category": "documentation",
                "description": "Drift detection configuration"
            }
        ]
        
        print("\n" + "=" * 120)
        print("🧪 KNOWLEDGE BASE RETRIEVAL TEST".center(120))
        print("=" * 120)
        
        for i, test in enumerate(test_queries, 1):
            print(f"\n\n{'=' * 120}")
            print(f"TEST {i}/{len(test_queries)}: {test['description']}".center(120))
            print("=" * 120)
            
            results = self.search_chunks(
                query=test['query'],
                top_k=3,
                score_threshold=0.70,
                category_filter=test['category']
            )
            
            self.display_results(results, threshold=0.70)
        
        print("\n\n" + "=" * 120)
        print("✅ TEST SUITE COMPLETED".center(120))
        print("=" * 120)
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()

def main():
    """Main entry point."""
    print("\n🚀 Starting Knowledge Base Retrieval Test\n")
    
    # Check required environment variables
    required_vars = [
        'POSTGRES_HOST', 'POSTGRES_USER', 'POSTGRES_PASSWORD',
        'AZURE_OPENAI_API_KEY', 'AZURE_OPENAI_ENDPOINT'
    ]
    
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        sys.exit(1)
    
    try:
        retrieval = KnowledgeRetrieval()
        retrieval.run_test_queries()
        retrieval.close()
        
        print("\n✅ All tests completed successfully!\n")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
