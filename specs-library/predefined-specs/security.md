# Security Best Practices

**Domain**: Application Security & Compliance  
**Version**: 1.0  
**Last Updated**: 2025-10-27  
**Applicable To**: All software projects

---

## Overview

Esta especificación define las mejores prácticas de seguridad para proyectos en DXC Cloud Mind - Nirvana.  
Cubre autenticación, autorización, protección de datos, scanning de vulnerabilidades y compliance.

**¿Por qué esta spec?**

- Prevenir brechas de seguridad y pérdida de datos
- Cumplir con estándares de la industria (OWASP, GDPR, SOC2)
- Proteger credenciales y secrets
- Detectar vulnerabilidades antes de producción

**Aplicable a**:

- ✅ Todos los proyectos (backend, frontend, IaC)
- ✅ Aplicaciones que manejan datos de usuarios
- ✅ Servicios con autenticación/autorización
- ✅ Integraciones con APIs externas

---

## 1. Secrets Management

### Rules

**NUNCA commitear secrets en código**:

- ❌ API keys, passwords, tokens, private keys
- ❌ Connection strings con credenciales
- ❌ OAuth client secrets
- ❌ Encryption keys, certificates

### Storage Solutions

#### Production

**Mandatory**: Usar **Azure Key Vault** o equivalente

```typescript
// ✅ CORRECTO: Azure Key Vault
import { DefaultAzureCredential } from "@azure/identity";
import { SecretClient } from "@azure/keyvault-secrets";

const credential = new DefaultAzureCredential();
const client = new SecretClient(
  "https://nirvana-keyvault.vault.azure.net/",
  credential
);

const secret = await client.getSecret("DATABASE_PASSWORD");
const dbPassword = secret.value;
```

```python
# ✅ CORRECTO: Azure Key Vault (Python)
from azure.identity import DefaultAzureCredential
from azure.keyvault.secrets import SecretClient

credential = DefaultAzureCredential()
client = SecretClient(
    vault_url="https://nirvana-keyvault.vault.azure.net/",
    credential=credential
)

db_password = client.get_secret("DATABASE_PASSWORD").value
```

#### Development

**Use `.env` files** (MUST be in `.gitignore`)

```bash
# .env (NEVER commit this!)
DATABASE_URL=postgresql://user:pass@localhost:5432/mydb
AZURE_OPENAI_API_KEY=sk-abc123...
SENDGRID_API_KEY=SG.xyz789...
```

```javascript
// Load with dotenv
require('dotenv').config();

const dbUrl = process.env.DATABASE_URL;
```

**.env.example** (commit this, without secrets)

```bash
# .env.example (safe to commit)
DATABASE_URL=postgresql://user:password@host:5432/dbname
AZURE_OPENAI_API_KEY=your-openai-key-here
SENDGRID_API_KEY=your-sendgrid-key-here
```

### Environment Variable Naming

**Conventions**:

```bash
# ✅ CORRECTO (prefijos claros, uppercase)
DATABASE_URL=postgresql://...
AZURE_OPENAI_API_KEY=sk-...
AZURE_OPENAI_ENDPOINT=https://...
REDIS_CONNECTION_STRING=...
JWT_SECRET=...
ENCRYPTION_KEY=...

# ❌ INCORRECTO (ambiguo, unclear)
URL=...
KEY=...
SECRET=...
API=...
```

### Pre-commit Hooks

**Mandatory**: Usar **gitleaks** para prevenir leaks

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

**Test**:

```bash
# Install pre-commit
pip install pre-commit

# Install hooks
pre-commit install

# Test manually
pre-commit run gitleaks --all-files
```

**Result**: Bloquea commits con secrets detectados

```bash
❌ Commit blocked: Secret detected in config.js
  Line 12: const apiKey = "sk-abc123..."
  Type: Generic API Key
```

---

## 2. Authentication & Authorization

### Authentication

#### Use Industry Standards

**Mandatory**:

- ✅ **OAuth 2.0 / OpenID Connect** (no custom auth)
- ✅ **Azure AD B2C** para auth empresarial
- ✅ **Multi-Factor Authentication (MFA)** para admin roles

