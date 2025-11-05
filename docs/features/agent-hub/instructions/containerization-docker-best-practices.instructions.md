---
description: 'Comprehensive best practices for creating optimized, secure, and efficient Docker images and managing containers. Covers multi-stage builds, image layer optimization, security scanning, and runtime best practices.'
applyTo: '**/Dockerfile, **/Dockerfile.*, **/*.dockerfile, **/docker-compose*.yml, **/docker-compose*.yaml'
---

# Containerization & Docker Best Practices

## Core Principles

### 1. Immutability
- Once built, container images should not change
- Any changes result in new image
- **Benefits**: Reproducible builds, version control for images, easy rollbacks, enhanced security
- **Practice**: Create new images for every code/config change; never modify running containers

### 2. Portability
- Containers run consistently across environments (local, cloud, on-premise)
- **Practice**: Design environment-agnostic applications, externalize configurations, use environment variables

### 3. Isolation
- Containers provide process, resource, network, and filesystem isolation
- **Practice**: Run single process per container, use container networking, implement resource limits, use named volumes

### 4. Efficiency & Small Images
- Smaller images = faster builds, transfers, deployments + lower costs + reduced attack surface
- **Practice**: Minimal base images, multi-stage builds, regular optimization

## Dockerfile Best Practices

### 1. Multi-Stage Builds
- **Principle**: Use multiple `FROM` instructions to separate build-time from runtime dependencies
- **Benefits**: Significantly smaller images, reduced attack surface
- **Example**:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
USER node
CMD ["node", "dist/main.js"]
```

### 2. Choose Right Base Image
- Prefer official images from Docker Hub
- Use minimal variants: `alpine`, `slim`, `distroless`
- Use specific version tags (avoid `latest` in production)
- Regularly update base images for security patches

### 3. Optimize Image Layers
- Each instruction creates new layer
- Order instructions from least to most frequently changing
- Combine related `RUN` commands
- Clean up temporary files in same `RUN` command
- **Example**:
```dockerfile
# Good: Optimized layers
FROM ubuntu:20.04
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install flask && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*
```

### 4. Use `.dockerignore` Effectively
- Exclude unnecessary files from build context
- Common exclusions: `.git`, `node_modules`, build artifacts, documentation, test files
- **Example**:
```dockerignore
.git*
node_modules
dist
build
*.md
.env.*
```

### 5. Minimize `COPY` Instructions
- Copy specific paths instead of entire directories
- Copy dependency files before source code (better caching)
- Use `.dockerignore` to exclude unnecessary files

### 6. Define Default User and Port
- Run containers with non-root user for security
- Create dedicated user in Dockerfile
- Use `EXPOSE` to document ports
- **Example**:
```dockerfile
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
RUN chown -R appuser:appgroup /app
USER appuser
EXPOSE 8080
CMD ["node", "dist/main.js"]
```

### 7. Use `CMD` and `ENTRYPOINT` Correctly
- `ENTRYPOINT`: Defines executable that always runs
- `CMD`: Provides default arguments
- Use exec form for better signal handling: `["command", "arg1"]`

### 8. Environment Variables for Configuration
- Externalize configuration using environment variables
- Provide default values with `ENV`
- Never hardcode secrets in Dockerfile
- Validate required env vars at startup

## Container Security

### 1. Non-Root User
- Running as root is significant security risk
- Always create and use dedicated non-root user
- Ensure proper file permissions

### 2. Minimal Base Images
- Fewer packages = fewer vulnerabilities
- Use `alpine`, `slim`, or `distroless` variants
- Review base image vulnerabilities regularly

### 3. Static Analysis Security Testing (SAST)
- Scan Dockerfiles for security misconfigurations
- Tools: `hadolint` (Dockerfile linting), `Trivy`, `Clair`, `Snyk Container`
- Integrate scanning into CI/CD pipeline
- **Example**:
```yaml
- name: Run Hadolint
  run: docker run --rm -i hadolint/hadolint < Dockerfile

- name: Scan image for vulnerabilities
  run: |
    docker build -t myapp .
    trivy image myapp
```

### 4. Image Signing & Verification
- Ensure images haven't been tampered with
- Use Notary, Docker Content Trust, or Cosign
- Implement in CI/CD pipeline for production images

### 5. Limit Capabilities & Read-Only Filesystems
- Drop unnecessary Linux capabilities
- Mount root filesystem as read-only where possible
- Use seccomp profiles and AppArmor/SELinux

### 6. No Sensitive Data in Image Layers
- Files added to images stored in image history
- Never include secrets, private keys, credentials
- Use secrets management solutions (Kubernetes Secrets, Docker Secrets, Vault)
- Use runtime secrets injection

### 7. Health Checks
- Implement liveness and readiness probes
- **Example**:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl --fail http://localhost:8080/health || exit 1
```

## Container Runtime & Orchestration

### 1. Resource Limits
- Set CPU and memory limits to prevent resource exhaustion
- **Example** (Docker Compose):
```yaml
services:
  app:
    image: myapp:latest
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

### 2. Logging & Monitoring
- Use `STDOUT`/`STDERR` for container logs
- Implement structured logging (JSON)
- Integrate with log aggregators (Fluentd, Logstash, Loki)
- Collect metrics with Prometheus

### 3. Persistent Storage
- Use Docker Volumes or Persistent Volumes for stateful apps
- Never store persistent data in container's writable layer
- Implement backup and disaster recovery

### 4. Networking
- Create custom networks for service isolation
- Use network policies to control traffic
- Implement proper network segmentation

### 5. Orchestration (Kubernetes, Docker Swarm)
- Use orchestrators for managing applications at scale
- Leverage scaling, self-healing, service discovery
- Implement rolling update strategies

## Dockerfile Review Checklist

- [ ] Multi-stage build used if applicable
- [ ] Minimal, specific base image (`alpine`, `slim`, versioned)
- [ ] Layers optimized (combined `RUN` commands, cleanup in same layer)
- [ ] `.dockerignore` file present and comprehensive
- [ ] `COPY` instructions specific and minimal
- [ ] Non-root `USER` defined
- [ ] `EXPOSE` instruction used for documentation
- [ ] `CMD`/`ENTRYPOINT` used correctly (exec form)
- [ ] Environment variables for configuration (not hardcoded)
- [ ] `HEALTHCHECK` instruction defined
- [ ] No secrets in image layers
- [ ] Security scanning integrated in CI (Hadolint, Trivy)

## Troubleshooting

### Large Image Size
- Review layers: `docker history <image>`
- Implement multi-stage builds
- Use smaller base image

### Slow Builds
- Leverage build cache (order instructions properly)
- Use `.dockerignore`
- Use `--no-cache` for troubleshooting

### Container Not Starting/Crashing
- Check `CMD`/`ENTRYPOINT`
- Review logs: `docker logs <container>`
- Verify dependencies in final image

### Permissions Issues
- Verify file/directory permissions
- Ensure `USER` has necessary permissions
- Check mounted volumes permissions

---

**Source**: [Containerization Best Practices - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/instructions/containerization-docker-best-practices.instructions.md)
