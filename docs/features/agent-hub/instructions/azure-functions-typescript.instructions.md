---
description: 'TypeScript patterns for Azure Functions'
applyTo: '**/*.ts, **/*.js, **/*.json'
---

# Azure Functions TypeScript Development

## Code Generation Guidelines

- Generate modern TypeScript code for Node.js
- Use `async/await` for asynchronous code
- Prefer Node.js v20 built-in modules over external packages
- Always use Node.js async functions (e.g., `node:fs/promises` instead of `fs`)
  - Avoids blocking the event loop
- **Ask before adding** any extra dependencies to the project
- The API is built using Azure Functions with `@azure/functions@4` package
- Each endpoint should have its own function file
- Use naming convention: `src/functions/<resource-name>-<http-verb>.ts`
- When making API changes:
  - Update OpenAPI schema (if it exists)
  - Update `README.md` accordingly

## Function Structure

### HTTP Trigger Example
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

export async function getUserById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`HTTP function processed request for url "${request.url}"`);
    
    const userId = request.params.id;
    
    try {
        // Business logic here
        const user = await fetchUser(userId);
        
        return {
            status: 200,
            jsonBody: user
        };
    } catch (error) {
        context.error('Error fetching user:', error);
        return {
            status: 500,
            jsonBody: { error: 'Internal server error' }
        };
    }
}

app.http('getUserById', {
    methods: ['GET'],
    authLevel: 'function',
    route: 'users/{id}',
    handler: getUserById
});
```

## Best Practices

### 1. Async/Await Pattern
```typescript
// Good: Use async/await
export async function processData(request: HttpRequest): Promise<HttpResponseInit> {
    const data = await fetchDataAsync();
    const result = await transformData(data);
    return { jsonBody: result };
}

// Avoid: Callback hell
export function processDataBad(request: HttpRequest): Promise<HttpResponseInit> {
    return new Promise((resolve) => {
        fetchData((data) => {
            transformData(data, (result) => {
                resolve({ jsonBody: result });
            });
        });
    });
}
```

### 2. Error Handling
```typescript
export async function safeHandler(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const data = await riskyOperation();
        return { status: 200, jsonBody: data };
    } catch (error) {
        context.error('Operation failed:', error);
        
        if (error instanceof ValidationError) {
            return { status: 400, jsonBody: { error: error.message } };
        }
        
        return { status: 500, jsonBody: { error: 'Internal server error' } };
    }
}
```

### 3. Input Validation
```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    role: z.enum(['admin', 'user'])
});

export async function createUser(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    try {
        const body = await request.json();
        const validatedData = CreateUserSchema.parse(body);
        
        const user = await saveUser(validatedData);
        return { status: 201, jsonBody: user };
    } catch (error) {
        if (error instanceof z.ZodError) {
            return { status: 400, jsonBody: { errors: error.errors } };
        }
        throw error;
    }
}
```

### 4. Environment Configuration
```typescript
// Use environment variables for configuration
const config = {
    databaseUrl: process.env.DATABASE_URL!,
    apiKey: process.env.API_KEY!,
    environment: process.env.AZURE_FUNCTIONS_ENVIRONMENT || 'production'
};

// Validate required env vars at startup
if (!config.databaseUrl || !config.apiKey) {
    throw new Error('Missing required environment variables');
}
```

### 5. Logging Best Practices
```typescript
export async function processRequest(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log('Processing request', {
        method: request.method,
        url: request.url,
        userId: request.headers.get('x-user-id')
    });
    
    try {
        const result = await processData();
        context.log('Request processed successfully');
        return { status: 200, jsonBody: result };
    } catch (error) {
        context.error('Processing failed', {
            error: error.message,
            stack: error.stack
        });
        return { status: 500, jsonBody: { error: 'Processing failed' } };
    }
}
```

## Common Patterns

### Timer Trigger
```typescript
import { app, InvocationContext, Timer } from '@azure/functions';

export async function scheduleDataSync(myTimer: Timer, context: InvocationContext): Promise<void> {
    context.log('Timer function executed at:', new Date().toISOString());
    
    if (myTimer.isPastDue) {
        context.log('Timer is running late');
    }
    
    await performDataSync();
    context.log('Data sync completed');
}

app.timer('scheduleDataSync', {
    schedule: '0 */5 * * * *', // Every 5 minutes
    handler: scheduleDataSync
});
```

### Queue Trigger
```typescript
import { app, InvocationContext } from '@azure/functions';

export async function processQueueMessage(queueItem: unknown, context: InvocationContext): Promise<void> {
    context.log('Processing queue message', queueItem);
    
    try {
        await handleMessage(queueItem);
        context.log('Message processed successfully');
    } catch (error) {
        context.error('Message processing failed:', error);
        throw error; // Requeue message
    }
}

app.storageQueue('processQueueMessage', {
    queueName: 'myqueue',
    connection: 'AzureWebJobsStorage',
    handler: processQueueMessage
});
```

### Blob Trigger
```typescript
import { app, InvocationContext } from '@azure/functions';

export async function processBlobUpload(blob: Buffer, context: InvocationContext): Promise<void> {
    context.log(`Blob trigger function processed blob size: ${blob.length} bytes`);
    
    // Process blob content
    await processFile(blob);
}

app.storageBlob('processBlobUpload', {
    path: 'uploads/{name}',
    connection: 'AzureWebJobsStorage',
    handler: processBlobUpload
});
```

## Dependency Management

- Minimize external dependencies
- Use Node.js built-in modules when possible:
  - `node:fs/promises` for file operations
  - `node:path` for path manipulation
  - `node:crypto` for cryptographic operations
  - `node:http` / `node:https` for HTTP requests (or `fetch` in Node.js 18+)
- When adding dependencies:
  - Ask for approval first
  - Prefer well-maintained, popular packages
  - Check bundle size impact

## Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { HttpRequest, InvocationContext } from '@azure/functions';
import { getUserById } from '../src/functions/user-get';

describe('getUserById', () => {
    it('returns user data for valid ID', async () => {
        const request = new HttpRequest({
            url: 'https://example.com/api/users/123',
            method: 'GET',
            params: { id: '123' }
        });
        
        const context = {
            log: vi.fn(),
            error: vi.fn()
        } as unknown as InvocationContext;
        
        const response = await getUserById(request, context);
        
        expect(response.status).toBe(200);
        expect(response.jsonBody).toMatchObject({ id: '123' });
    });
});
```

## File Naming Conventions

- HTTP Functions: `<resource>-<verb>.ts`
  - `user-get.ts` (GET /users/{id})
  - `user-post.ts` (POST /users)
  - `user-put.ts` (PUT /users/{id})
  - `user-delete.ts` (DELETE /users/{id})
- Timer Functions: `<task>-timer.ts`
- Queue Functions: `<queue-name>-queue.ts`
- Blob Functions: `<container>-blob.ts`

## Performance Considerations

- Use connection pooling for database connections
- Cache frequently accessed data
- Minimize cold start impact:
  - Keep dependencies minimal
  - Lazy load heavy modules
  - Use Premium or Dedicated plans for production
- Implement proper timeout handling
- Use Durable Functions for long-running workflows

---

**Source**: [Azure Functions TypeScript - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/instructions/azure-functions-typescript.instructions.md)
