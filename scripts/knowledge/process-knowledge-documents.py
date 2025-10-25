#!/usr/bin/env python3
"""
Knowledge Portal - Document Processing Script
==============================================
Processes documentation files, generates embeddings, and stores in PostgreSQL

Features:
- Smart chunking by file type (markdown, code, yaml)
- Deduplication by content hash
- Git metadata extraction
- Batch embedding generation
- Progress tracking
"""

import os
import sys
import hashlib
import json
import argparse
from pathlib import Path
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass, asdict
from datetime import datetime

# Third-party imports
try:
    from openai import AzureOpenAI
    from langchain_text_splitters import (
        RecursiveCharacterTextSplitter,
        Language,
        MarkdownTextSplitter
    )
    import psycopg2
    from psycopg2.extras import execute_values
    import git
    from tqdm import tqdm
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Install with: pip install openai langchain-text-splitters psycopg2-binary gitpython tqdm")
    sys.exit(1)


@dataclass
class DocumentChunk:
    """Represents a chunk of processed document"""
    content: str
    content_hash: str
    source_type: str
    source_url: str
    file_path: str
    repository: str
    category: str
    tags: List[str]
    language: str
    version: str
    commit_sha: str
    branch: str
    author: str
    embedding: Optional[List[float]] = None
    quality_score: float = 0.0


