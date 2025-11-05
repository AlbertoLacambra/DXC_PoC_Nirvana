---
description: 'Generate complete technical documentation for projects, APIs, libraries, or systems with comprehensive guides, API references, architecture diagrams, and usage examples.'
mode: 'agent'
tools: ['changes', 'search/codebase', 'edit/editFiles', 'problems', 'usages']
---

# Generate Documentation

Expert technical writer creating comprehensive documentation for ${selection} (or entire project if no selection). Focus on clarity, completeness, and developer experience.

## Documentation Types

### 1. API Documentation
- **Endpoints**: HTTP method, path, authentication requirements
- **Request**: Parameters (path, query, body), headers, example payload
- **Response**: Status codes, schema, example responses
- **Errors**: Error codes, messages, resolution steps
- **Code Examples**: cURL, JavaScript, Python, Java

### 2. Library/SDK Documentation
- **Installation**: Package manager commands, prerequisites
- **Quick Start**: Minimal working example
- **Configuration**: Environment variables, config files, options
- **API Reference**: Classes, methods, parameters, return types
- **Examples**: Common use cases with complete code

### 3. Architecture Documentation
- **System Overview**: High-level architecture diagram
- **Components**: Services, databases, message queues, caches
- **Data Flow**: Request lifecycle, integration points
- **Infrastructure**: Deployment architecture, scaling strategy
- **Security**: Authentication, authorization, data protection

### 4. User Guides
- **Getting Started**: Prerequisites, installation, first steps
- **Features**: Detailed feature walkthroughs with screenshots
- **Tutorials**: Step-by-step guides for common tasks
- **Troubleshooting**: Common issues and solutions
- **FAQ**: Frequently asked questions

## Documentation Structure

### Project README Template
```markdown
# Project Name

Brief description (1-2 sentences).

## Features

- Key feature 1
- Key feature 2
- Key feature 3

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+

## Installation

\`\`\`bash
npm install
cp .env.example .env
npm run db:migrate
\`\`\`

## Quick Start

\`\`\`javascript
import { Client } from 'project-name';

const client = new Client({ apiKey: 'your-key' });
const result = await client.doSomething();
\`\`\`

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| API_KEY | Authentication key | - |
| PORT | Server port | 3000 |

## Documentation

- [API Reference](docs/api.md)
- [Architecture Guide](docs/architecture.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
```

### API Endpoint Documentation Template
```markdown
## POST /api/users

Create a new user account.

### Authentication

Requires API key in `X-API-Key` header.

### Request

**Headers**:
- `Content-Type: application/json`
- `X-API-Key: <your-api-key>`

**Body**:
\`\`\`json
{
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin"
}
\`\`\`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| name | string | Yes | Full name (2-100 chars) |
| role | string | No | User role: admin, user |

### Response

**Success (201 Created)**:
\`\`\`json
{
  "id": "usr_123abc",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "created_at": "2024-01-15T10:30:00Z"
}
\`\`\`

**Error (400 Bad Request)**:
\`\`\`json
{
  "error": "VALIDATION_ERROR",
  "message": "Invalid email format",
  "field": "email"
}
\`\`\`

### Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| VALIDATION_ERROR | Invalid input | Check field constraints |
| DUPLICATE_EMAIL | Email already exists | Use different email |
| UNAUTHORIZED | Invalid API key | Verify API key |

### Examples

**cURL**:
\`\`\`bash
curl -X POST https://api.example.com/api/users \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: your-key" \\
  -d '{"email": "user@example.com", "name": "John Doe"}'
\`\`\`

**JavaScript**:
\`\`\`javascript
const response = await fetch('https://api.example.com/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-key'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe'
  })
});
\`\`\`
```

