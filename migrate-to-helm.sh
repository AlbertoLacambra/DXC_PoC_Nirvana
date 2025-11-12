#!/bin/bash
# Script de migración de Dify manual a Helm 1.9.2
# Fecha: 2025-10-23

set -e

echo "=========================================="
echo "MIGRACIÓN DE DIFY A HELM 1.9.2"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

NAMESPACE="dify"
BACKUP_DIR="/mnt/c/PROYECTS/DXC_PoC_Nirvana/backups/migration_$(date +%Y%m%d_%H%M%S)"
HELM_CHART_DIR="/mnt/c/PROYECTS/DXC_PoC_Nirvana/helm-dify-chart"

echo -e "${YELLOW}📁 Creando directorio de backup...${NC}"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}🔍 Paso 1: Backup de configuración actual${NC}"
echo "Exportando configuración actual..."
kubectl get all,secrets,configmaps,pvc -n $NAMESPACE -o yaml > "$BACKUP_DIR/dify-current-config.yaml"
echo -e "${GREEN}✅ Configuración exportada${NC}"

echo ""
echo -e "${YELLOW}⏸️  Paso 2: Detener tráfico entrante${NC}"
echo "Escalando NGINX a 0 réplicas..."
kubectl scale deployment/nginx --replicas=0 -n $NAMESPACE
sleep 5
echo -e "${GREEN}✅ NGINX detenido${NC}"

echo ""
echo -e "${YELLOW}🗑️  Paso 3: Eliminar deployments actuales${NC}"
echo "ATENCIÓN: Se eliminarán los deployments pero NO los PVCs ni secrets"
echo "Deployments a eliminar:"
kubectl get deployments -n $NAMESPACE -o name

read -p "¿Continuar con la eliminación? (yes/no): " confirmation
if [ "$confirmation" != "yes" ]; then
    echo -e "${RED}❌ Migración cancelada${NC}"
    echo "Restaurando nginx..."
    kubectl scale deployment/nginx --replicas=1 -n $NAMESPACE
    exit 1
fi

# Eliminar deployments
kubectl delete deployment dify-api dify-web dify-worker dify-plugin-daemon nginx -n $NAMESPACE
# No eliminamos Redis porque lo mantenemos con Helm
echo -e "${GREEN}✅ Deployments eliminados${NC}"

# Eliminar services que se recrearán con Helm
echo "Eliminando services..."
kubectl delete service dify-api dify-api-service dify-web dify-web-service dify-plugin-daemon-service nginx -n $NAMESPACE
echo -e "${GREEN}✅ Services eliminados${NC}"

echo ""
echo -e "${YELLOW}📦 Paso 4: Instalar Dify con Helm${NC}"
cd "$HELM_CHART_DIR"

echo "Instalando Dify 1.9.2 con Helm..."
helm install dify . \
  --namespace $NAMESPACE \
  --values values-custom.yaml \
  --wait \
  --timeout 10m

echo -e "${GREEN}✅ Dify 1.9.2 instalado con Helm${NC}"

echo ""
echo -e "${YELLOW}�� Paso 5: Verificación${NC}"
echo "Estado de los pods:"
kubectl get pods -n $NAMESPACE

echo ""
echo "Servicios:"
kubectl get svc -n $NAMESPACE

echo ""
echo -e "${GREEN}=========================================="
echo "MIGRACIÓN COMPLETADA"
echo "==========================================${NC}"
echo ""
echo "Backup guardado en: $BACKUP_DIR"
echo "Para rollback, consulta: $BACKUP_DIR/dify-current-config.yaml"
echo ""
echo "Próximos pasos:"
echo "1. Verificar que todos los pods estén Running"
echo "2. Verificar logs: kubectl logs -n dify deployment/dify-api"
echo "3. Acceder a Dify: http://10.0.2.62"
echo "4. Configurar Azure OpenAI"