**Frameworks**:

```typescript
// ✅ CORRECTO: NextAuth.js (Next.js)
import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";

export default NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 3600, // 1 hour
  },
});
```

```python
# ✅ CORRECTO: Azure AD (Python)
from msal import ConfidentialClientApplication

app = ConfidentialClientApplication(
    client_id=os.getenv("AZURE_AD_CLIENT_ID"),
    client_credential=os.getenv("AZURE_AD_CLIENT_SECRET"),
    authority=f"https://login.microsoftonline.com/{os.getenv('AZURE_AD_TENANT_ID')}"
)

result = app.acquire_token_for_client(scopes=["https://graph.microsoft.com/.default"])
access_token = result["access_token"]
```

#### Password Policy (if applicable)

**Requirements**:

- ✅ Mínimo **12 caracteres**
- ✅ Requiere **mayúsculas, minúsculas, números, símbolos**
- ✅ No permitir **passwords comunes** (usar [zxcvbn](https://github.com/dropbox/zxcvbn))
- ✅ **Password hashing**: bcrypt (cost factor 12+), Argon2, scrypt
- ❌ No almacenar passwords en **plain text** o **MD5/SHA1**

**Example**:

```typescript
import bcrypt from "bcrypt";
import zxcvbn from "zxcvbn";

// Validate password strength
function validatePassword(password: string): boolean {
  const result = zxcvbn(password);
  
  if (result.score < 3) {
    throw new Error(`Password too weak: ${result.feedback.warning}`);
  }
  
  if (password.length < 12) {
    throw new Error("Password must be at least 12 characters");
  }
  
  return true;
}

// Hash password
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verify password
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

#### Session Management

**JWT Tokens**:

```typescript
// ✅ CORRECTO: Short-lived access tokens + refresh tokens
const accessToken = jwt.sign(
  { userId: user.id, role: user.role },
  process.env.JWT_SECRET!,
  { expiresIn: "15m" } // Short expiration
);

const refreshToken = jwt.sign(
  { userId: user.id },
  process.env.JWT_REFRESH_SECRET!,
  { expiresIn: "7d" } // Longer expiration
);
```

**Rules**:

- ✅ **Access tokens**: Expiración <1 hora
- ✅ **Refresh tokens**: Expiración 7 días, rotación obligatoria
- ✅ **Logout**: Invalidar tokens (blacklist o token revocation)
- ✅ **Secure cookies**: `httpOnly`, `secure`, `sameSite: 'strict'`

```typescript
// Set secure cookie
res.cookie("accessToken", token, {
  httpOnly: true,    // No accessible via JavaScript
  secure: true,      // HTTPS only
  sameSite: "strict", // CSRF protection
  maxAge: 3600000,   // 1 hour
});
```

### Authorization

#### Role-Based Access Control (RBAC)

**Define roles and permissions**:

```typescript
// roles.ts
export enum Role {
  ADMIN = "admin",
  DEVELOPER = "developer",
  VIEWER = "viewer",
}

export const permissions = {
  [Role.ADMIN]: ["*"], // All permissions
  [Role.DEVELOPER]: [
    "projects:read",
    "projects:write",
    "specs:read",
    "specs:write",
  ],
  [Role.VIEWER]: [
    "projects:read",
    "specs:read",
  ],
};
```

**Middleware for authorization**:

```typescript
// auth.middleware.ts
import { Request, Response, NextFunction } from "express";

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    
    if (!userRole || !permissions[userRole].includes(permission)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    
    next();
  };
}

// Usage
app.delete("/api/projects/:id", 
  requirePermission("projects:delete"),
  deleteProject
);
```

---

## 3. Security Scanning

### CI/CD Integration (Mandatory)

**All projects MUST have**:

1. **SAST** (Static Application Security Testing)
2. **Dependency Scanning**
3. **Secrets Scanning**
4. **Container Scanning** (if using Docker)

### SAST (Static Application Security Testing)

**Tools**:

- **SonarQube** (recommended)
- **Checkmarx**
- **Snyk Code**

**GitHub Actions Example**:

```yaml
# .github/workflows/security.yml
name: Security Scan

on: [pull_request, push]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: SonarQube Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

**Quality Gate**:

- ❌ **Block merge** if: Critical vulnerabilities detected
- ⚠️ **Warning** if: High vulnerabilities (require justification)
- ✅ **Pass** if: Medium/Low only (must be tracked)

### Dependency Scanning

**Tools**:

- **npm audit** (Node.js)
- **Snyk**
- **Dependabot** (GitHub)
- **Renovate**

**Automate**:

```yaml
# .github/workflows/dependency-scan.yml
name: Dependency Scan

on:
  schedule:
    - cron: "0 0 * * 1" # Weekly on Monday
  pull_request:

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: npm audit
        run: npm audit --audit-level=high
      
      - name: Snyk test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
```

**Auto-update dependencies**:

```json
// renovate.json
{
  "extends": ["config:base"],
  "schedule": ["before 6am on Monday"],
  "automerge": true,
  "automergeType": "pr",
  "major": {
    "automerge": false
  }
}
```

### Secrets Scanning

**Pre-commit + CI/CD**:

```yaml
# .github/workflows/secrets-scan.yml
name: Secrets Scan

on: [pull_request, push]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Container Scanning

**Tools**:

- **Trivy** (recommended)
- **Azure Defender for Containers**
- **Snyk Container**

**Example**:

```yaml
# .github/workflows/container-scan.yml
name: Container Scan

on:
  push:
    branches: [main, develop]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build image
        run: docker build -t myapp:${{ github.sha }} .
      
      - name: Trivy scan
        uses: aquasecurity/trivy-action@master
        with:
          image-ref: myapp:${{ github.sha }}
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'
      
      - name: Upload to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'
```

---

## 4. Data Protection

### Encryption

#### At Rest

**Database**:

- ✅ **Azure SQL**: Transparent Data Encryption (TDE)
- ✅ **PostgreSQL**: Enable encryption at rest
- ✅ **MongoDB**: Encryption at rest with LUKS/dm-crypt

**Disk**:

- ✅ **Azure Disk Encryption** for VMs
- ✅ **Encrypted storage accounts**

#### In Transit

**Mandatory**: **TLS 1.3+** (no TLS 1.0/1.1)

```nginx
# nginx.conf
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
ssl_prefer_server_ciphers on;
```

**API Calls**:

```typescript
// ✅ CORRECTO: Enforce HTTPS
const axios = require("axios");

const client = axios.create({
  baseURL: "https://api.example.com", // HTTPS only
  timeout: 5000,
  httpsAgent: new https.Agent({
    rejectUnauthorized: true, // Reject self-signed certs
  }),
});
```

#### PII Fields

**Encrypt sensitive data in database**:

```typescript
// Example: Encrypt email, phone
import crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY!; // 32 bytes
const ALGORITHM = "aes-256-gcm";

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function decrypt(encryptedData: string): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(":");
  
  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  
  return decrypted;
}
```

**Store in DB**:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email_encrypted TEXT NOT NULL, -- Encrypted with AES-256-GCM
  phone_encrypted TEXT,          -- Encrypted
  created_at TIMESTAMP DEFAULT NOW()
);
```

