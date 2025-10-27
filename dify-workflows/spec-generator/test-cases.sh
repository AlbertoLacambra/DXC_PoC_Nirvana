#!/bin/bash

# Spec Generator Bot - Test Cases
# Run automated tests for the Spec Generator bot

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
else
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

# Load deployment info
if [ -f deployment-info.json ]; then
    CHATBOT_ID=$(cat deployment-info.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('chatbot_id', ''))")
    API_ENDPOINT=$(cat deployment-info.json | python3 -c "import sys, json; print(json.load(sys.stdin).get('api_endpoint', ''))")
else
    echo -e "${RED}Error: deployment-info.json not found. Run deploy.sh first.${NC}"
    exit 1
fi

echo -e "${GREEN}Starting Test Suite for Spec Generator Bot...${NC}"
echo "Chatbot ID: $CHATBOT_ID"
echo ""

# Test metrics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper function to run test
run_test() {
    local test_name=$1
    local feature_description=$2
    local applied_specs=$3
    local expected_user_stories=$4
    local expected_sc_min=$5
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -e "${YELLOW}Test $TOTAL_TESTS: $test_name${NC}"
    echo "Description: $feature_description"
    
    # Send request to bot
    RESPONSE=$(curl -s -X POST "$API_ENDPOINT/chat-messages" \
        -H "Authorization: Bearer $DIFY_API_KEY" \
        -H "Content-Type: application/json" \
        -d "{
            \"inputs\": {
                \"feature_description\": \"$feature_description\",
                \"applied_specs\": $applied_specs,
                \"tech_stack_preference\": \"auto\",
                \"priority_focus\": \"P1\"
            },
            \"query\": \"$feature_description\",
            \"response_mode\": \"blocking\",
            \"conversation_id\": \"\",
            \"user\": \"test-suite\"
        }")
    
    # Extract validation results
    VALIDATION_VALID=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('metadata', {}).get('validation', {}).get('valid', False))" 2>/dev/null || echo "false")
    QUALITY_SCORE=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('metadata', {}).get('quality_score', 0))" 2>/dev/null || echo "0")
    USER_STORIES=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('metadata', {}).get('spec', {}).get('metrics', {}).get('user_stories', 0))" 2>/dev/null || echo "0")
    SUCCESS_CRITERIA=$(echo "$RESPONSE" | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('metadata', {}).get('spec', {}).get('metrics', {}).get('success_criteria', 0))" 2>/dev/null || echo "0")
    
    # Check if response contains spec.md, plan.md, tasks.md
    HAS_SPEC=$(echo "$RESPONSE" | grep -q "spec.md" && echo "true" || echo "false")
    HAS_PLAN=$(echo "$RESPONSE" | grep -q "plan.md" && echo "true" || echo "false")
    HAS_TASKS=$(echo "$RESPONSE" | grep -q "tasks.md" && echo "true" || echo "false")
    
    # Determine pass/fail
    if [ "$VALIDATION_VALID" = "true" ] && \
       [ "$HAS_SPEC" = "true" ] && \
       [ "$HAS_PLAN" = "true" ] && \
       [ "$HAS_TASKS" = "true" ] && \
       [ "$USER_STORIES" -ge "$expected_user_stories" ] && \
       [ "$SUCCESS_CRITERIA" -ge "$expected_sc_min" ] && \
       [ $(echo "$QUALITY_SCORE >= 80" | bc -l) -eq 1 ]; then
        echo -e "${GREEN}✓ PASSED${NC}"
        echo "  - User Stories: $USER_STORIES (expected: ≥$expected_user_stories)"
        echo "  - Success Criteria: $SUCCESS_CRITERIA (expected: ≥$expected_sc_min)"
        echo "  - Quality Score: $QUALITY_SCORE/100"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "  - Validation Valid: $VALIDATION_VALID"
        echo "  - Has spec.md: $HAS_SPEC"
        echo "  - Has plan.md: $HAS_PLAN"
        echo "  - Has tasks.md: $HAS_TASKS"
        echo "  - User Stories: $USER_STORIES (expected: ≥$expected_user_stories)"
        echo "  - Success Criteria: $SUCCESS_CRITERIA (expected: ≥$expected_sc_min)"
        echo "  - Quality Score: $QUALITY_SCORE/100 (expected: ≥80)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Test Case 1: Authentication System
