#!/bin/bash

# ============================================================================
# Configure GitHub Secrets for Knowledge Portal Workflow
# ============================================================================
# This script sets up the required secrets for the sync-knowledge-base workflow
# ============================================================================

set -e

echo "============================================"
echo "GitHub Secrets Configuration"
echo "============================================"
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "Error: GitHub CLI (gh) is not installed"
    echo "Install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo "Error: Not authenticated with GitHub CLI"
    echo "Run: gh auth login"
    exit 1
fi

echo "Setting up secrets for repository: AlbertoLacambra/dify-azure-private-deployment"
echo ""
echo "⚠️  IMPORTANT: This script contains placeholders for sensitive credentials."
echo "    Edit this file and replace <AZURE_OPENAI_KEY> and <POSTGRES_PASSWORD>"
echo "    with actual values before running."
echo ""
read -p "Have you replaced the placeholders? (yes/no): " -r
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
    echo "Please edit the script and replace placeholders first."
    exit 1
fi

# Azure OpenAI secrets
echo "1. Setting AZURE_OPENAI_API_KEY..."
gh secret set AZURE_OPENAI_API_KEY \
  --body "<AZURE_OPENAI_KEY>" \
  --repo AlbertoLacambra/dify-azure-private-deployment

echo "2. Setting AZURE_OPENAI_ENDPOINT..."
gh secret set AZURE_OPENAI_ENDPOINT \
  --body "https://alberto-resource.cognitiveservices.azure.com/openai" \
  --repo AlbertoLacambra/dify-azure-private-deployment

# PostgreSQL secrets
echo "3. Setting POSTGRES_HOST..."
gh secret set POSTGRES_HOST \
  --body "dify-postgres-9107e36a.postgres.database.azure.com" \
  --repo AlbertoLacambra/dify-azure-private-deployment

echo "4. Setting POSTGRES_USER..."
gh secret set POSTGRES_USER \
  --body "difyadmin" \
  --repo AlbertoLacambra/dify-azure-private-deployment

echo "5. Setting POSTGRES_PASSWORD..."
gh secret set POSTGRES_PASSWORD \
  --body "<POSTGRES_PASSWORD>" \
  --repo AlbertoLacambra/dify-azure-private-deployment

echo "6. Setting POSTGRES_DB..."
gh secret set POSTGRES_DB \
  --body "nirvana_knowledge" \
  --repo AlbertoLacambra/dify-azure-private-deployment

echo ""
echo "============================================"
echo "✅ All secrets configured successfully!"
echo "============================================"
echo ""
echo "Configured secrets:"
echo "  - AZURE_OPENAI_API_KEY"
echo "  - AZURE_OPENAI_ENDPOINT"
echo "  - POSTGRES_HOST"
echo "  - POSTGRES_USER"
echo "  - POSTGRES_PASSWORD"
echo "  - POSTGRES_DB"
echo ""
echo "You can verify secrets with:"
echo "  gh secret list --repo AlbertoLacambra/dify-azure-private-deployment"