### GDPR Compliance

**Requirements** (if handling EU user data):

#### Data Retention

- ✅ **Max 2 years** of inactivity before deletion
- ✅ Automated cleanup job

```typescript
// cleanup.job.ts
import cron from "node-cron";

// Run daily at 2 AM
cron.schedule("0 2 * * *", async () => {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  
  await db.user.deleteMany({
    lastLoginAt: { lt: twoYearsAgo },
    gdprDeletionRequested: true,
  });
  
  console.log("GDPR cleanup completed");
});
```

#### Right to Deletion

```typescript
// api/users/[id]/gdpr.ts
export async function DELETE(req: Request) {
  const userId = req.params.id;
  
  // Anonymize user data (soft delete)
  await db.user.update({
    where: { id: userId },
    data: {
      email: "deleted@gdpr.example.com",
      name: "Deleted User",
      phone: null,
      gdprDeletedAt: new Date(),
    },
  });
  
  // Delete related data
  await db.userActivity.deleteMany({ where: { userId } });
  
  return Response.json({ success: true });
}
```

#### Right to Data Export

```typescript
// api/users/[id]/data.ts
export async function GET(req: Request) {
  const userId = req.params.id;
  
  const userData = await db.user.findUnique({
    where: { id: userId },
    include: {
      projects: true,
      activities: true,
    },
  });
  
  return Response.json({
    user: userData,
    exportedAt: new Date().toISOString(),
  });
}
```

