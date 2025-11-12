# Mindful Moments App

A simple Node.js/Express application for the Azure SRE Agent demo project. This app manages "mindful moments" - a CRUD application with PostgreSQL backend and Azure Blob Storage for images.

## Features

- ✅ REST API for mindful moments (CRUD operations)
- ✅ PostgreSQL database with connection pooling
- ✅ Health check endpoints (`/health`, `/health/live`, `/health/ready`)
- ✅ Prometheus metrics endpoint (`/metrics`)
- ✅ Error simulation endpoints for SRE testing
- ✅ Azure App Service ready
- ✅ Proper error handling and logging
- ✅ Graceful shutdown

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x
- Azure CLI (for deployment)

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your local database credentials
   ```

3. **Initialize database**:
   ```bash
   psql -U postgres -f database/schema.sql
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. **Access the app**:
   - API: http://localhost:8080
   - Health: http://localhost:8080/health
   - Metrics: http://localhost:8080/metrics

## API Endpoints

### Health & Monitoring
- `GET /health` - Comprehensive health check (includes database)
- `GET /health/live` - Liveness probe
- `GET /health/ready` - Readiness probe
- `GET /metrics` - Prometheus metrics

### Mindful Moments
- `GET /api/moments` - List all moments
- `GET /api/moments/:id` - Get specific moment
- `POST /api/moments` - Create new moment
- `PUT /api/moments/:id` - Update moment
- `DELETE /api/moments/:id` - Delete moment

### Testing/Simulation
- `GET /api/simulate/error?type=500` - Simulate 500 error
- `GET /api/simulate/error?type=db` - Simulate database error
- `GET /api/simulate/slow?delay=5000` - Simulate slow response

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 8080) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Storage for images | No |
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | App Insights | No |

## Deployment to Azure App Service

The app is automatically deployed via GitHub Actions when pushing to `main` branch.

### Manual Deployment

```bash
# Login to Azure
az login

# Deploy using ZIP
az webapp deployment source config-zip \
  --resource-group rg-mindful-moments-dev \
  --name app-mindful-moments-dev \
  --src mindful-moments-app.zip
```

### Configure App Service Settings

```bash
# Set environment variables in App Service
az webapp config appsettings set \
  --resource-group rg-mindful-moments-dev \
  --name app-mindful-moments-dev \
  --settings \
    NODE_ENV=production \
    DATABASE_URL="@Microsoft.KeyVault(SecretUri=https://kv-mindfuld97avm.vault.azure.net/secrets/database-url/)"
```

## Database Schema

```sql
CREATE TABLE moments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

## Testing

```bash
# Run tests
npm test

# Run linter
npm run lint
```

## Monitoring

The app exposes Prometheus-compatible metrics at `/metrics`:

- `http_request_duration_seconds` - HTTP request duration histogram
- `nodejs_*` - Default Node.js metrics (memory, CPU, etc.)

These metrics can be scraped by Azure Monitor or Prometheus.

## Error Handling

The app includes comprehensive error handling:

- Database connection errors
- Query errors
- Validation errors
- Unhandled exceptions

All errors are logged and return appropriate HTTP status codes.

## Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       v
┌─────────────────────┐
│  Express Server     │
│  - Routes           │
│  - Middleware       │
│  - Error Handling   │
└──────┬──────────────┘
       │
       ├─────────────> PostgreSQL (moments table)
       │
       └─────────────> Azure Blob Storage (images)
```

## License

MIT

## Author

Alberto Lacambra
