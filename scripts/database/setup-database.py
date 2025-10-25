#!/usr/bin/env python3
"""
Knowledge Portal - Database Setup Script
=========================================
Creates the nirvana_knowledge database and applies the schema
"""

import os
import sys
import psycopg2
from psycopg2 import sql
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT


def print_step(step_num, message):
    """Print colored step message"""
    print(f"\n\033[1;33mStep {step_num}: {message}\033[0m")


def print_success(message):
    """Print success message"""
    print(f"\033[0;32m✓ {message}\033[0m")


def print_error(message):
    """Print error message"""
    print(f"\033[0;31m✗ {message}\033[0m")


def print_warning(message):
    """Print warning message"""
    print(f"\033[1;33m⚠ {message}\033[0m")


def get_connection_params():
    """Get connection parameters from environment"""
    params = {
        'host': os.getenv('POSTGRES_HOST', 'dify-postgres-9107e36a.postgres.database.azure.com'),
        'port': os.getenv('POSTGRES_PORT', '5432'),
        'user': os.getenv('POSTGRES_USER', 'difyadmin'),
        'password': os.getenv('POSTGRES_PASSWORD'),
        'sslmode': 'require'
    }
    
    if not params['password']:
        print_error("POSTGRES_PASSWORD environment variable not set")
        sys.exit(1)
    
    return params


def test_connection(params):
    """Test connection to PostgreSQL"""
    print_step(1, "Testing connection to PostgreSQL...")
    
    try:
        # Connect to default postgres database
        conn = psycopg2.connect(database='postgres', **params)
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()[0]
        print_success("Connection successful")
        print(f"  PostgreSQL version: {version.split(',')[0]}")
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print_error(f"Connection failed: {e}")
        print_error("Please check credentials and VPN connection")
        return False


def check_database_exists(params, db_name):
    """Check if database exists"""
    print_step(2, f"Checking if database '{db_name}' exists...")
    
    try:
        conn = psycopg2.connect(database='postgres', **params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (db_name,)
        )
        
        exists = cursor.fetchone() is not None
        cursor.close()
        conn.close()
        
        if exists:
            print_warning(f"Database '{db_name}' already exists")
            response = input("Do you want to drop and recreate it? (yes/no): ")
            return exists, response.lower() == 'yes'
        else:
            print_success(f"Database '{db_name}' does not exist (will be created)")
            return exists, False
            
    except Exception as e:
        print_error(f"Error checking database: {e}")
        return False, False


