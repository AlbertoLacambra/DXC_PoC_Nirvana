#!/bin/bash

###############################################################################
# Script de Configuración de Service Principal para GitHub Actions
# 
# Este script crea un Service Principal en Azure con los permisos necesarios
# para que GitHub Actions pueda desplegar infraestructura con Terraform.
#
# Autor: GitHub Copilot
# Fecha: 2025-10-15
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUBSCRIPTION_ID="739aaf91-5cb2-45a6-ab4f-abf883e9d3f7"
SP_NAME="github-actions-dxc-nirvana"
GITHUB_ORG="AlbertoLacambra"
GITHUB_REPO="DXC_PoC_Nirvana"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🔐 Configuración de Service Principal para GitHub Actions    ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI no está instalado.${NC}"
    echo -e "${YELLOW}   Instálalo desde: https://docs.microsoft.com/en-us/cli/azure/install-azure-cli${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI detectado${NC}"
echo ""

# Login check
echo -e "${BLUE}🔍 Verificando autenticación de Azure...${NC}"
if ! az account show &> /dev/null; then
    echo -e "${YELLOW}⚠️  No estás autenticado en Azure.${NC}"
    echo -e "${BLUE}   Iniciando login...${NC}"
    az login
else
    echo -e "${GREEN}✅ Ya estás autenticado en Azure${NC}"
fi
echo ""

# Set subscription
echo -e "${BLUE}📋 Configurando suscripción: ${SUBSCRIPTION_ID}${NC}"
az account set --subscription "$SUBSCRIPTION_ID"
CURRENT_SUB=$(az account show --query name -o tsv)
echo -e "${GREEN}✅ Suscripción activa: ${CURRENT_SUB}${NC}"
echo ""

# Ask for confirmation
echo -e "${YELLOW}⚠️  Este script va a:${NC}"
echo -e "   1. Crear un Service Principal llamado: ${BLUE}${SP_NAME}${NC}"
echo -e "   2. Asignar rol de ${BLUE}Contributor${NC} a la suscripción"
echo -e "   3. Configurar ${BLUE}Federated Credentials${NC} para GitHub Actions"
echo ""
read -p "¿Deseas continuar? (s/n): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo -e "${RED}❌ Operación cancelada.${NC}"
    exit 1
fi
echo ""

# Check if Service Principal already exists
echo -e "${BLUE}🔍 Verificando si el Service Principal ya existe...${NC}"
EXISTING_SP=$(az ad sp list --display-name "$SP_NAME" --query "[0].appId" -o tsv)

if [ -n "$EXISTING_SP" ]; then
    echo -e "${YELLOW}⚠️  El Service Principal '${SP_NAME}' ya existe.${NC}"
    echo -e "   App ID: ${BLUE}${EXISTING_SP}${NC}"
    echo ""
    read -p "¿Deseas eliminarlo y crear uno nuevo? (s/n): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}🗑️  Eliminando Service Principal existente...${NC}"
        az ad sp delete --id "$EXISTING_SP"
        echo -e "${GREEN}✅ Service Principal eliminado${NC}"
        echo ""
    else
        echo -e "${YELLOW}ℹ️  Usando Service Principal existente.${NC}"
        CLIENT_ID="$EXISTING_SP"
    fi
fi

# Create Service Principal if it doesn't exist
if [ -z "$CLIENT_ID" ]; then
    echo -e "${BLUE}🔧 Creando Service Principal...${NC}"
    
    # Create app registration
    APP_RESULT=$(az ad app create --display-name "$SP_NAME" --query "{appId: appId, objectId: id}" -o json)
    CLIENT_ID=$(echo "$APP_RESULT" | jq -r '.appId')
    APP_OBJECT_ID=$(echo "$APP_RESULT" | jq -r '.objectId')
    
    echo -e "${GREEN}✅ App Registration creado${NC}"
    echo -e "   Client ID: ${BLUE}${CLIENT_ID}${NC}"
    
    # Create service principal
    SP_OBJECT_ID=$(az ad sp create --id "$CLIENT_ID" --query "id" -o tsv)
    echo -e "${GREEN}✅ Service Principal creado${NC}"
    echo -e "   Object ID: ${BLUE}${SP_OBJECT_ID}${NC}"
    echo ""
    
    # Wait for propagation
    echo -e "${YELLOW}⏳ Esperando propagación de Azure AD (10 segundos)...${NC}"
    sleep 10
fi

# Assign Contributor role
echo -e "${BLUE}🔑 Asignando rol Contributor...${NC}"
az role assignment create \
    --assignee "$CLIENT_ID" \
    --role "Contributor" \
    --scope "/subscriptions/$SUBSCRIPTION_ID" \
    --description "GitHub Actions deployment for DXC PoC Nirvana" \
    &> /dev/null || echo -e "${YELLOW}⚠️  El rol ya estaba asignado${NC}"
    
echo -e "${GREEN}✅ Rol Contributor asignado${NC}"
echo ""

# Get Tenant ID
TENANT_ID=$(az account show --query tenantId -o tsv)

# Configure Federated Credentials for master branch
echo -e "${BLUE}🔗 Configurando Federated Credentials para branch 'master'...${NC}"
FEDERATED_SUBJECT_MASTER="repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/master"

