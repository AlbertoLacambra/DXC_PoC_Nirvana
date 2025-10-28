# Spec Library Manager API Documentation

## Overview

The Spec Library Manager API provides RESTful endpoints for managing specifications in the DXC Cloud Mind - Nirvana ecosystem. All endpoints return JSON responses with a consistent structure.

**Base URL**: `http://localhost:3000/api/specs`

**Authentication**: Currently none (to be implemented in Phase 3)

## Response Format

All API responses follow this structure:

### Success Response
```json
{
  "success": true,
  "data": <response_data>,
  "meta": {
    "total": 100,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "<error_type>",
  "message": "<detailed_error_message>"
}
```

## Endpoints

### 1. List Specs

**Endpoint**: `GET /api/specs`

**Description**: Retrieve a list of specs with optional filtering, pagination, sorting, and search.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | No | - | Filter by category (`development`, `infrastructure`, `security`, `testing`, `observability`, `finops`, `compliance`) |
| `status` | string | No | - | Filter by status (`draft`, `active`, `deprecated`, `archived`) |
| `tags` | string | No | - | Filter by tags (comma-separated) |
| `required` | boolean | No | - | Filter by required specs (`true`/`false`) |
| `search` | string | No | - | Search across name, displayName, description, and tags |
| `limit` | integer | No | 50 | Number of results to return (max 100) |
| `offset` | integer | No | 0 | Number of results to skip for pagination |
| `sortBy` | string | No | `popularity` | Sort field (`popularity`, `name`, `createdAt`, `updatedAt`) |
| `sortOrder` | string | No | `desc` | Sort order (`asc`, `desc`) |

**Example Request**:
```bash
curl "http://localhost:3000/api/specs?category=security&status=active&limit=10"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "security-best-practices",
      "displayName": "Security Best Practices",
      "description": "Comprehensive security guidelines for cloud applications",
      "category": "security",
      "status": "active",
      "tags": ["security", "compliance", "azure"],
      "applicableTo": ["nextjs", "nodejs", "python"],
      "required": true,
      "popularity": 95,
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-20T14:22:00Z",
      "_count": {
        "versions": 3,
        "usage": 42
      }
    }
  ],
  "meta": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Status Codes**:
- `200 OK`: Successful retrieval
- `500 Internal Server Error`: Server error

---

### 2. Create Spec

**Endpoint**: `POST /api/specs`

**Description**: Create a new specification with an initial version (1.0.0).

**Request Body**:

```json
{
  "name": "git-flow-best-practices",
  "displayName": "Git Flow Best Practices",
  "description": "Comprehensive Git Flow workflow guidelines",
  "category": "development",
  "content": "# Git Flow Best Practices\n\n...",
  "tags": ["git", "workflow", "ci-cd"],
  "applicableTo": ["all"],
  "dependencies": [],
  "conflicts": [],
  "required": false,
  "createdBy": "john.doe@dxc.com"
}
```

**Required Fields**:
- `name` (string, unique, max 100 chars)
- `displayName` (string, max 200 chars)
- `category` (enum: `development`, `infrastructure`, `security`, etc.)
- `content` (string, markdown content)

**Optional Fields**:
- `description` (string)
- `tags` (array of strings)
- `applicableTo` (array of strings)
- `dependencies` (array of spec names)
- `conflicts` (array of spec names)
- `required` (boolean, default: false)
- `minVersion` (string)
- `maxVersion` (string)
- `createdBy` (string, default: "API")

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/specs" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "git-flow-best-practices",
    "displayName": "Git Flow Best Practices",
    "category": "development",
    "content": "# Git Flow\n\nMain workflow..."
  }'
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "spec": {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "git-flow-best-practices",
      "displayName": "Git Flow Best Practices",
      "category": "development",
      "status": "draft",
      "createdAt": "2025-01-25T12:00:00Z"
    },
    "version": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "specId": "660e8400-e29b-41d4-a716-446655440001",
      "version": "1.0.0",
      "changelog": "Initial version",
      "createdAt": "2025-01-25T12:00:00Z"
    }
  },
  "message": "Spec created successfully"
}
```