### Class/Method Documentation Template
```markdown
## Class: DatabaseClient

Manages database connections and query execution.

### Constructor

\`\`\`typescript
new DatabaseClient(options: DatabaseOptions)
\`\`\`

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| options | DatabaseOptions | Connection configuration |
| options.host | string | Database host |
| options.port | number | Database port |
| options.database | string | Database name |
| options.poolSize | number | Max connections (default: 10) |

**Example**:
\`\`\`typescript
const db = new DatabaseClient({
  host: 'localhost',
  port: 5432,
  database: 'myapp',
  poolSize: 20
});
\`\`\`

### Methods

#### query()

Execute a SQL query with parameterized inputs.

\`\`\`typescript
async query<T>(sql: string, params?: any[]): Promise<T[]>
\`\`\`

**Parameters**:
- `sql`: SQL query with `$1`, `$2` placeholders
- `params`: Array of parameter values

**Returns**: Array of result rows

**Throws**: `DatabaseError` if query fails

**Example**:
\`\`\`typescript
const users = await db.query<User>(
  'SELECT * FROM users WHERE role = $1',
  ['admin']
);
\`\`\`
```

## Best Practices

### 1. Write for Your Audience
- **Beginners**: Step-by-step tutorials, screenshots, prerequisites
- **Advanced**: Technical deep-dives, architecture diagrams, performance tuning
- **API Users**: Complete reference, code examples, error handling

### 2. Use Code Examples
- Provide runnable, complete examples
- Show common use cases and edge cases
- Include error handling
- Use realistic data

### 3. Keep Documentation Updated
- Update docs when code changes
- Version documentation with releases
- Mark deprecated features clearly
- Include migration guides for breaking changes

### 4. Structure for Discoverability
- Clear table of contents
- Logical hierarchy (README → Guides → API Reference)
- Search-friendly headers
- Cross-link related sections

### 5. Include Visual Aids
- Architecture diagrams (C4, UML, flowcharts)
- Screenshots for UI features
- Sequence diagrams for workflows
- Entity-relationship diagrams for data models

### 6. Document Edge Cases
- Error scenarios and recovery
- Rate limiting and quotas
- Concurrent access behavior
- Performance characteristics (time/space complexity)

## Documentation Checklist

### README.md
- [ ] Project description (what, why, key features)
- [ ] Prerequisites and system requirements
- [ ] Installation instructions
- [ ] Quick start example
- [ ] Links to detailed documentation
- [ ] License information
- [ ] Contributing guidelines

### API Documentation
- [ ] All endpoints documented (method, path, auth)
- [ ] Request/response schemas with examples
- [ ] Error codes and resolution steps
- [ ] Code examples in multiple languages
- [ ] Rate limiting and pagination details
- [ ] Versioning information

### Architecture Documentation
- [ ] System architecture diagram
- [ ] Component descriptions and responsibilities
- [ ] Data flow diagrams
- [ ] Technology stack
- [ ] Deployment architecture
- [ ] Security architecture
- [ ] Scalability considerations

### Code Documentation
- [ ] Public API reference (classes, methods, functions)
- [ ] Parameter types and descriptions
- [ ] Return types and possible values
- [ ] Exceptions/errors thrown
- [ ] Usage examples
- [ ] Performance notes

### User Guides
- [ ] Getting started tutorial
- [ ] Feature walkthroughs
- [ ] Configuration guide
- [ ] Troubleshooting section
- [ ] FAQ
- [ ] Glossary of terms

## Tools & Formats

- **Markdown**: README, guides, wiki pages
- **OpenAPI/Swagger**: REST API specifications
- **JSDoc/TypeDoc**: JavaScript/TypeScript API docs
- **Sphinx**: Python documentation
- **JavaDoc**: Java API documentation
- **Mermaid**: Diagrams in markdown
- **Docusaurus/MkDocs**: Documentation websites

## Accessibility

- Use clear, concise language
- Define technical terms
- Provide alt text for images
- Use semantic heading structure
- Ensure code examples are copy-pasteable
- Support keyboard navigation (for web docs)

Focus on creating documentation that helps developers succeed quickly. Prioritize clarity and completeness over brevity. Always include working code examples.

---

**Source**: [Generate Documentation - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/generate-documentation.prompt.md)