#### Consent Management

```typescript
// User must opt-in explicitly
await db.user.update({
  where: { id: userId },
  data: {
    consentGiven: true,
    consentGivenAt: new Date(),
    consentVersion: "1.0", // Track consent version
  },
});
```

---

## 5. Security Headers

**Mandatory for web applications**:

```typescript
// middleware.ts (Next.js)
export function middleware(request: Request) {
  const response = NextResponse.next();
  
  // Content Security Policy
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
  );
  
  // Prevent MIME sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");
  
  // XSS Protection
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // HSTS (Force HTTPS)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );
  
  // Referrer Policy
  response.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  
  // Permissions Policy
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  
  return response;
}
```

**Test with**:

- [Security Headers](https://securityheaders.com/)
- [Mozilla Observatory](https://observatory.mozilla.org/)

**Target Score**: A+ on both tools

---

## 6. Input Validation & Sanitization

### Validate All Inputs

**Never trust user input**:

```typescript
// ✅ CORRECTO: Validate with Zod
import { z } from "zod";

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18).max(120),
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/),
});

export async function POST(req: Request) {
  const body = await req.json();
  
  try {
    const validatedData = userSchema.parse(body);
    // Process validatedData
  } catch (error) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
}
```

### SQL Injection Prevention

**Always use parameterized queries**:

```typescript
// ❌ INCORRECTO: String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`; // SQL INJECTION!

// ✅ CORRECTO: Parameterized query
const query = `SELECT * FROM users WHERE email = $1`;
const result = await db.query(query, [userEmail]);
```

```typescript
// ✅ CORRECTO: ORM (Prisma)
const user = await prisma.user.findUnique({
  where: { email: userEmail },
});
```

### XSS Prevention

**Sanitize HTML output**:

```typescript
import DOMPurify from "isomorphic-dompurify";

// ❌ INCORRECTO: Direct HTML injection
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ CORRECTO: Sanitize first
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**Use Content Security Policy** (ver Security Headers)

---

## 7. API Security

### Rate Limiting

**Prevent brute force and DDoS**:

```typescript
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Max 100 requests per window
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);
```

**Stricter limits for sensitive endpoints**:

```typescript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15 min
  skipSuccessfulRequests: true,
});

app.post("/api/auth/login", authLimiter, loginHandler);
```

### CORS Configuration

**Restrict allowed origins**:

```typescript
import cors from "cors";

// ❌ INCORRECTO: Allow all origins
app.use(cors({ origin: "*" }));

// ✅ CORRECTO: Whitelist specific origins
const allowedOrigins = [
  "https://nirvana.dxc.com",
  "https://staging.nirvana.dxc.com",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
```

### API Authentication

**Require authentication for all endpoints** (except public):

```typescript
// middleware/auth.ts
export async function authenticateRequest(req: Request): Promise<User | null> {
  const authHeader = req.headers.get("Authorization");
  
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  
  const token = authHeader.substring(7);
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!);
    return payload as User;
  } catch (error) {
    return null;
  }
}

// Usage
export async function GET(req: Request) {
  const user = await authenticateRequest(req);
  
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Proceed with authenticated request
}
```

---

## 8. Logging & Monitoring

### Secure Logging

**DO log**:

- ✅ Authentication attempts (success/failure)
- ✅ Authorization failures
- ✅ Input validation errors
- ✅ Security events (password change, MFA setup)

**DON'T log**:

- ❌ Passwords, API keys, tokens
- ❌ Credit card numbers, SSNs
- ❌ Full request bodies with PII

**Example**:

```typescript
// ❌ INCORRECTO: Logging sensitive data
logger.info("Login attempt", { email, password }); // DON'T LOG PASSWORD!

// ✅ CORRECTO: Redact sensitive data
logger.info("Login attempt", {
  email,
  ipAddress: req.ip,
  userAgent: req.headers["user-agent"],
});
```

### Security Monitoring

**Alert on**:

- 🚨 Multiple failed login attempts (>5 in 15 min)
- 🚨 Unauthorized access attempts (403 errors spike)
- 🚨 Unusual API usage patterns
- 🚨 Security scan findings (critical vulnerabilities)

**Tools**:

- **Azure Application Insights**
- **Datadog Security Monitoring**
- **Splunk**

---

## 9. Incident Response

### Security Incident Severity

| Severity | Impact | Response Time | Example |
|----------|--------|---------------|---------|
| **P1 - Critical** | Data breach, service compromise | <15 min | Credentials leaked, RCE vulnerability |
| **P2 - High** | Security vulnerability | <2 hours | XSS, SQL injection discovered |
| **P3 - Medium** | Security misconfiguration | <8 hours | Missing security headers |
| **P4 - Low** | Security improvement | <1 week | Outdated dependency (low risk) |

### Post-Incident Process

1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope and impact
3. **Remediate**: Fix vulnerability
4. **Notify**: Inform stakeholders (GDPR: within 72h if data breach)
5. **Document**: Create incident report
6. **Learn**: Post-mortem, update security practices

---

## 10. Compliance Checklist

### Pre-Merge Checklist

- [ ] **Secrets**: No hardcoded secrets, `.env` in `.gitignore`
- [ ] **Scanning**: Pre-commit hooks pass (gitleaks)
- [ ] **Dependencies**: No critical/high vulnerabilities
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: Parameterized queries used
- [ ] **XSS**: Output sanitized, CSP configured
- [ ] **Auth**: Proper authentication/authorization
- [ ] **Encryption**: Sensitive data encrypted at rest/transit

### Pre-Deploy Checklist (Production)

- [ ] **SAST**: SonarQube/Checkmarx scan passed
- [ ] **DAST**: Dynamic security testing completed
- [ ] **Container Scan**: Trivy/Snyk scan passed
- [ ] **Security Headers**: Configured and tested (A+ score)
- [ ] **TLS**: HTTPS enforced, TLS 1.3+ only
- [ ] **Secrets**: All secrets in Azure Key Vault
- [ ] **Rate Limiting**: Configured for all APIs
- [ ] **Logging**: Security events logged (no PII)
- [ ] **Monitoring**: Alerts configured
- [ ] **GDPR**: Data retention, deletion, export implemented (if applicable)

---

## 11. Security Training

### Required Training

**All developers must complete**:

- [ ] **OWASP Top 10** awareness (annually)
- [ ] **Secure coding practices** (onboarding)
- [ ] **Incident response** procedures (onboarding)

**Resources**:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Azure Security Best Practices](https://learn.microsoft.com/en-us/azure/security/)

---

## 12. Success Criteria

### Adoption Metrics

- [ ] **100%** of projects use secrets scanning (pre-commit + CI)
- [ ] **100%** of PRs pass security scans
- [ ] **Zero** secrets leaked to Git
- [ ] **<5** security vulnerabilities (critical/high) per quarter
- [ ] **A+** security headers score (securityheaders.com)

### Incident Metrics

- [ ] **<2** security incidents per year
- [ ] **<4h** mean time to remediation (MTTR)
- [ ] **100%** post-incident reports completed

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Azure Security Best Practices](https://learn.microsoft.com/en-us/azure/security/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [GDPR Compliance](https://gdpr.eu/)
- [CWE Top 25](https://cwe.mitre.org/top25/)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-10-27 | Initial specification |
