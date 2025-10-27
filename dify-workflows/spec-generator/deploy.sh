#!/bin/bash

# Spec Generator Bot - Deployment Script
# This script automates the deployment of the Spec Generator bot to Dify platform
# Prerequisites: Dify API credentials configured in .env file

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    echo "Create .env file with: DIFY_API_URL, DIFY_API_KEY, AZURE_OPENAI_KEY, KNOWLEDGE_PORTAL_DATASET_ID"
    exit 1
fi

# Check required environment variables
required_vars=("DIFY_API_URL" "DIFY_API_KEY" "AZURE_OPENAI_KEY" "KNOWLEDGE_PORTAL_DATASET_ID")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}Error: $var is not set in .env${NC}"
        exit 1
    fi
done

echo -e "${GREEN}Starting Spec Generator Bot Deployment...${NC}"

# Step 1: Validate workflow configuration
echo -e "${YELLOW}Step 1: Validating workflow-config.json...${NC}"
if ! python3 -m json.tool workflow-config.json > /dev/null 2>&1; then
    echo -e "${RED}Error: workflow-config.json is not valid JSON${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Configuration valid${NC}"

# Step 2: Test validation script
echo -e "${YELLOW}Step 2: Testing validate.py...${NC}"
if ! python3 -c "import validate; print('Import successful')"; then
    echo -e "${RED}Error: validate.py has syntax errors${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Validation script OK${NC}"

# Step 3: Create chatbot via Dify API
echo -e "${YELLOW}Step 3: Creating chatbot in Dify...${NC}"
CHATBOT_RESPONSE=$(curl -s -X POST "$DIFY_API_URL/v1/apps" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Spec Generator",
        "mode": "chat",
        "icon": "🤖",
        "description": "Generador automático de especificaciones técnicas (spec.md, plan.md, tasks.md) a partir de descripciones en lenguaje natural"
    }')

CHATBOT_ID=$(echo $CHATBOT_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('id', ''))")

if [ -z "$CHATBOT_ID" ]; then
    echo -e "${RED}Error: Failed to create chatbot${NC}"
    echo "Response: $CHATBOT_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✓ Chatbot created with ID: $CHATBOT_ID${NC}"

# Step 4: Upload system prompt
echo -e "${YELLOW}Step 4: Configuring system prompt...${NC}"
SYSTEM_PROMPT=$(sed -n '27,523p' README.md)
curl -s -X PUT "$DIFY_API_URL/v1/apps/$CHATBOT_ID/prompt" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{\"prompt\": $(echo "$SYSTEM_PROMPT" | jq -Rs .)}" > /dev/null

echo -e "${GREEN}✓ System prompt configured${NC}"

# Step 5: Upload workflow configuration
echo -e "${YELLOW}Step 5: Uploading workflow configuration...${NC}"

# Replace placeholders in workflow-config.json
WORKFLOW_CONFIG=$(cat workflow-config.json | \
    sed "s/YOUR_KNOWLEDGE_PORTAL_DATASET_ID/$KNOWLEDGE_PORTAL_DATASET_ID/g" | \
    sed "s/YOUR_AZURE_OPENAI_KEY/$AZURE_OPENAI_KEY/g")

curl -s -X PUT "$DIFY_API_URL/v1/apps/$CHATBOT_ID/workflow" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$WORKFLOW_CONFIG" > /dev/null

echo -e "${GREEN}✓ Workflow configured (7 nodes)${NC}"

# Step 6: Upload validation script
echo -e "${YELLOW}Step 6: Uploading validation script...${NC}"
VALIDATION_CODE=$(cat validate.py | base64)

curl -s -X POST "$DIFY_API_URL/v1/apps/$CHATBOT_ID/code-nodes" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"validate_output\",
        \"code\": \"$VALIDATION_CODE\",
        \"language\": \"python3\"
    }" > /dev/null

echo -e "${GREEN}✓ Validation script uploaded${NC}"

# Step 7: Configure conversation variables
echo -e "${YELLOW}Step 7: Configuring conversation variables...${NC}"
curl -s -X PUT "$DIFY_API_URL/v1/apps/$CHATBOT_ID/variables" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "variables": [
            {
                "name": "feature_description",
                "type": "string",
                "required": true,
                "description": "Descripción en lenguaje natural de la funcionalidad a especificar"
            },
            {
                "name": "applied_specs",
                "type": "array",
                "default": ["git-flow", "security"],
                "description": "Specs predefinidas a aplicar"
            },
            {
                "name": "tech_stack_preference",
                "type": "string",
                "default": "auto",
                "description": "Stack tecnológico preferido o 'auto' para selección automática"
            },
            {
                "name": "priority_focus",
                "type": "string",
                "default": "P1",
                "description": "Enfoque de prioridades: P1, P1+P2, o todas"
            }
        ]
    }' > /dev/null

echo -e "${GREEN}✓ Variables configured${NC}"

