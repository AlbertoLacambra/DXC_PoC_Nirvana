# Control Center UI - Development Guide

## Quick Start

### Starting the Development Server

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

**Linux/macOS/WSL:**
```bash
./dev.sh
```

Both scripts will:
1. Kill any process running on port 3000
2. Start Next.js development server on http://localhost:3000

### Database Access (Required for API)

The application needs access to the Azure PostgreSQL database. You need to set up port forwarding:

```bash
# 1. Create the proxy pod (only once)
kubectl apply -f ../../kubernetes/postgres-proxy-pod.yaml

# 2. Wait for pod to be ready
kubectl wait --for=condition=ready pod/postgres-proxy -n dify --timeout=30s

# 3. Forward the port (keep this running in a separate terminal)
kubectl port-forward -n dify postgres-proxy 5432:5432
```

**Keep the port-forward running** while developing. If you close it, the API will fail to connect to the database.

### Full Development Setup

**Terminal 1 - Database Port Forward:**
```bash
kubectl port-forward -n dify postgres-proxy 5432:5432
```

**Terminal 2 - Next.js Server:**
```powershell
# Windows
.\start-dev.ps1
```
```bash
# Linux/macOS
./dev.sh
```

## Available Pages

- **Home:** http://localhost:3000
- **Spec Browser:** http://localhost:3000/specs/browse
- **Knowledge Search:** http://localhost:3000/knowledge-search

## Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL="postgresql://difyadmin:YourPassword@localhost:5432/nirvana_specs"
AZURE_OPENAI_API_KEY="your-api-key"
AZURE_OPENAI_ENDPOINT="https://your-endpoint.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="text-embedding-3-large"
```

## Troubleshooting

### Port 3000 already in use

The scripts automatically kill processes on port 3000. If issues persist:

**Windows:**
```powershell
# Kill all Node.js processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
```

**Linux/macOS:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### Database connection errors

Check if port-forward is running:
```bash
kubectl get pod postgres-proxy -n dify
# Should show: Running

# If not running, recreate it
kubectl apply -f ../../kubernetes/postgres-proxy-pod.yaml
kubectl port-forward -n dify postgres-proxy 5432:5432
```

### API returns 500 errors

1. Verify DATABASE_URL in `.env.local`
2. Check port-forward is active
3. Test database connection:
```bash
psql "postgresql://difyadmin:YourPassword@localhost:5432/nirvana_specs" -c "SELECT 1;"
```

## Development Scripts

- `npm run dev` - Start Next.js (uses default behavior, may use port 3001/3002 if 3000 is busy)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `node test-api-endpoints.js` - Run API tests

## Project Structure

```
apps/control-center-ui/
├── app/                          # Next.js 14 App Router
│   ├── api/                      # API routes
│   │   ├── specs/               # Spec management API
│   │   └── knowledge/           # Knowledge search API
│   ├── specs/
│   │   └── browse/              # Spec browser page
│   └── knowledge-search/        # Knowledge search page
├── components/
│   └── specs/                   # Spec browser components
│       ├── SpecCard.tsx         # Individual spec card
│       ├── SpecGrid.tsx         # Grid layout
│       ├── SpecFilters.tsx      # Filter controls
│       ├── SpecSearch.tsx       # Search input
│       └── SpecDetailModal.tsx  # Detail modal
├── lib/
│   └── prisma.ts               # Prisma client
├── start-dev.ps1               # Development script (Windows)
├── dev.sh                      # Development script (Linux/macOS)
└── test-api-endpoints.js       # API test suite
```

## Phase 2.6: Spec Browser UI

The Spec Browser UI is complete with:

### Components
- **SpecCard** - Material-UI cards with color-coded categories/statuses
- **SpecGrid** - Responsive grid (1-3 columns), loading states, pagination
- **SpecFilters** - Multi-filter support (category, status, tags, required)
- **SpecSearch** - Debounced search (300ms)
- **SpecDetailModal** - 4 tabs (Overview, Content, Versions, Usage)

### Features
- ✅ Real-time search with debouncing
- ✅ Multiple filters (category, status, tags, required flag)
- ✅ URL query params for shareable filtered views
- ✅ Pagination with "Load More" button
- ✅ Markdown rendering for spec content
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Loading skeletons and empty states
- ✅ Full CRUD operations (view, edit, delete)

### Testing
```bash
# Run API tests
node test-api-endpoints.js

# Expected: 38/38 tests passing (100%)
```

## Next Steps

- Phase 2.7: Project Scaffolder UI
- Phase 3: Project Generator Engine
- Phase 4: Dify Integration & Spec Evolution
- Phase 5: Advanced Features