az ad app federated-credential create \
    --id "$CLIENT_ID" \
    --parameters "{
        \"name\": \"github-actions-master-branch\",
        \"issuer\": \"https://token.actions.githubusercontent.com\",
        \"subject\": \"${FEDERATED_SUBJECT_MASTER}\",
        \"description\": \"GitHub Actions deployment from master branch\",
        \"audiences\": [\"api://AzureADTokenExchange\"]
    }" &> /dev/null || echo -e "${YELLOW}⚠️  La credencial para 'master' ya existe${NC}"

echo -e "${GREEN}✅ Federated Credential para 'master' configurada${NC}"

# Configure Federated Credentials for Pull Requests
echo -e "${BLUE}🔗 Configurando Federated Credentials para Pull Requests...${NC}"
FEDERATED_SUBJECT_PR="repo:${GITHUB_ORG}/${GITHUB_REPO}:pull_request"

az ad app federated-credential create \
    --id "$CLIENT_ID" \
    --parameters "{
        \"name\": \"github-actions-pull-requests\",
        \"issuer\": \"https://token.actions.githubusercontent.com\",
        \"subject\": \"${FEDERATED_SUBJECT_PR}\",
        \"description\": \"GitHub Actions PR validation\",
        \"audiences\": [\"api://AzureADTokenExchange\"]
    }" &> /dev/null || echo -e "${YELLOW}⚠️  La credencial para 'pull_request' ya existe${NC}"

echo -e "${GREEN}✅ Federated Credential para Pull Requests configurada${NC}"
echo ""

# Display results
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✅ Configuración completada exitosamente                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📝 Información del Service Principal:${NC}"
echo -e "   ${YELLOW}Nombre:${NC}      ${SP_NAME}"
echo -e "   ${YELLOW}Client ID:${NC}   ${BLUE}${CLIENT_ID}${NC}"
echo -e "   ${YELLOW}Tenant ID:${NC}   ${BLUE}${TENANT_ID}${NC}"
echo -e "   ${YELLOW}Subscription:${NC} ${BLUE}${SUBSCRIPTION_ID}${NC}"
echo ""

echo -e "${BLUE}🔐 Configurar estos secretos en GitHub:${NC}"
echo -e "${GREEN}┌────────────────────────────────────────────────────────────────┐${NC}"
echo -e "${GREEN}│  Secret Name          │  Value                                 │${NC}"
echo -e "${GREEN}├────────────────────────────────────────────────────────────────┤${NC}"
echo -e "${GREEN}│  AZURE_CLIENT_ID      │  ${BLUE}${CLIENT_ID}${NC}${GREEN} │${NC}"
echo -e "${GREEN}│  AZURE_TENANT_ID      │  ${BLUE}${TENANT_ID}${NC}${GREEN} │${NC}"
echo -e "${GREEN}│  TEAMS_WEBHOOK_URL    │  ${YELLOW}<Tu webhook URL de Teams>${NC}${GREEN}           │${NC}"
echo -e "${GREEN}└────────────────────────────────────────────────────────────────┘${NC}"
echo ""

echo -e "${BLUE}📋 Pasos siguientes:${NC}"
echo -e "   1. Ve a: ${BLUE}https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/secrets/actions${NC}"
echo -e "   2. Crea los secretos ${YELLOW}AZURE_CLIENT_ID${NC} y ${YELLOW}AZURE_TENANT_ID${NC}"
echo -e "   3. Crea el secreto ${YELLOW}TEAMS_WEBHOOK_URL${NC} con tu webhook de Teams"
echo -e "   4. Ejecuta un workflow para probar la configuración"
echo ""

# Create a summary file
SUMMARY_FILE="azure-sp-summary.txt"
cat > "$SUMMARY_FILE" << EOF
=================================================================
Service Principal Configuration Summary
=================================================================
Date: $(date)

Service Principal Details:
-----------------------------------------------------------------
Name:           $SP_NAME
Client ID:      $CLIENT_ID
Tenant ID:      $TENANT_ID
Subscription:   $SUBSCRIPTION_ID
Role:           Contributor

GitHub Secrets to Configure:
-----------------------------------------------------------------
Name: AZURE_CLIENT_ID
Value: $CLIENT_ID

Name: AZURE_TENANT_ID
Value: $TENANT_ID

Name: TEAMS_WEBHOOK_URL
Value: <Your Teams Webhook URL>

Federated Credentials Configured:
-----------------------------------------------------------------
1. Branch: master
   Subject: repo:${GITHUB_ORG}/${GITHUB_REPO}:ref:refs/heads/master

2. Pull Requests
   Subject: repo:${GITHUB_ORG}/${GITHUB_REPO}:pull_request

GitHub Repository:
-----------------------------------------------------------------
https://github.com/${GITHUB_ORG}/${GITHUB_REPO}/settings/secrets/actions

Azure Portal:
-----------------------------------------------------------------
https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/${CLIENT_ID}

=================================================================
EOF

echo -e "${GREEN}✅ Resumen guardado en: ${BLUE}${SUMMARY_FILE}${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANTE: Guarda este archivo en un lugar seguro y elimínalo después de configurar GitHub.${NC}"
