---
description: 'Node.js development best practices and patterns'
applyTo: '**/*.js, **/package.json'
---

# Node.js Development Best Practices

## General Guidelines

- Use modern JavaScript (ES6+) features
- Prefer `async/await` over callbacks and promise chains
- Use `const` by default, `let` when reassignment is needed, avoid `var`
- Follow consistent code style (use ESLint and Prettier)
- Write modular, reusable code
- Handle errors properly and consistently

## Project Structure

- Organize code by feature/domain rather than technical role
- Keep configuration separate from code
- Use environment variables for configuration
- Maintain a clear separation of concerns
- Group related files together

## Asynchronous Patterns

### Async/Await

- Prefer `async/await` over raw promises for readability
- Always wrap `await` calls in try/catch for error handling
- Avoid blocking the event loop with synchronous operations
- Use `Promise.all()` for parallel async operations
- Use `Promise.allSettled()` when you need all results regardless of failures

### Error Handling

- Always handle promise rejections
- Use try/catch blocks with async/await
- Implement global error handlers for uncaught exceptions
- Log errors with sufficient context
- Return meaningful error messages to clients

## Security Best Practices

### Input Validation

- Validate all user input
- Sanitize data before processing
- Use libraries like Joi or Yup for schema validation
- Implement rate limiting to prevent abuse
- Use parameterized queries to prevent SQL injection

### Authentication & Authorization

- Use established libraries (Passport.js, JWT)
- Store passwords using bcrypt or argon2
- Implement proper session management
- Use HTTPS for all communications
- Set secure HTTP headers (helmet.js)

### Dependencies

- Regularly update dependencies
- Run `npm audit` to check for vulnerabilities
- Use exact versions in production (`npm ci`)
- Review dependencies before adding them
- Minimize the number of dependencies

## Performance Optimization

### Event Loop

- Avoid blocking the event loop
- Use worker threads for CPU-intensive tasks
- Implement proper queuing for background jobs
- Use streaming for large data processing
- Profile and monitor application performance

### Memory Management

- Avoid memory leaks (remove event listeners, clear intervals)
- Use streams for large file processing
- Implement proper caching strategies
- Monitor memory usage in production
- Use connection pooling for databases

## API Design

### RESTful APIs

- Use appropriate HTTP methods (GET, POST, PUT, DELETE)
- Return proper HTTP status codes
- Implement versioning (URL or header-based)
- Use meaningful endpoint names
- Document APIs (OpenAPI/Swagger)

### Express.js Best Practices

- Use middleware for cross-cutting concerns
- Implement error-handling middleware
- Use routers to organize routes
- Validate request bodies and parameters
- Set appropriate response headers

## Testing

### Unit Tests

- Write tests for business logic
- Use a testing framework (Jest, Mocha, AVA)
- Mock external dependencies
- Aim for high code coverage
- Keep tests fast and isolated

### Integration Tests

- Test API endpoints
- Use test databases
- Clean up test data after each test
- Test error scenarios
- Use supertest for HTTP testing

## Logging and Monitoring

- Use a structured logging library (Winston, Pino)
- Log at appropriate levels (error, warn, info, debug)
- Include context in log messages
- Avoid logging sensitive information
- Implement application monitoring (APM)
- Track performance metrics

## Common Patterns

### Module Exports

- Use named exports for multiple exports
- Use default exports for single export
- Keep exports at the end of the file
- Avoid circular dependencies

### Configuration Management

- Use dotenv for environment variables
- Validate configuration on startup
- Keep secrets out of version control
- Use different configs for different environments

## Common Pitfalls to Avoid

- Callback hell (use async/await instead)
- Unhandled promise rejections
- Blocking the event loop
- Memory leaks
- Not validating input
- Exposing sensitive information in error messages
- Using `eval()` or similar dangerous functions
- Not implementing proper error handling

<!-- Source: https://github.com/github/awesome-copilot (MIT License) -->
