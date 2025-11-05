---
description: 'Comprehensive best practices for deploying and managing applications on Kubernetes. Covers Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, health checks, resource limits, scaling, and security contexts.'
applyTo: '*'
---

# Kubernetes Deployment Best Practices

## Core Kubernetes Concepts

### 1. Pods
- **Principle**: Smallest deployable unit in Kubernetes
- **Best Practices**:
  - Design Pods to run single primary container (or tightly coupled sidecars)
  - Define `resources` (requests/limits) for CPU and memory
  - Implement `livenessProbe` and `readinessProbe`
  - **Avoid** deploying Pods directly; use Deployments or StatefulSets

### 2. Deployments
- **Principle**: Manages set of identical Pods, handles rolling updates/rollbacks
- **Use for**: Stateless applications
- **Configuration**:
  - Define desired `replicas`
  - Specify `selector` and `template` for Pod matching
  - Configure `strategy` for rolling updates (`maxSurge`/`maxUnavailable`)
- **Example**:
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-repo/my-app:1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "100m"
              memory: "128Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          livenessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 15
            periodSeconds: 20
          readinessProbe:
            httpGet:
              path: /readyz
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 10
```

### 3. Services
- **Principle**: Exposes application running on Pods as network service
- **Types**:
  - `ClusterIP`: Internal cluster communication (default)
  - `NodePort`: Exposes service on each Node's IP at static port
  - `LoadBalancer`: Cloud load balancer for internet-facing apps
  - `ExternalName`: Maps service to external DNS name
- **Practice**: Ensure `selector` matches Pod labels

### 4. Ingress
- **Principle**: Manages external HTTP/HTTPS access to services
- **Benefits**: Consolidates routing rules, TLS termination
- **Example**:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-app-ingress
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: my-app-service
                port:
                  number: 80
  tls:
    - hosts:
        - myapp.example.com
      secretName: my-app-tls-secret
```

## Configuration and Secrets Management

### 1. ConfigMaps
- **Purpose**: Store non-sensitive configuration data
- **Usage**: Mount as files or inject as environment variables
- **Warning**: NOT encrypted at rest; do NOT store sensitive data

### 2. Secrets
- **Purpose**: Store sensitive data (API keys, passwords, certificates)
- **Best Practices**:
  - Store encrypted at rest in etcd
  - Mount as volumes or inject as environment variables
  - **Production**: Integrate with external secret managers (HashiCorp Vault, AWS Secrets Manager, Azure Key Vault)
  - Use External Secrets Operator for external integration

## Health Checks and Probes

### 1. Liveness Probe
- **Purpose**: Determines if container is running
- **Action**: Kubernetes restarts container if probe fails
- **Types**: HTTP, TCP, or command-based

### 2. Readiness Probe
- **Purpose**: Determines if container is ready to serve traffic
- **Action**: Removes Pod from Service load balancers if probe fails
- **Use Case**: Graceful removal during startup or temporary outages

## Resource Management

### 1. Resource Requests and Limits
- **Requests**: Guaranteed minimum resources (for scheduling)
- **Limits**: Hard maximum resources (prevents resource exhaustion)
- **QoS Classes**: `Guaranteed`, `Burstable`, `BestEffort`
- **Best Practice**: Set both requests and limits for all containers

### 2. Horizontal Pod Autoscaler (HPA)
- **Purpose**: Automatically scales Pod replicas based on CPU utilization or custom metrics
- **Use for**: Stateless applications with fluctuating load
- **Configuration**: `minReplicas`, `maxReplicas`, `targetCPUUtilizationPercentage`

### 3. Vertical Pod Autoscaler (VPA)
- **Purpose**: Automatically adjusts CPU/memory requests/limits based on usage history
- **Use for**: Optimizing resource usage for individual Pods

## Security Best Practices

### 1. Network Policies
- **Principle**: Control communication between Pods and network endpoints
- **Best Practice**: Deny by default, allow by exception

### 2. Role-Based Access Control (RBAC)
- **Principle**: Control who can do what in cluster
- **Practice**: Define granular `Roles`/`ClusterRoles`, bind to `ServiceAccounts`
- **Principle**: Least privilege

