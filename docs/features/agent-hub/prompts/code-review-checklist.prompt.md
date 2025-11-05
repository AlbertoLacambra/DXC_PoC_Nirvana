---
description: 'Comprehensive code review checklist covering code quality, security, performance, testing, documentation, and best practices for thorough pull request reviews.'
mode: 'agent'
tools: ['changes', 'problems', 'usages']
---

# Code Review Checklist

Comprehensive code review guide for evaluating pull requests. Focus on code quality, security, performance, maintainability, and best practices.

## Review Process

### 1. Understand the Context
- Read the PR description and linked issues
- Understand the problem being solved
- Review related documentation or RFCs
- Check if acceptance criteria are met

### 2. High-Level Review
- Evaluate overall approach and architecture
- Verify alignment with project standards
- Check for missing requirements
- Identify potential alternative approaches

### 3. Detailed Code Review
- Use the checklist sections below
- Leave constructive, specific comments
- Distinguish between blocking issues and suggestions
- Approve, request changes, or comment

## Code Quality Checklist

### Readability & Clarity
- [ ] Code is self-documenting with clear variable/function names
- [ ] Complex logic has explanatory comments
- [ ] Functions are focused with single responsibility
- [ ] Consistent code style (formatting, naming conventions)
- [ ] No commented-out code or debug statements
- [ ] Magic numbers replaced with named constants

### Design & Architecture
- [ ] Follows SOLID principles
- [ ] Avoids code duplication (DRY)
- [ ] Appropriate abstraction level
- [ ] Proper separation of concerns
- [ ] Consistent with existing architecture patterns
- [ ] No over-engineering for current requirements

### Error Handling
- [ ] All error cases handled appropriately
- [ ] Errors logged with sufficient context
- [ ] User-facing errors have clear messages
- [ ] No swallowed exceptions
- [ ] Graceful degradation for non-critical failures
- [ ] Appropriate use of error types/codes

## Security Checklist

### Input Validation
- [ ] All user inputs validated (type, length, format)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (input sanitization, output encoding)
- [ ] Command injection prevention
- [ ] Path traversal prevention
- [ ] CSRF protection for state-changing operations

### Authentication & Authorization
- [ ] Authentication required for protected endpoints
- [ ] Authorization checks before resource access
- [ ] No hardcoded credentials or API keys
- [ ] Secure session management
- [ ] Password hashing with strong algorithms (bcrypt, Argon2)
- [ ] Proper role-based access control (RBAC)

### Data Protection
- [ ] Sensitive data encrypted in transit (HTTPS/TLS)
- [ ] Sensitive data encrypted at rest
- [ ] No sensitive data in logs
- [ ] PII handled according to privacy regulations
- [ ] Secure random number generation (cryptographic)
- [ ] Proper secret management (env vars, vault)

### Dependencies
- [ ] No known vulnerable dependencies
- [ ] Dependencies from trusted sources
- [ ] Minimal dependency footprint
- [ ] Dependencies pinned to specific versions
- [ ] License compliance verified

## Performance Checklist

### Efficiency
- [ ] Appropriate algorithm complexity (time/space)
- [ ] No unnecessary computations in loops
- [ ] Efficient data structures chosen
- [ ] Database queries optimized (indexes, joins)
- [ ] Pagination for large datasets
- [ ] Caching used where appropriate

### Resource Management
- [ ] No memory leaks (proper cleanup, disposal)
- [ ] File handles/connections closed properly
- [ ] No infinite loops or unbounded recursion
- [ ] Rate limiting for external API calls
- [ ] Timeouts configured for network operations
- [ ] Resource pooling for expensive operations (DB connections)

### Scalability
- [ ] Code scales with increased load
- [ ] No hardcoded limits that prevent scaling
- [ ] Stateless design where possible
- [ ] Asynchronous processing for long-running tasks
- [ ] Appropriate concurrency handling
- [ ] Database indexes for query performance

## Testing Checklist

### Test Coverage
- [ ] Unit tests for new/modified code
- [ ] Edge cases tested (boundary conditions, null/empty)
- [ ] Error paths tested
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for critical workflows
- [ ] Test coverage meets project standards (e.g., 80%)

### Test Quality
- [ ] Tests are deterministic (no flaky tests)
- [ ] Tests are isolated (no dependencies between tests)
- [ ] Test names clearly describe what's being tested
- [ ] Assertions are specific and meaningful
- [ ] Test data is realistic and representative
- [ ] Mocks/stubs used appropriately