class KnowledgeProcessor:
    """Main processor for knowledge documents"""
    
    # Chunking configurations by file type
    CHUNK_CONFIGS = {
        'markdown': {
            'chunk_size': 800,
            'chunk_overlap': 100,
            'splitter_type': 'markdown'
        },
        'python': {
            'chunk_size': 600,
            'chunk_overlap': 50,
            'splitter_type': 'language'
        },
        'typescript': {
            'chunk_size': 600,
            'chunk_overlap': 50,
            'splitter_type': 'language'
        },
        'yaml': {
            'chunk_size': 400,
            'chunk_overlap': 50,
            'splitter_type': 'recursive'
        },
        'json': {
            'chunk_size': 400,
            'chunk_overlap': 50,
            'splitter_type': 'recursive'
        },
    }
    
    def __init__(self, config: Dict):
        """Initialize processor with configuration"""
        self.config = config
        self.repo = self._init_git_repo()
        self.openai_client = self._init_openai()
        self.db_conn = self._init_database()
        
    def _init_git_repo(self) -> Optional[git.Repo]:
        """Initialize Git repository"""
        try:
            repo = git.Repo(search_parent_directories=True)
            print(f"✓ Git repository: {repo.working_dir}")
            return repo
        except git.InvalidGitRepositoryError:
            print("⚠ Warning: Not a git repository, metadata will be limited")
            return None
    
    def _init_openai(self) -> AzureOpenAI:
        """Initialize Azure OpenAI client"""
        client = AzureOpenAI(
            api_key=self.config['azure_openai_key'],
            azure_endpoint=self.config['azure_openai_endpoint'],
            api_version='2024-02-01'
        )
        print(f"✓ Azure OpenAI initialized")
        return client
    
    def _init_database(self) -> psycopg2.extensions.connection:
        """Initialize PostgreSQL connection"""
        conn = psycopg2.connect(
            host=self.config['postgres_host'],
            port=self.config['postgres_port'],
            database=self.config['postgres_db'],
            user=self.config['postgres_user'],
            password=self.config['postgres_password'],
            sslmode='require'
        )
        print(f"✓ Database connected: {self.config['postgres_db']}")
        return conn
    
    def process_file(self, file_path: str) -> List[DocumentChunk]:
        """Process a single file and return chunks"""
        print(f"\n📄 Processing: {file_path}")
        
        # Read file content
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"  ✗ Error reading file: {e}")
            return []
        
        # Calculate content hash
        content_hash = hashlib.sha256(content.encode()).hexdigest()
        
        # Check if already processed
        if self._is_already_processed(file_path, content_hash):
            print(f"  ↷ Skipping (already processed)")
            return []
        
        # Extract metadata
        metadata = self._extract_metadata(file_path)
        
        # Chunk content
        chunks_text = self._chunk_content(file_path, content)
        print(f"  ✓ Created {len(chunks_text)} chunks")
        
        # Create DocumentChunk objects
        chunks = []
        for chunk_text in chunks_text:
            chunk_hash = hashlib.sha256(chunk_text.encode()).hexdigest()
            
            chunk = DocumentChunk(
                content=chunk_text,
                content_hash=chunk_hash,
                source_type=metadata['source_type'],
                source_url=metadata['source_url'],
                file_path=file_path,
                repository=metadata['repository'],
                category=metadata['category'],
                tags=metadata['tags'],
                language=metadata['language'],
                version=metadata.get('version', ''),
                commit_sha=metadata.get('commit_sha', ''),
                branch=metadata.get('branch', 'master'),
                author=metadata.get('author', ''),
                quality_score=self._calculate_quality_score(chunk_text)
            )
            chunks.append(chunk)
        
        return chunks
    
    def _chunk_content(self, file_path: str, content: str) -> List[str]:
        """Chunk content based on file type"""
        ext = Path(file_path).suffix.lstrip('.')
        
        # Determine chunking strategy
        if ext == 'md':
            config = self.CHUNK_CONFIGS['markdown']
            splitter = MarkdownTextSplitter(
                chunk_size=config['chunk_size'],
                chunk_overlap=config['chunk_overlap']
            )
        elif ext == 'py':
            config = self.CHUNK_CONFIGS['python']
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=Language.PYTHON,
                chunk_size=config['chunk_size'],
                chunk_overlap=config['chunk_overlap']
            )
        elif ext in ['ts', 'tsx', 'js', 'jsx']:
            config = self.CHUNK_CONFIGS['typescript']
            splitter = RecursiveCharacterTextSplitter.from_language(
                language=Language.JS,
                chunk_size=config['chunk_size'],
                chunk_overlap=config['chunk_overlap']
            )
        elif ext in ['yaml', 'yml']:
            config = self.CHUNK_CONFIGS['yaml']
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=config['chunk_size'],
                chunk_overlap=config['chunk_overlap'],
                separators=['\n---\n', '\n\n', '\n', ' ']
            )
        else:
            # Default recursive splitting
            splitter = RecursiveCharacterTextSplitter(
                chunk_size=500,
                chunk_overlap=50
            )
        
        return splitter.split_text(content)
    
    def _extract_metadata(self, file_path: str) -> Dict:
        """Extract metadata from file and git"""
        metadata = {
            'source_type': 'github',
            'source_url': '',
            'repository': 'DXC_PoC_Nirvana',
            'category': self._categorize_file(file_path),
            'tags': self._extract_tags(file_path),
            'language': self._detect_language(file_path),
        }
        
        # Git metadata
        if self.repo:
            try:
                commits = list(self.repo.iter_commits(paths=file_path, max_count=1))
                if commits:
                    commit = commits[0]
                    metadata['commit_sha'] = commit.hexsha
                    metadata['author'] = str(commit.author)
                    metadata['branch'] = self.repo.active_branch.name
                    
                    # Generate GitHub URL
                    origin_url = self.repo.remotes.origin.url
                    if 'github.com' in origin_url:
                        repo_name = origin_url.split('github.com/')[-1].replace('.git', '')
                        metadata['source_url'] = f"https://github.com/{repo_name}/blob/{metadata['branch']}/{file_path}"
            except Exception as e:
                print(f"  ⚠ Git metadata extraction failed: {e}")
        
        return metadata
    
    def _categorize_file(self, file_path: str) -> str:
        """Categorize file based on path"""
        path_lower = file_path.lower()
        
        if 'architecture' in path_lower or 'adr' in path_lower:
            return 'architecture'
        elif 'guide' in path_lower or 'tutorial' in path_lower:
            return 'guide'
        elif 'runbook' in path_lower or 'ops' in path_lower:
            return 'runbook'
        elif 'troubleshoot' in path_lower:
            return 'troubleshooting'
        elif file_path.endswith(('.py', '.ts', '.tsx', '.js', '.jsx')):
            return 'code'
        elif file_path.endswith(('.yaml', '.yml')):
            return 'configuration'
        else:
            return 'documentation'
    
    def _extract_tags(self, file_path: str) -> List[str]:
        """Extract tags from file path"""
        tags = []
        path_lower = file_path.lower()
        
        # Technology tags
        if 'azure' in path_lower:
            tags.append('azure')
        if 'terraform' in path_lower:
            tags.append('terraform')
        if 'kubernetes' in path_lower or 'k8s' in path_lower:
            tags.append('kubernetes')
        if 'dify' in path_lower:
            tags.append('dify')
        if 'fastapi' in path_lower:
            tags.append('fastapi')
        if 'nextjs' in path_lower or 'next.js' in path_lower:
            tags.append('nextjs')
        
        # Category tags
        if 'docs/' in file_path:
            tags.append('documentation')
        if 'apps/' in file_path:
            tags.append('application')
        if 'scripts/' in file_path:
            tags.append('automation')
        
        return tags
    
    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        ext = Path(file_path).suffix.lstrip('.')
        
        language_map = {
            'md': 'markdown',
            'py': 'python',
            'ts': 'typescript',
            'tsx': 'typescript',
            'js': 'javascript',
            'jsx': 'javascript',
            'yaml': 'yaml',
            'yml': 'yaml',
            'json': 'json',
            'sh': 'shell',
            'bash': 'shell',
            'sql': 'sql',
            'tf': 'hcl',
        }
        
        return language_map.get(ext, 'text')
    
    def _calculate_quality_score(self, content: str) -> float:
        """Calculate quality score for content"""
        score = 0.5  # Base score
        
        # Length (prefer moderate length)
        length = len(content)
        if 200 <= length <= 1000:
            score += 0.2
        elif length < 100:
            score -= 0.1
        
        # Code blocks (good for documentation)
        if '```' in content:
            score += 0.1
        
        # Headers (good structure)
        if content.count('#') >= 1:
            score += 0.1
        
        # Links (contextual references)
        if '[' in content and '](' in content:
            score += 0.05
        
        # Clamp between 0 and 1
        return max(0.0, min(1.0, score))
    
    def _is_already_processed(self, file_path: str, content_hash: str) -> bool:
        """Check if file with this hash is already processed"""
        cursor = self.db_conn.cursor()
        cursor.execute(
            "SELECT 1 FROM source_documents WHERE file_path = %s AND content_hash = %s",
            (file_path, content_hash)
        )
        result = cursor.fetchone()
        cursor.close()
        return result is not None
    
    def generate_embeddings(self, chunks: List[DocumentChunk]) -> List[DocumentChunk]:
        """Generate embeddings for chunks"""
        if not chunks:
            return chunks
        
        print(f"  🔮 Generating embeddings for {len(chunks)} chunks...")
        
        # Extract texts
        texts = [chunk.content for chunk in chunks]
        
        # Batch processing (Azure OpenAI has limits)
        batch_size = 100
        all_embeddings = []
        
        for i in range(0, len(texts), batch_size):
            batch = texts[i:i+batch_size]
            try:
                response = self.openai_client.embeddings.create(
                    model=self.config['embedding_model'],
                    input=batch
                )
                embeddings = [item.embedding for item in response.data]
                all_embeddings.extend(embeddings)
            except Exception as e:
                print(f"  ✗ Embedding generation failed: {e}")
                # Fill with None for failed batches
                all_embeddings.extend([None] * len(batch))
        
        # Assign embeddings to chunks
        for chunk, embedding in zip(chunks, all_embeddings):
            chunk.embedding = embedding
        
        print(f"  ✓ Embeddings generated")
        return chunks
    
    def save_to_database(self, chunks: List[DocumentChunk], file_path: str):
        """Save chunks to PostgreSQL"""
        if not chunks:
            return
        
        print(f"  💾 Saving {len(chunks)} chunks to database...")
        
        cursor = self.db_conn.cursor()
        
        try:
            # Insert chunks
            insert_query = """
            INSERT INTO knowledge_chunks (
                content, content_hash, embedding,
                source_type, source_url, file_path, repository,
                category, tags, language, version, commit_sha, branch, author,
                quality_score
            ) VALUES %s
            ON CONFLICT (content_hash, file_path) DO UPDATE SET
                updated_at = NOW(),
                usage_count = knowledge_chunks.usage_count
            """
            
            values = [
                (
                    chunk.content,
                    chunk.content_hash,
                    chunk.embedding,
                    chunk.source_type,
                    chunk.source_url,
                    chunk.file_path,
                    chunk.repository,
                    chunk.category,
                    chunk.tags,
                    chunk.language,
                    chunk.version,
                    chunk.commit_sha,
                    chunk.branch,
                    chunk.author,
                    chunk.quality_score
                )
                for chunk in chunks if chunk.embedding is not None
            ]
            
            if values:
                execute_values(cursor, insert_query, values)
            
            # Update source_documents
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            content_hash = hashlib.sha256(content.encode()).hexdigest()
            
            cursor.execute("""
                INSERT INTO source_documents (
                    file_path, repository, content, content_hash,
                    chunks_count, sync_status
                ) VALUES (%s, %s, %s, %s, %s, 'synced')
                ON CONFLICT (file_path) DO UPDATE SET
                    content = EXCLUDED.content,
                    content_hash = EXCLUDED.content_hash,
                    chunks_count = EXCLUDED.chunks_count,
                    last_synced = NOW(),
                    sync_status = 'synced'
            """, (
                file_path,
                chunks[0].repository,
                content,
                content_hash,
                len(chunks)
            ))
            
            self.db_conn.commit()
            print(f"  ✓ Saved to database")
            
        except Exception as e:
            self.db_conn.rollback()
            print(f"  ✗ Database error: {e}")
        finally:
            cursor.close()
    
    def process_files(self, file_paths: List[str]):
        """Process multiple files"""
        print(f"\n{'='*60}")
        print(f"Processing {len(file_paths)} files")
        print(f"{'='*60}")
        
        for file_path in tqdm(file_paths, desc="Processing files"):
            try:
                chunks = self.process_file(file_path)
                if chunks:
                    chunks = self.generate_embeddings(chunks)
                    self.save_to_database(chunks, file_path)
            except Exception as e:
                print(f"\n✗ Error processing {file_path}: {e}")
                continue
        
        print(f"\n{'='*60}")
        print(f"✓ Processing complete!")
        print(f"{'='*60}")
    
    def close(self):
        """Close connections"""
        if self.db_conn:
            self.db_conn.close()
            print("✓ Database connection closed")


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description='Process knowledge documents')
    parser.add_argument('--files', type=str, help='File with list of files to process')
    parser.add_argument('--pattern', type=str, help='Glob pattern for files')
    parser.add_argument('--output', type=str, help='Output JSON file (optional)')
    
    args = parser.parse_args()
    
    # Load configuration from environment
    config = {
        'azure_openai_key': os.getenv('AZURE_OPENAI_API_KEY'),
        'azure_openai_endpoint': os.getenv('AZURE_OPENAI_ENDPOINT'),
        'embedding_model': os.getenv('EMBEDDING_MODEL', 'text-embedding-3-large'),
        'postgres_host': os.getenv('POSTGRES_HOST'),
        'postgres_port': os.getenv('POSTGRES_PORT', '5432'),
        'postgres_db': os.getenv('POSTGRES_DB', 'nirvana_knowledge'),
        'postgres_user': os.getenv('POSTGRES_USER'),
        'postgres_password': os.getenv('POSTGRES_PASSWORD'),
    }
    
    # Validate configuration
    required = ['azure_openai_key', 'azure_openai_endpoint', 'postgres_host', 'postgres_user', 'postgres_password']
    missing = [k for k in required if not config.get(k)]
    if missing:
        print(f"✗ Missing required environment variables: {', '.join(missing)}")
        sys.exit(1)
    
    # Get files to process
    if args.files:
        with open(args.files, 'r') as f:
            file_paths = [line.strip() for line in f if line.strip()]
    elif args.pattern:
        from glob import glob
        file_paths = glob(args.pattern, recursive=True)
    else:
        print("✗ Either --files or --pattern must be specified")
        sys.exit(1)
    
    # Process files
    processor = KnowledgeProcessor(config)
    try:
        processor.process_files(file_paths)
    finally:
        processor.close()


if __name__ == '__main__':
    main()
