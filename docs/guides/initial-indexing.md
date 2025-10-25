# Initial Indexing Guide

Para realizar la indexación inicial de la documentación en el Knowledge Portal, puedes usar uno de estos métodos:

## Método 1: GitHub Actions Workflow (Recomendado)

El workflow ya está configurado y tiene acceso al repositorio y a todos los secrets necesarios.

### Trigger manual con todos los archivos:

```bash
gh workflow run sync-knowledge-base.yml \
  --repo AlbertoLacambra/dify-azure-private-deployment \
  --field force_reindex=true
```

### Verificar ejecución:

```bash
# Listar ejecuciones
gh run list --repo AlbertoLacambra/dify-azure-private-deployment --workflow=sync-knowledge-base.yml

# Ver logs de la última ejecución
gh run view --repo AlbertoLacambra/dify-azure-private-deployment --log
```

## Método 2: Script Local (Requiere VPN + Conectividad a PostgreSQL)

Si tienes conectividad directa a PostgreSQL:

```bash
# Configurar variables de entorno
export AZURE_OPENAI_API_KEY="<YOUR_AZURE_OPENAI_KEY>"
export AZURE_OPENAI_ENDPOINT="https://alberto-resource.cognitiveservices.azure.com/openai"
export AZURE_OPENAI_DEPLOYMENT="text-embedding-3-large"
export POSTGRES_HOST="dify-postgres-9107e36a.postgres.database.azure.com"
export POSTGRES_USER="difyadmin"
export POSTGRES_PASSWORD="<YOUR_POSTGRES_PASSWORD>"
export POSTGRES_DB="nirvana_knowledge"

# Ejecutar indexación
./scripts/knowledge/index-initial-docs.sh
```

## Método 3: Commit y Push (Automático)

El workflow se ejecuta automáticamente en cada push a master que modifique archivos en:
- `docs/**`
- `apps/**`
- `kubernetes/**`
- `scripts/**`

Simplemente haz commit y push de cualquier cambio en esos directorios.

## Verificación Post-Indexación

Una vez completada la indexación, verifica con:

```bash
# Método 1: Si tienes acceso a PostgreSQL
python3 scripts/knowledge/verify-knowledge-sync.py

# Método 2: Usando Kubernetes Job
kubectl apply -f kubernetes/knowledge-portal/verify-sync-job.yaml
kubectl logs -n cloudmind job/verify-knowledge-sync --follow
```

## Archivos a Indexar Inicialmente

Ver lista en: `scripts/knowledge/initial-docs.txt`

Total: ~20 archivos de documentación incluyendo:
- Arquitectura
- Guías de usuario
- Referencias técnicas
- Casos de uso