### Testability
- [ ] Code is testable (injectable dependencies)
- [ ] No tight coupling to external services
- [ ] Clear separation of logic and I/O
- [ ] Test fixtures/helpers available
- [ ] CI pipeline runs all tests
- [ ] Tests run quickly (< 10 minutes for full suite)

## Documentation Checklist

### Code Documentation
- [ ] Public APIs have documentation comments (JSDoc, etc.)
- [ ] Complex algorithms explained
- [ ] Non-obvious decisions documented
- [ ] Examples provided for public APIs
- [ ] Parameter and return types documented
- [ ] Deprecation notices for deprecated code

### Project Documentation
- [ ] README updated if user-facing changes
- [ ] API documentation updated
- [ ] Architecture docs updated for structural changes
- [ ] Migration guide for breaking changes
- [ ] Changelog/release notes updated
- [ ] Environment variable docs updated

### Comments
- [ ] Comments explain "why", not "what"
- [ ] No outdated or misleading comments
- [ ] TODOs include context and ownership
- [ ] Complex business logic explained
- [ ] Workarounds documented with links to issues

## Database Checklist

### Schema Changes
- [ ] Migrations are reversible (have up/down)
- [ ] Backward compatible (no breaking changes)
- [ ] Indexes added for new query patterns
- [ ] Foreign key constraints defined
- [ ] Appropriate column types and constraints
- [ ] No data loss during migration

### Queries
- [ ] Efficient queries (avoid N+1, use joins)
- [ ] Proper indexing for WHERE/JOIN/ORDER BY
- [ ] Parameterized queries (no SQL injection)
- [ ] Pagination for large result sets
- [ ] Transactions used for multi-step operations
- [ ] Query performance tested with realistic data

## Configuration & Deployment

### Configuration
- [ ] No hardcoded configuration values
- [ ] Environment-specific config in env vars
- [ ] Secrets managed securely (not in code)
- [ ] Default values sensible and secure
- [ ] Configuration validation on startup
- [ ] Documentation for all config options

### Deployment
- [ ] Backward compatible with current production
- [ ] Database migrations run before deployment
- [ ] Feature flags for risky changes
- [ ] Rollback plan documented
- [ ] Monitoring/logging for new features
- [ ] Health checks updated if needed

## API Design Checklist

### REST APIs
- [ ] Proper HTTP methods (GET, POST, PUT, DELETE)
- [ ] Appropriate status codes (200, 201, 400, 404, 500)
- [ ] Consistent URL structure (/resources/:id)
- [ ] Versioning strategy (URL or header)
- [ ] Pagination for list endpoints
- [ ] Rate limiting implemented

### Request/Response
- [ ] Request validation (required fields, types, formats)
- [ ] Clear error messages with actionable guidance
- [ ] Consistent response format
- [ ] Appropriate content types (JSON, XML)
- [ ] CORS configured correctly
- [ ] Request/response schemas documented

## Git Hygiene

### Commits
- [ ] Clear, descriptive commit messages
- [ ] Commits are logical units of work
- [ ] No merge commits (use rebase)
- [ ] No sensitive data in commit history
- [ ] Commits follow conventional commits format
- [ ] Commit messages reference issues/tickets

### Branch Management
- [ ] Branch name follows naming convention
- [ ] Up-to-date with target branch
- [ ] No unnecessary files (build artifacts, IDE configs)
- [ ] .gitignore properly configured
- [ ] No conflicts with target branch

## Review Etiquette

### For Reviewers
- Be constructive and respectful
- Explain the "why" behind suggestions
- Distinguish between blockers and suggestions
- Recognize good work ("LGTM with minor suggestions")
- Approve promptly when criteria are met
- Use "Request Changes" only for blocking issues

### For Authors
- Respond to all comments (even if just 👍)
- Explain reasoning when disagreeing
- Ask for clarification when needed
- Keep PR scope focused
- Update PR when addressing feedback
- Thank reviewers for their time

## Blocking vs Non-Blocking Issues

### Blocking (Request Changes)
- Security vulnerabilities
- Data loss or corruption risks
- Breaking changes without migration path
- Critical bugs or logic errors
- Missing essential tests
- Performance regressions

### Non-Blocking (Comment/Approve)
- Code style preferences (if linter doesn't catch)
- Minor refactoring suggestions
- Documentation improvements
- Additional test cases
- Performance optimizations (if not critical)

Focus on ensuring code is secure, maintainable, and meets requirements. Balance thoroughness with pragmatism.

---

**Source**: [Code Review Checklist - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/code-review-checklist.prompt.md)