**Status Codes**:
- `201 Created`: Spec created successfully
- `400 Bad Request`: Missing required fields
- `409 Conflict`: Spec with same name already exists
- `500 Internal Server Error`: Server error

---

### 3. Get Spec by ID

**Endpoint**: `GET /api/specs/:id`

**Description**: Retrieve detailed information about a specific spec, including recent versions and usage.

**Path Parameters**:
- `id` (string, UUID): Spec ID

**Example Request**:
```bash
curl "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "security-best-practices",
    "displayName": "Security Best Practices",
    "description": "Comprehensive security guidelines",
    "category": "security",
    "status": "active",
    "content": "# Security Best Practices\n\n...",
    "tags": ["security", "compliance"],
    "applicableTo": ["nextjs", "nodejs"],
    "dependencies": [],
    "conflicts": [],
    "required": true,
    "popularity": 95,
    "versions": [
      {
        "id": "880e8400-e29b-41d4-a716-446655440003",
        "version": "1.2.0",
        "changelog": "Added Azure security guidelines",
        "createdAt": "2025-01-20T14:22:00Z"
      },
      {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "version": "1.1.0",
        "changelog": "Updated OAuth2 section",
        "createdAt": "2025-01-18T09:15:00Z"
      }
    ],
    "usage": [
      {
        "id": "990e8400-e29b-41d4-a716-446655440004",
        "projectId": "project-123",
        "projectName": "Customer Portal",
        "appliedAt": "2025-01-22T10:00:00Z"
      }
    ],
    "_count": {
      "versions": 5,
      "usage": 42
    }
  }
}
```

**Status Codes**:
- `200 OK`: Spec found
- `404 Not Found`: Spec not found
- `500 Internal Server Error`: Server error

---

### 4. Update Spec

**Endpoint**: `PUT /api/specs/:id`

**Description**: Update an existing spec's metadata. Content updates should create a new version instead.

**Path Parameters**:
- `id` (string, UUID): Spec ID

**Request Body** (all fields optional):
```json
{
  "displayName": "Updated Security Best Practices",
  "description": "Updated description",
  "category": "security",
  "status": "active",
  "tags": ["security", "compliance", "azure"],
  "applicableTo": ["nextjs", "nodejs", "python"],
  "dependencies": ["git-flow-best-practices"],
  "conflicts": [],
  "required": true,
  "minVersion": "1.0.0",
  "maxVersion": "2.0.0"
}
```

**Example Request**:
```bash
curl -X PUT "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"status": "active", "required": true}'
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "security-best-practices",
    "displayName": "Updated Security Best Practices",
    "status": "active",
    "required": true,
    "updatedAt": "2025-01-25T12:30:00Z"
  },
  "message": "Spec updated successfully"
}
```

**Status Codes**:
- `200 OK`: Spec updated successfully
- `404 Not Found`: Spec not found
- `500 Internal Server Error`: Server error

---

### 5. Delete Spec

**Endpoint**: `DELETE /api/specs/:id`

**Description**: Delete a spec. Fails if the spec is currently in use by projects. Use archiving instead for used specs.

**Path Parameters**:
- `id` (string, UUID): Spec ID

**Example Request**:
```bash
curl -X DELETE "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000"
```

**Example Response (Success)**:
```json
{
  "success": true,
  "message": "Spec deleted successfully"
}
```

**Example Response (In Use)**:
```json
{
  "success": false,
  "error": "Spec is in use",
  "message": "Cannot delete spec. It is currently used in 5 project(s). Consider archiving instead."
}
```

**Status Codes**:
- `200 OK`: Spec deleted successfully
- `404 Not Found`: Spec not found
- `409 Conflict`: Spec is in use, cannot delete
- `500 Internal Server Error`: Server error