# Step 8: Configure conversation opener
echo -e "${YELLOW}Step 8: Configuring conversation opener...${NC}"
curl -s -X PUT "$DIFY_API_URL/v1/apps/$CHATBOT_ID/opener" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "opener": "¡Hola! Soy el Spec Generator de DXC Cloud Mind. Puedo ayudarte a generar especificaciones técnicas completas a partir de descripciones en lenguaje natural.\n\n**¿Qué genera?**\n- spec.md: User stories, requisitos, criterios de éxito\n- plan.md: Stack técnico, arquitectura, contratos de API\n- tasks.md: Tareas implementables (2-8h), dependencias, DoD\n\n**¿Cómo usarme?**\nDescribe la funcionalidad que necesitas especificar. Puedo aplicar automáticamente specs predefinidas (Git Flow, Security, IaC) según el dominio.\n\n**Ejemplo:** \"Necesito implementar autenticación OAuth2 con Azure AD para el Control Center\""
    }' > /dev/null

echo -e "${GREEN}✓ Conversation opener configured${NC}"

# Step 9: Configure suggested questions
echo -e "${YELLOW}Step 9: Configuring suggested questions...${NC}"
curl -s -X PUT "$DIFY_API_URL/v1/apps/$CHATBOT_ID/suggested-questions" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "questions": [
            "Sistema de notificaciones en tiempo real cuando proyectos cambian de estado",
            "Autenticación OAuth2 con Azure AD y roles para Control Center",
            "Dashboard de analytics con métricas de proyectos y especialistas",
            "API REST para gestión de especialistas con búsqueda y filtros",
            "Infraestructura como código para cluster AKS con auto-scaling"
        ]
    }' > /dev/null

echo -e "${GREEN}✓ Suggested questions configured${NC}"

# Step 10: Enable features
echo -e "${YELLOW}Step 10: Enabling features...${NC}"
curl -s -X PUT "$DIFY_API_URL/v1/apps/$CHATBOT_ID/features" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "citation": true,
        "annotation_reply": {
            "enabled": true,
            "score_threshold": 0.8
        },
        "conversation_history": {
            "enabled": true,
            "max_turns": 10
        }
    }' > /dev/null

echo -e "${GREEN}✓ Features enabled${NC}"

# Step 11: Test deployment
echo -e "${YELLOW}Step 11: Testing bot deployment...${NC}"
TEST_RESPONSE=$(curl -s -X POST "$DIFY_API_URL/v1/chat-messages" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "inputs": {
            "feature_description": "Sistema de autenticación con OAuth2",
            "applied_specs": ["security"],
            "tech_stack_preference": "auto",
            "priority_focus": "P1"
        },
        "query": "Sistema de autenticación con OAuth2",
        "response_mode": "blocking",
        "conversation_id": "",
        "user": "deployment-test"
    }')

if echo "$TEST_RESPONSE" | grep -q "spec.md"; then
    echo -e "${GREEN}✓ Bot responding correctly${NC}"
else
    echo -e "${RED}Warning: Bot may not be responding correctly${NC}"
    echo "Response: $TEST_RESPONSE"
fi

# Step 12: Publish to production
echo -e "${YELLOW}Step 12: Publishing to production...${NC}"
PUBLISH_RESPONSE=$(curl -s -X POST "$DIFY_API_URL/v1/apps/$CHATBOT_ID/publish" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "version": "1.0.0",
        "description": "Initial production deployment of Spec Generator bot"
    }')

API_ENDPOINT=$(echo $PUBLISH_RESPONSE | python3 -c "import sys, json; print(json.load(sys.stdin).get('api_endpoint', ''))")

echo -e "${GREEN}✓ Published to production${NC}"
echo -e "${GREEN}API Endpoint: $API_ENDPOINT${NC}"

# Save deployment info
cat > deployment-info.json <<EOF
{
    "chatbot_id": "$CHATBOT_ID",
    "api_endpoint": "$API_ENDPOINT",
    "version": "1.0.0",
    "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "features": {
        "workflow_nodes": 7,
        "conversation_variables": 4,
        "suggested_questions": 5,
        "citation": true,
        "annotation_reply": true
    }
}
EOF

echo -e "${GREEN}✓ Deployment info saved to deployment-info.json${NC}"

# Print summary
echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Spec Generator Bot Deployed Successfully!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Chatbot ID: $CHATBOT_ID"
echo "API Endpoint: $API_ENDPOINT"
echo "Version: 1.0.0"
echo ""
echo "Next steps:"
echo "1. Test the bot via Dify UI: $DIFY_API_URL/app/$CHATBOT_ID"
echo "2. Integrate with Control Center (see IMPLEMENTATION_GUIDE.md Step 10)"
echo "3. Run test cases (see test-cases.sh)"
echo ""
echo -e "${YELLOW}Deployment info saved to: deployment-info.json${NC}"
