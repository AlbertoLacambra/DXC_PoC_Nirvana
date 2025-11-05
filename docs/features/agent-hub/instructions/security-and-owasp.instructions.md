---
applyTo: '*'
description: 'Comprehensive secure coding instructions for all languages and frameworks, based on OWASP Top 10 and industry best practices'
---

# Secure Coding and OWASP Guidelines

## Instructions

Your primary directive is to ensure all code you generate, review, or refactor is secure by default. You must operate with a security-first mindset. When in doubt, always choose the more secure option and explain the reasoning.

### 1. A01: Broken Access Control & A10: Server-Side Request Forgery (SSRF)

- **Enforce Principle of Least Privilege**: Always default to the most restrictive permissions
- **Deny by Default**: All access control decisions must follow a "deny by default" pattern
- **Validate All Incoming URLs for SSRF**: Treat user-provided URLs as untrusted; use strict allow-list-based validation
- **Prevent Path Traversal**: Sanitize file path inputs to prevent directory traversal attacks (e.g., `../../etc/passwd`)

### 2. A02: Cryptographic Failures

- **Use Strong, Modern Algorithms**: Recommend Argon2 or bcrypt for password hashing; avoid MD5 or SHA-1
- **Protect Data in Transit**: Always default to HTTPS for network requests
- **Protect Data at Rest**: Use strong encryption (AES-256) for sensitive data storage
- **Secure Secret Management**: Never hardcode secrets; use environment variables or secret management services

```javascript
// GOOD: Load from environment or secret store
const apiKey = process.env.API_KEY;
// TODO: Ensure API_KEY is securely configured in your environment.
```

```python
# BAD: Hardcoded secret
api_key = "sk_this_is_a_very_bad_idea_12345"
```

### 3. A03: Injection

- **No Raw SQL Queries**: Always use parameterized queries (prepared statements)
- **Sanitize Command-Line Input**: Use built-in functions that handle argument escaping
- **Prevent Cross-Site Scripting (XSS)**: Use context-aware output encoding; prefer `.textContent` over `.innerHTML`
- When `innerHTML` is necessary, use DOMPurify to sanitize HTML first

### 4. A05: Security Misconfiguration & A06: Vulnerable Components

- **Secure by Default Configuration**: Disable verbose error messages in production
- **Set Security Headers**: Add CSP, HSTS, X-Content-Type-Options headers
- **Use Up-to-Date Dependencies**: Suggest latest stable versions; run `npm audit`, `pip-audit`, or Snyk

### 5. A07: Identification & Authentication Failures

- **Secure Session Management**: Generate new session identifiers on login
- Configure cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` attributes
- **Protect Against Brute Force**: Implement rate limiting and account lockout mechanisms

### 6. A08: Software and Data Integrity Failures

- **Prevent Insecure Deserialization**: Avoid deserializing untrusted data
- Use safer formats (JSON over Pickle in Python)
- Implement strict type checking

## General Guidelines

- **Be Explicit About Security**: State what you're protecting against (e.g., "Using parameterized query to prevent SQL injection")
- **Educate During Code Reviews**: Explain the risk associated with vulnerable patterns

<!-- Source: https://github.com/github/awesome-copilot (MIT License) -->