---

### 6. Full-Text Search

**Endpoint**: `GET /api/specs/search`

**Description**: Perform full-text search across spec name, displayName, description, and tags using PostgreSQL's advanced search capabilities. Results are ranked by relevance.

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `q` | string | **Yes** | - | Search query |
| `limit` | integer | No | 50 | Number of results to return |
| `offset` | integer | No | 0 | Number of results to skip |

**Example Request**:
```bash
curl "http://localhost:3000/api/specs/search?q=security%20oauth&limit=10"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "security-best-practices",
      "displayName": "Security Best Practices",
      "description": "Comprehensive security guidelines including OAuth2",
      "category": "security",
      "status": "active",
      "tags": ["security", "oauth", "compliance"],
      "relevance": 0.876,
      "versionCount": 5,
      "usageCount": 42
    }
  ],
  "meta": {
    "query": "security oauth",
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Status Codes**:
- `200 OK`: Search completed successfully
- `400 Bad Request`: Missing query parameter
- `500 Internal Server Error`: Server error

---

### 7. List Versions

**Endpoint**: `GET /api/specs/:id/versions`

**Description**: Retrieve all versions of a specific spec with pagination.

**Path Parameters**:
- `id` (string, UUID): Spec ID

**Query Parameters**:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 50 | Number of results to return |
| `offset` | integer | No | 0 | Number of results to skip |

**Example Request**:
```bash
curl "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000/versions?limit=10"
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "specId": "550e8400-e29b-41d4-a716-446655440000",
      "version": "1.2.0",
      "content": "# Security Best Practices v1.2.0\n\n...",
      "changelog": "Added Azure security guidelines",
      "createdAt": "2025-01-20T14:22:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "specId": "550e8400-e29b-41d4-a716-446655440000",
      "version": "1.1.0",
      "content": "# Security Best Practices v1.1.0\n\n...",
      "changelog": "Updated OAuth2 section",
      "createdAt": "2025-01-18T09:15:00Z"
    }
  ],
  "meta": {
    "specId": "550e8400-e29b-41d4-a716-446655440000",
    "specName": "security-best-practices",
    "total": 5,
    "limit": 10,
    "offset": 0,
    "hasMore": false
  }
}
```

**Status Codes**:
- `200 OK`: Versions retrieved successfully
- `404 Not Found`: Spec not found
- `500 Internal Server Error`: Server error

---

### 8. Create Version

**Endpoint**: `POST /api/specs/:id/versions`

**Description**: Create a new version of a spec. Version numbers must follow semantic versioning (e.g., 1.2.3).

**Path Parameters**:
- `id` (string, UUID): Spec ID

**Request Body**:
```json
{
  "version": "1.3.0",
  "content": "# Security Best Practices v1.3.0\n\nUpdated content...",
  "changelog": "Added multi-factor authentication guidelines"
}
```

**Required Fields**:
- `version` (string, semantic version format: X.Y.Z)
- `content` (string, markdown content)

**Optional Fields**:
- `changelog` (string, default: "Version X.Y.Z")

**Example Request**:
```bash
curl -X POST "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000/versions" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.3.0",
    "content": "# Security v1.3.0\n\n...",
    "changelog": "Added MFA guidelines"
  }'
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "id": "aa0e8400-e29b-41d4-a716-446655440005",
    "specId": "550e8400-e29b-41d4-a716-446655440000",
    "version": "1.3.0",
    "content": "# Security v1.3.0\n\n...",
    "changelog": "Added MFA guidelines",
    "createdAt": "2025-01-25T15:00:00Z"
  },
  "message": "Version 1.3.0 created successfully"
}
```

**Status Codes**:
- `201 Created`: Version created successfully
- `400 Bad Request`: Missing required fields or invalid version format
- `404 Not Found`: Spec not found
- `409 Conflict`: Version already exists
- `500 Internal Server Error`: Server error

---

## Data Models

### Spec Object

```typescript
{
  id: string;                    // UUID
  name: string;                  // Unique identifier (kebab-case)
  displayName: string;           // Human-readable name
  description?: string;          // Optional description
  category: SpecCategory;        // Enum: development, infrastructure, etc.
  status: SpecStatus;            // Enum: draft, active, deprecated, archived
  content: string;               // Markdown content
  tags: string[];                // Array of tags
  applicableTo: string[];        // Array of applicable project types
  dependencies: string[];        // Array of dependent spec names
  conflicts: string[];           // Array of conflicting spec names
  required: boolean;             // Is this spec required?
  popularity: number;            // Calculated usage score (0-100)
  minVersion?: string;           // Minimum compatible version
  maxVersion?: string;           // Maximum compatible version
  createdBy: string;             // Creator identifier
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last update timestamp
}
```

### SpecVersion Object

```typescript
{
  id: string;                    // UUID
  specId: string;                // Parent spec ID (UUID)
  version: string;               // Semantic version (X.Y.Z)
  content: string;               // Markdown content for this version
  changelog: string;             // Description of changes
  createdAt: Date;               // Creation timestamp
}
```

### SpecUsage Object

```typescript
{
  id: string;                    // UUID
  specId: string;                // Applied spec ID (UUID)
  projectId: string;             // Project identifier
  projectName?: string;          // Optional project name
  appliedAt: Date;               // Application timestamp
}
```

---

## Enums

### SpecCategory

- `development` - Development workflows and practices
- `infrastructure` - Infrastructure as Code and deployment
- `security` - Security guidelines and compliance
- `testing` - Testing strategies and frameworks
- `observability` - Monitoring and logging
- `finops` - Cloud cost optimization
- `compliance` - Regulatory compliance

### SpecStatus

- `draft` - Work in progress, not ready for use
- `active` - Ready for use in projects
- `deprecated` - Superseded, use discouraged
- `archived` - No longer maintained

---

## Error Codes

| HTTP Status | Error Type | Description |
|-------------|------------|-------------|
| 400 | Bad Request | Missing required fields or invalid parameters |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource or constraint violation |
| 500 | Internal Server Error | Unexpected server error |

---

## Testing Guide

### Using cURL

```bash
# List all specs
curl "http://localhost:3000/api/specs"

