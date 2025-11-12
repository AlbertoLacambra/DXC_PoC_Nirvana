#!/usr/bin/env python3
"""
Configure Dify Knowledge Dataset for Nirvana Knowledge Portal
This script creates and configures a Dify dataset using the Dify API
"""

import os
import sys
import json
import requests
from typing import Dict, Any

# Configuration
DIFY_API_URL = os.getenv("DIFY_API_URL", "http://10.0.2.91/api")
DIFY_API_KEY = os.getenv("DIFY_API_KEY")  # Required

# Database configuration
DB_CONFIG = {
    "host": "dify-postgres-9107e36a.postgres.database.azure.com",
    "port": 5432,
    "database": "nirvana_knowledge",
    "user": "difyadmin",
    "password": os.getenv("POSTGRES_PASSWORD")
}

# Dataset configuration
DATASET_CONFIG = {
    "name": "Nirvana Knowledge Portal",
    "description": "Technical documentation, ADRs, code examples, and runbooks for DXC Cloud Mind - Nirvana PoC",
    "permission": "only_me",  # or "all_team_members"
    "indexing_technique": "high_quality",  # Uses embeddings
    "embedding_model": "text-embedding-3-large",
    "embedding_model_provider": "azure_openai",
}

# Retrieval configuration
RETRIEVAL_CONFIG = {
    "search_method": "hybrid_search",  # vector + keyword
    "reranking_enable": True,
    "reranking_model": {
        "reranking_provider_name": "cohere",
        "reranking_model_name": "rerank-multilingual-v2.0"
    },
    "top_k": 5,
    "score_threshold": 0.70,
    "reranking_mode": "reranking_model"
}


class DifyDatasetConfigurator:
    def __init__(self, api_url: str, api_key: str):
        self.api_url = api_url.rstrip('/')
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def create_dataset(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new dataset in Dify"""
        endpoint = f"{self.api_url}/datasets"
        
        print(f"🔧 Creating dataset: {config['name']}")
        
        response = requests.post(
            endpoint,
            headers=self.headers,
            json=config
        )
        
        if response.status_code == 200:
            dataset = response.json()
            print(f"✅ Dataset created with ID: {dataset['id']}")
            return dataset
        else:
            print(f"❌ Failed to create dataset: {response.status_code}")
            print(f"   Response: {response.text}")
            sys.exit(1)
    
    def configure_retrieval(self, dataset_id: str, config: Dict[str, Any]) -> bool:
        """Configure retrieval settings for the dataset"""
        endpoint = f"{self.api_url}/datasets/{dataset_id}/retrieval-settings"
        
        print(f"⚙️  Configuring retrieval settings...")
        
        response = requests.patch(
            endpoint,
            headers=self.headers,
            json=config
        )
        
        if response.status_code == 200:
            print(f"✅ Retrieval settings configured")
            return True
        else:
            print(f"⚠️  Failed to configure retrieval: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
    
    def get_dataset_info(self, dataset_id: str) -> Dict[str, Any]:
        """Get dataset information"""
        endpoint = f"{self.api_url}/datasets/{dataset_id}"
        
        response = requests.get(endpoint, headers=self.headers)
        
        if response.status_code == 200:
            return response.json()
        else:
            print(f"❌ Failed to get dataset info: {response.status_code}")
            return {}
    
    def list_datasets(self) -> list:
        """List all datasets"""
        endpoint = f"{self.api_url}/datasets"
        
        response = requests.get(endpoint, headers=self.headers)
        
        if response.status_code == 200:
            return response.json().get('data', [])
        else:
            print(f"❌ Failed to list datasets: {response.status_code}")
            return []


def main():
    """Main execution"""
    print("=" * 60)
    print("🤖 Dify Dataset Configuration - Nirvana Knowledge Portal")
    print("=" * 60)
    print()
    
    # Validate API key
    if not DIFY_API_KEY:
        print("❌ Error: DIFY_API_KEY environment variable not set")
        print("   Please set it using: export DIFY_API_KEY='your-api-key'")
        sys.exit(1)
    
    # Validate database password
    if not DB_CONFIG['password']:
        print("❌ Error: POSTGRES_PASSWORD environment variable not set")
        sys.exit(1)
    
    # Initialize configurator
    configurator = DifyDatasetConfigurator(DIFY_API_URL, DIFY_API_KEY)
    
    # Check if dataset already exists
    print("🔍 Checking for existing datasets...")
    existing_datasets = configurator.list_datasets()
    
    nirvana_dataset = None
    for dataset in existing_datasets:
        if dataset.get('name') == DATASET_CONFIG['name']:
            nirvana_dataset = dataset
            print(f"ℹ️  Dataset already exists with ID: {dataset['id']}")
            break
    
    if not nirvana_dataset:
        # Create new dataset
        nirvana_dataset = configurator.create_dataset(DATASET_CONFIG)
    
    dataset_id = nirvana_dataset['id']
    
    # Configure retrieval settings
    configurator.configure_retrieval(dataset_id, RETRIEVAL_CONFIG)
    
    # Get final configuration
    print()
    print("📊 Final Dataset Configuration:")
    print("-" * 60)
    final_info = configurator.get_dataset_info(dataset_id)
    print(json.dumps(final_info, indent=2))
    
    print()
    print("=" * 60)
    print("✅ Dify Dataset Configuration Complete!")
    print("=" * 60)
    print()
    print(f"📝 Next Steps:")
    print(f"   1. Access Dify UI: {DIFY_API_URL.replace('/api', '')}")
    print(f"   2. Navigate to Knowledge → {DATASET_CONFIG['name']}")
    print(f"   3. Verify dataset is connected to PostgreSQL")
    print(f"   4. Test retrieval with sample queries")
    print()
    print(f"💡 Dataset ID: {dataset_id}")
    print(f"   Use this ID for API calls and agent configuration")
    print()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Configuration interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