def drop_database(params, db_name):
    """Drop database"""
    print_step(3, f"Dropping database '{db_name}'...")
    
    try:
        conn = psycopg2.connect(database='postgres', **params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Terminate existing connections
        cursor.execute(f"""
            SELECT pg_terminate_backend(pg_stat_activity.pid)
            FROM pg_stat_activity
            WHERE pg_stat_activity.datname = '{db_name}'
            AND pid <> pg_backend_pid()
        """)
        
        # Drop database
        cursor.execute(sql.SQL("DROP DATABASE IF EXISTS {}").format(
            sql.Identifier(db_name)
        ))
        
        print_success(f"Database '{db_name}' dropped")
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print_error(f"Error dropping database: {e}")
        return False


def create_database(params, db_name):
    """Create database"""
    print_step(4, f"Creating database '{db_name}'...")
    
    try:
        conn = psycopg2.connect(database='postgres', **params)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        cursor.execute(sql.SQL("CREATE DATABASE {}").format(
            sql.Identifier(db_name)
        ))
        
        print_success(f"Database '{db_name}' created")
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print_error(f"Error creating database: {e}")
        return False


def enable_extensions(params, db_name):
    """Enable required extensions"""
    print_step(5, "Enabling required extensions...")
    
    try:
        conn = psycopg2.connect(database=db_name, **params)
        cursor = conn.cursor()
        
        # Enable vector extension
        cursor.execute("CREATE EXTENSION IF NOT EXISTS vector")
        print_success("Extension 'vector' enabled")
        
        # Enable uuid-ossp extension
        cursor.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")
        print_success("Extension 'uuid-ossp' enabled")
        
        conn.commit()
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print_error(f"Error enabling extensions: {e}")
        return False


def apply_schema(params, db_name, schema_file):
    """Apply database schema from SQL file"""
    print_step(6, f"Applying schema from {schema_file}...")
    
    try:
        # Read schema file
        with open(schema_file, 'r') as f:
            schema_sql = f.read()
        
        # Connect to new database
        conn = psycopg2.connect(database=db_name, **params)
        cursor = conn.cursor()
        
        # Split and execute SQL statements
        # Skip CREATE DATABASE and CREATE EXTENSION statements
        statements = []
        for statement in schema_sql.split(';'):
            statement = statement.strip()
            if statement and not statement.upper().startswith('CREATE DATABASE') and not statement.upper().startswith('CREATE EXTENSION'):
                statements.append(statement)
        
        # Execute statements
        for i, statement in enumerate(statements, 1):
            try:
                cursor.execute(statement)
                if i % 5 == 0:
                    print(f"  Executed {i}/{len(statements)} statements...")
            except Exception as e:
                print_warning(f"Statement {i} warning: {e}")
                # Continue with next statement
        
        conn.commit()
        print_success(f"Schema applied successfully ({len(statements)} statements)")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print_error(f"Error applying schema: {e}")
        return False


def verify_setup(params, db_name):
    """Verify database setup"""
    print_step(7, "Verifying database setup...")
    
    try:
        conn = psycopg2.connect(database=db_name, **params)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [row[0] for row in cursor.fetchall()]
        
        if tables:
            print_success(f"Tables created: {', '.join(tables)}")
        else:
            print_warning("No tables found")
        
        # Check extensions
        cursor.execute("""
            SELECT extname, extversion 
            FROM pg_extension 
            WHERE extname IN ('vector', 'uuid-ossp')
        """)
        extensions = cursor.fetchall()
        
        if extensions:
            print_success("Extensions enabled:")
            for ext_name, ext_version in extensions:
                print(f"    - {ext_name}: {ext_version}")
        
        # Check indexes
        cursor.execute("""
            SELECT COUNT(*) 
            FROM pg_indexes 
            WHERE schemaname = 'public'
        """)
        index_count = cursor.fetchone()[0]
        print_success(f"Indexes created: {index_count}")
        
        cursor.close()
        conn.close()
        return True
        
    except Exception as e:
        print_error(f"Error verifying setup: {e}")
        return False


def main():
    """Main entry point"""
    print("\n" + "="*60)
    print("🗄️  Knowledge Portal - Database Setup")
    print("="*60)
    
    # Get connection parameters
    params = get_connection_params()
    db_name = 'nirvana_knowledge'
    schema_file = 'scripts/database/setup-knowledge-db.sql'
    
    # Verify schema file exists
    if not os.path.exists(schema_file):
        print_error(f"Schema file not found: {schema_file}")
        sys.exit(1)
    
    # Test connection
    if not test_connection(params):
        sys.exit(1)
    
    # Check if database exists
    exists, should_drop = check_database_exists(params, db_name)
    
    # Drop if requested
    if exists and should_drop:
        if not drop_database(params, db_name):
            sys.exit(1)
        exists = False
    elif exists and not should_drop:
        print_warning("Skipping database creation")
        print("\nTo recreate, run script again and answer 'yes' to drop")
        sys.exit(0)
    
    # Create database
    if not exists:
        if not create_database(params, db_name):
            sys.exit(1)
    
    # Enable extensions
    if not enable_extensions(params, db_name):
        sys.exit(1)
    
    # Apply schema
    if not apply_schema(params, db_name, schema_file):
        sys.exit(1)
    
    # Verify setup
    if not verify_setup(params, db_name):
        sys.exit(1)
    
    print("\n" + "="*60)
    print("✅ Database setup completed successfully!")
    print("="*60)
    print(f"\nDatabase: {db_name}")
    print(f"Host: {params['host']}")
    print(f"Port: {params['port']}")
    print(f"\nNext steps:")
    print("  1. Update kubernetes/knowledge-portal/knowledge-postgres-secret.yaml")
    print("  2. Apply secret: kubectl apply -f kubernetes/knowledge-portal/knowledge-postgres-secret.yaml")
    print("  3. Configure Dify Dataset following docs/guides/dify-knowledge-setup.md")
    print("  4. Run initial indexing")
    print("")


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print_error("\n\nSetup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print_error(f"\n\nUnexpected error: {e}")
        sys.exit(1)