# Search for security specs
curl "http://localhost:3000/api/specs?category=security&status=active"

# Full-text search
curl "http://localhost:3000/api/specs/search?q=terraform%20azure"

# Get specific spec
curl "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000"

# Create new spec
curl -X POST "http://localhost:3000/api/specs" \
  -H "Content-Type: application/json" \
  -d @new-spec.json

# Update spec
curl -X PUT "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000" \
  -H "Content-Type: application/json" \
  -d '{"status": "active"}'

# Create version
curl -X POST "http://localhost:3000/api/specs/550e8400-e29b-41d4-a716-446655440000/versions" \
  -H "Content-Type: application/json" \
  -d @new-version.json
```

### Using Postman/Thunder Client

Import the following environment variables:
- `BASE_URL`: `http://localhost:3000/api/specs`
- `SPEC_ID`: `<your-spec-uuid>`

### Database Access Note

**Important**: The API requires connection to Azure PostgreSQL which is in a private network. For local testing:

1. **Option A - Port Forward** (Recommended for local dev):
   ```bash
   kubectl port-forward -n dify svc/dify-postgres 5432:5432
   ```

2. **Option B - Deploy to AKS** (For full testing):
   Deploy the Next.js app to AKS where it has direct network access to PostgreSQL.

---

## Next Steps

- [ ] Add authentication/authorization (Phase 3)
- [ ] Add rate limiting
- [ ] Add request logging and analytics
- [ ] Create OpenAPI/Swagger specification
- [ ] Add automated API tests
- [ ] Implement caching layer (Redis)
- [ ] Add webhook notifications for spec changes