run_test \
    "Authentication System with OAuth2" \
    "Necesito implementar autenticación OAuth2 con Azure AD para el Control Center. Los usuarios deben poder hacer login con sus cuentas corporativas, gestionar sesiones, y tener roles (admin, user, viewer)." \
    "[\"security\"]" \
    4 \
    5

# Test Case 2: Real-time Notifications
run_test \
    "Real-time Notifications System" \
    "Sistema de notificaciones en tiempo real que alerte a los usuarios cuando sus proyectos cambian de estado. Las notificaciones deben mostrarse en el UI sin recargar la página y persistir en base de datos." \
    "[\"git-flow\"]" \
    3 \
    4

# Test Case 3: IaC for AKS Cluster
run_test \
    "Infrastructure as Code for AKS" \
    "Crear infraestructura como código con Terraform para desplegar un cluster AKS con 3 node pools (system, user, spot), auto-scaling, Azure CNI networking, y integración con Azure Monitor." \
    "[\"iac-terraform\", \"security\"]" \
    4 \
    6

# Test Case 4: Analytics Dashboard
run_test \
    "Analytics Dashboard" \
    "Dashboard de analytics que muestre métricas de proyectos (total, por estado, tiempo medio de resolución) y especialistas (disponibilidad, skills, certificaciones). Con filtros por fecha, stack tecnológico, y región." \
    "[\"git-flow\"]" \
    5 \
    5

# Test Case 5: API REST for Specialists
run_test \
    "REST API for Specialist Management" \
    "API REST para gestionar especialistas: CRUD operations, búsqueda por skills, filtros por disponibilidad, paginación, rate limiting. Integrar con Azure AD para autenticación." \
    "[\"security\", \"git-flow\"]" \
    4 \
    5

# Performance Test: Response Time
echo -e "${YELLOW}Performance Test: Response Time${NC}"
START_TIME=$(date +%s)

curl -s -X POST "$API_ENDPOINT/chat-messages" \
    -H "Authorization: Bearer $DIFY_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "inputs": {
            "feature_description": "Simple login form with email and password",
            "applied_specs": [],
            "tech_stack_preference": "auto",
            "priority_focus": "P1"
        },
        "query": "Simple login form",
        "response_mode": "blocking",
        "conversation_id": "",
        "user": "performance-test"
    }' > /dev/null

END_TIME=$(date +%s)
RESPONSE_TIME=$((END_TIME - START_TIME))

if [ $RESPONSE_TIME -le 300 ]; then
    echo -e "${GREEN}✓ PASSED - Response time: ${RESPONSE_TIME}s (expected: <300s)${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    echo -e "${RED}✗ FAILED - Response time: ${RESPONSE_TIME}s (expected: <300s)${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
TOTAL_TESTS=$((TOTAL_TESTS + 1))

echo ""

# Print summary
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}  Test Suite Summary${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"
echo ""

PASS_RATE=$(echo "scale=2; $PASSED_TESTS * 100 / $TOTAL_TESTS" | bc)
echo "Pass Rate: $PASS_RATE%"

if [ "$PASS_RATE" == "100.00" ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
elif [ $(echo "$PASS_RATE >= 80" | bc -l) -eq 1 ]; then
    echo -e "${YELLOW}⚠ Some tests failed, but pass rate is acceptable (≥80%)${NC}"
    exit 0
else
    echo -e "${RED}✗ Too many tests failed (pass rate <80%)${NC}"
    exit 1
fi
