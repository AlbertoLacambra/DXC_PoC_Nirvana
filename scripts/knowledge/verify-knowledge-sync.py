#!/usr/bin/env python3
"""
Knowledge Portal - Verification Script
=======================================
Verifies that knowledge base sync was successful

Checks:
- Database connectivity
- Table existence and schema
- Document count
- Embedding coverage
- Index health
"""

import os
import sys
from typing import Dict, List
import psycopg2
from datetime import datetime, timedelta


class KnowledgeVerifier:
    """Verifies knowledge base integrity"""
    
    def __init__(self):
        self.conn = self._connect_database()
        self.cursor = self.conn.cursor()
        self.checks_passed = []
        self.checks_failed = []
    
    def _connect_database(self) -> psycopg2.extensions.connection:
        """Connect to PostgreSQL"""
        try:
            conn = psycopg2.connect(
                host=os.getenv('POSTGRES_HOST'),
                port=os.getenv('POSTGRES_PORT', '5432'),
                database=os.getenv('POSTGRES_DB', 'nirvana_knowledge'),
                user=os.getenv('POSTGRES_USER'),
                password=os.getenv('POSTGRES_PASSWORD'),
                sslmode='require'
            )
            print("✓ Database connection established")
            return conn
        except Exception as e:
            print(f"✗ Database connection failed: {e}")
            sys.exit(1)
    
    def check_extensions(self) -> bool:
        """Check required extensions are installed"""
        print("\n📦 Checking extensions...")
        
        self.cursor.execute("""
            SELECT extname, extversion 
            FROM pg_extension 
            WHERE extname IN ('vector', 'uuid-ossp')
        """)
        
        extensions = {row[0]: row[1] for row in self.cursor.fetchall()}
        
        if 'vector' in extensions and 'uuid-ossp' in extensions:
            print(f"  ✓ vector: {extensions['vector']}")
            print(f"  ✓ uuid-ossp: {extensions['uuid-ossp']}")
            self.checks_passed.append("Extensions installed")
            return True
        else:
            print(f"  ✗ Missing extensions")
            self.checks_failed.append("Extensions missing")
            return False
    
    def check_tables(self) -> bool:
        """Check required tables exist"""
        print("\n📋 Checking tables...")
        
        self.cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('knowledge_chunks', 'source_documents', 'query_logs')
        """)
        
        tables = [row[0] for row in self.cursor.fetchall()]
        
        expected_tables = ['knowledge_chunks', 'source_documents', 'query_logs']
        missing = set(expected_tables) - set(tables)
        
        if not missing:
            for table in tables:
                print(f"  ✓ {table}")
            self.checks_passed.append("All tables exist")
            return True
        else:
            print(f"  ✗ Missing tables: {missing}")
            self.checks_failed.append(f"Missing tables: {missing}")
            return False
    
    def check_document_count(self) -> bool:
        """Check document and chunk counts"""
        print("\n📊 Checking document counts...")
        
        # Source documents
        self.cursor.execute("SELECT COUNT(*) FROM source_documents")
        doc_count = self.cursor.fetchone()[0]
        
        # Chunks
        self.cursor.execute("SELECT COUNT(*) FROM knowledge_chunks")
        chunk_count = self.cursor.fetchone()[0]
        
        # Chunks with embeddings
        self.cursor.execute("SELECT COUNT(*) FROM knowledge_chunks WHERE embedding IS NOT NULL")
        embedded_count = self.cursor.fetchone()[0]
        
        print(f"  ✓ Source documents: {doc_count}")
        print(f"  ✓ Total chunks: {chunk_count}")
        print(f"  ✓ Chunks with embeddings: {embedded_count}")
        
        if chunk_count > 0:
            embedding_coverage = (embedded_count / chunk_count) * 100
            print(f"  ✓ Embedding coverage: {embedding_coverage:.1f}%")
            
            if embedding_coverage >= 95:
                self.checks_passed.append(f"Good embedding coverage ({embedding_coverage:.1f}%)")
            else:
                self.checks_failed.append(f"Low embedding coverage ({embedding_coverage:.1f}%)")
                return False
        
        if doc_count > 0 and chunk_count > 0:
            self.checks_passed.append(f"{doc_count} documents, {chunk_count} chunks")
            return True
        else:
            print(f"  ⚠ Warning: No documents or chunks found")
            self.checks_failed.append("No documents indexed")
            return False
    
    def check_recent_sync(self) -> bool:
        """Check if sync happened recently"""
        print("\n⏰ Checking recent sync...")
        
        self.cursor.execute("""
            SELECT MAX(last_synced) 
            FROM source_documents
        """)
        
        last_sync = self.cursor.fetchone()[0]
        
        if last_sync:
            time_since = datetime.now(last_sync.tzinfo) - last_sync
            print(f"  ✓ Last sync: {last_sync}")
            print(f"  ✓ Time since: {time_since}")
            
            if time_since < timedelta(hours=24):
                self.checks_passed.append("Recent sync detected")
                return True
            else:
                print(f"  ⚠ Warning: Last sync was {time_since.days} days ago")
                self.checks_failed.append("Sync is stale")
                return False
        else:
            print(f"  ✗ No sync timestamp found")
            self.checks_failed.append("No sync timestamp")
            return False
    
    def check_index_health(self) -> bool:
        """Check database indexes"""
        print("\n🔍 Checking indexes...")
        
        self.cursor.execute("""
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            AND tablename IN ('knowledge_chunks', 'source_documents')
            ORDER BY tablename, indexname
        """)
        
        indexes = self.cursor.fetchall()
        
        # Check for critical indexes
        critical_indexes = [
            'idx_embedding',
            'idx_source_type',
            'idx_category'
        ]
        
        found_indexes = [idx[0] for idx in indexes]
        missing_critical = set(critical_indexes) - set(found_indexes)
        
        print(f"  ✓ Total indexes: {len(indexes)}")
        
        if not missing_critical:
            print(f"  ✓ All critical indexes present")
            self.checks_passed.append("Indexes healthy")
            return True
        else:
            print(f"  ✗ Missing critical indexes: {missing_critical}")
            self.checks_failed.append(f"Missing indexes: {missing_critical}")
            return False
    
    def check_categories(self) -> bool:
        """Check category distribution"""
        print("\n📂 Checking categories...")
        
        self.cursor.execute("""
            SELECT 
                category,
                COUNT(*) as count,
                ROUND(AVG(quality_score)::numeric, 2) as avg_quality
            FROM knowledge_chunks
            WHERE category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC
        """)
        
        categories = self.cursor.fetchall()
        
        if categories:
            print(f"  Category distribution:")
            for cat, count, avg_quality in categories:
                print(f"    - {cat}: {count} chunks (quality: {avg_quality})")
            self.checks_passed.append(f"{len(categories)} categories")
            return True
        else:
            print(f"  ⚠ No categories found")
            return True  # Not critical
    
    def check_sync_errors(self) -> bool:
        """Check for sync errors"""
        print("\n🚨 Checking for sync errors...")
        
        self.cursor.execute("""
            SELECT 
                file_path,
                sync_error
            FROM source_documents
            WHERE sync_status = 'failed'
        """)
        
        errors = self.cursor.fetchall()
        
        if not errors:
            print(f"  ✓ No sync errors")
            self.checks_passed.append("No sync errors")
            return True
        else:
            print(f"  ✗ {len(errors)} failed syncs:")
            for file_path, error in errors:
                print(f"    - {file_path}: {error}")
            self.checks_failed.append(f"{len(errors)} sync errors")
            return False
    
    def run_all_checks(self) -> bool:
        """Run all verification checks"""
        print("="*60)
        print("🔍 Knowledge Base Verification")
        print("="*60)
        
        checks = [
            self.check_extensions,
            self.check_tables,
            self.check_document_count,
            self.check_recent_sync,
            self.check_index_health,
            self.check_categories,
            self.check_sync_errors,
        ]
        
        all_passed = True
        for check in checks:
            try:
                if not check():
                    all_passed = False
            except Exception as e:
                print(f"  ✗ Check failed with error: {e}")
                self.checks_failed.append(f"{check.__name__}: {e}")
                all_passed = False
        
        return all_passed
    
    def print_summary(self, all_passed: bool):
        """Print verification summary"""
        print("\n" + "="*60)
        print("📊 Verification Summary")
        print("="*60)
        
        if self.checks_passed:
            print(f"\n✅ Passed ({len(self.checks_passed)}):")
            for check in self.checks_passed:
                print(f"  • {check}")
        
        if self.checks_failed:
            print(f"\n❌ Failed ({len(self.checks_failed)}):")
            for check in self.checks_failed:
                print(f"  • {check}")
        
        print("\n" + "="*60)
        if all_passed:
            print("✓ All checks passed!")
            print("="*60)
        else:
            print("✗ Some checks failed")
            print("="*60)
    
    def close(self):
        """Close database connection"""
        if self.cursor:
            self.cursor.close()
        if self.conn:
            self.conn.close()


def main():
    """Main entry point"""
    verifier = KnowledgeVerifier()
    
    try:
        all_passed = verifier.run_all_checks()
        verifier.print_summary(all_passed)
        
        if not all_passed:
            sys.exit(1)
    finally:
        verifier.close()


if __name__ == '__main__':
    main()