### 3. Pod Security Context
- **Security Settings**:
  - `runAsNonRoot: true`: Prevent running as root
  - `allowPrivilegeEscalation: false`
  - `readOnlyRootFilesystem: true`
  - `capabilities.drop: [ALL]`: Drop unnecessary capabilities
- **Example**:
```yaml
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 2000
  containers:
    - name: my-app
      securityContext:
        allowPrivilegeEscalation: false
        readOnlyRootFilesystem: true
        capabilities:
          drop:
            - ALL
```

### 4. Image Security
- Use trusted, minimal base images (distroless, alpine)
- Integrate image scanning (Trivy, Clair, Snyk) into CI pipeline
- Implement image signing and verification

### 5. API Server Security
- Use strong authentication (client certificates, OIDC)
- Enforce RBAC
- Enable API auditing

## Logging, Monitoring, and Observability

### 1. Centralized Logging
- Use `STDOUT`/`STDERR` for application logs
- Deploy logging agent (Fluentd, Logstash, Loki)
- Send logs to central system (ELK Stack, Splunk, Datadog)

### 2. Metrics Collection
- Use Prometheus with `kube-state-metrics` and `node-exporter`
- Define custom metrics with application-specific exporters
- Use Grafana for visualization

### 3. Alerting
- Configure Prometheus Alertmanager for rule-based alerting
- Alert on: high error rates, low resource availability, Pod restarts, unhealthy probes

### 4. Distributed Tracing
- Implement OpenTelemetry, Jaeger, or Zipkin
- Trace requests across microservices

## Deployment Strategies

### 1. Rolling Updates (Default)
- Gradually replace Pods with new versions
- Configure `maxSurge` and `maxUnavailable`
- **Benefit**: Minimal downtime

### 2. Blue/Green Deployment
- Run two identical environments; switch traffic completely
- **Use for**: Zero-downtime releases

### 3. Canary Deployment
- Gradually roll out to small subset of users first
- Implement with Service Mesh (Istio, Linkerd) or Ingress controllers

### 4. Rollback Strategy
- Use `kubectl rollout undo` for Deployments
- Ensure previous image versions are available

## Kubernetes Manifest Review Checklist

- [ ] `apiVersion` and `kind` correct for resource
- [ ] `metadata.name` descriptive and follows naming conventions
- [ ] `labels` and `selectors` consistently used
- [ ] `replicas` set appropriately
- [ ] `resources` (requests/limits) defined for all containers
- [ ] `livenessProbe` and `readinessProbe` configured
- [ ] Sensitive configs in Secrets (not ConfigMaps)
- [ ] `readOnlyRootFilesystem: true` where possible
- [ ] `runAsNonRoot: true` and non-root `runAsUser` defined
- [ ] Unnecessary `capabilities` dropped
- [ ] Network Policies considered for communication restrictions
- [ ] RBAC configured with least privilege
- [ ] Image tags specific (avoid `:latest`)
- [ ] Logging sent to `STDOUT`/`STDERR`
- [ ] Deployment `strategy` configured for rolling updates
- [ ] Events and Pod statuses monitored

## Troubleshooting

### 1. Pods Not Starting (Pending, CrashLoopBackOff)
- Check `kubectl describe pod <pod_name>` for events/errors
- Review logs: `kubectl logs <pod_name> -c <container_name>`
- Verify resource requests/limits
- Check image pull errors

### 2. Pods Not Ready (Service Unavailable)
- Check `readinessProbe` configuration
- Verify application listens on expected port
- Check Service endpoints: `kubectl describe service <service_name>`

### 3. Service Not Accessible
- Verify Service `selector` matches Pod labels
- Check Service `type` (ClusterIP vs LoadBalancer)
- Review Ingress controller logs and rules
- Check Network Policies

### 4. Resource Exhaustion (OOMKilled)
- Increase `memory.limits`
- Optimize application memory usage
- Use Vertical Pod Autoscaler

### 5. Performance Issues
- Monitor with `kubectl top pod` or Prometheus
- Check application logs for slow operations
- Analyze distributed traces
- Review database performance

---

**Source**: [Kubernetes Best Practices - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/instructions/kubernetes-deployment-best-practices.instructions.md)
