# Deploy script for Azure App Service
#!/bin/bash

set -e

echo "🚀 Deploying Mindful Moments to Azure App Service..."

# Variables
RESOURCE_GROUP="rg-mindful-moments-dev"
APP_NAME="app-mindful-moments-dev"
KEY_VAULT_NAME="kv-mindfuld97avm"

# Get DATABASE_URL from Key Vault
echo "📦 Fetching secrets from Key Vault..."
DATABASE_URL=$(az keyvault secret show --name database-url --vault-name $KEY_VAULT_NAME --query value -o tsv)
STORAGE_CONN=$(az keyvault secret show --name storage-connection-string --vault-name $KEY_VAULT_NAME --query value -o tsv)

# Set App Service configuration
echo "⚙️  Configuring App Service settings..."
az webapp config appsettings set \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --settings \
    NODE_ENV=production \
    PORT=8080 \
    DATABASE_URL="$DATABASE_URL" \
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONN" \
    SCM_DO_BUILD_DURING_DEPLOYMENT=true \
    WEBSITE_NODE_DEFAULT_VERSION="~20"

# Create deployment package
echo "📦 Creating deployment package..."
zip -r deploy.zip . -x "*.git*" "node_modules/*" ".env" "deploy.sh"

# Deploy to Azure
echo "🚀 Deploying application..."
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --src deploy.zip

# Clean up
rm deploy.zip

echo "✅ Deployment complete!"
echo "🌐 App URL: https://$APP_NAME.azurewebsites.net"
echo "💚 Health check: https://$APP_NAME.azurewebsites.net/health"
