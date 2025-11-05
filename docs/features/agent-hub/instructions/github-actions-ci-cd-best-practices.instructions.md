---
applyTo: '.github/workflows/*.yml'
description: 'Comprehensive guide for building robust, secure, and efficient CI/CD pipelines using GitHub Actions'
---

# GitHub Actions CI/CD Best Practices

## Core Workflow Structure

### Workflow Basics

- Use descriptive `name` for workflows
- Configure appropriate `on` triggers (push, pull_request, workflow_dispatch, schedule)
- Set `concurrency` to prevent simultaneous runs and race conditions
- Define `permissions` at workflow level for secure defaults

### Jobs and Dependencies

- Use `needs` to define job dependencies
- Employ `outputs` to pass data between jobs
- Use `if` conditions for conditional execution
- Choose appropriate `runs-on` (ubuntu-latest, windows-latest, macos-latest, self-hosted)

### Steps and Actions

- Pin actions to full commit SHA or major version tag (e.g., `@v4`)
- Use descriptive `name` for each step
- Combine commands with `&&` for efficiency
- Never pin to `main` or `latest` tags

## Security Best Practices

### Secret Management

- Store sensitive data in GitHub Secrets
- Use environment-specific secrets with approval gates
- Access secrets via `secrets.<SECRET_NAME>`
- Never print secrets to logs

### OIDC for Cloud Authentication

- Use OIDC for AWS, Azure, GCP authentication
- Eliminate long-lived credentials
- Configure trust policies in cloud provider
- Example: `aws-actions/configure-aws-credentials@v4`

### Least Privilege for GITHUB_TOKEN

- Set `contents: read` as default
- Grant write permissions only when necessary
- Configure permissions at workflow or job level
- Avoid broad `contents: write` unless required

### Dependency Security

- Integrate `dependency-review-action` or Snyk
- Scan for vulnerabilities in dependencies
- Use SAST tools (CodeQL, SonarQube)
- Implement secret scanning and pre-commit hooks

## Performance Optimization

### Caching

- Use `actions/cache@v3` for dependencies
- Design effective cache keys with `hashFiles`
- Use `restore-keys` for fallbacks
- Cache npm, pip, Maven, Gradle dependencies

### Parallelization

- Use `strategy.matrix` for multiple configurations
- Test across OS, language versions, browsers
- Set `fail-fast: false` for comprehensive testing
- Maximize concurrency for faster feedback

### Fast Checkout

- Use `fetch-depth: 1` for most builds
- Only use `fetch-depth: 0` when full history needed
- Avoid checking out submodules unless required
- Optimize LFS usage

### Artifacts

- Use `actions/upload-artifact@v3` and `actions/download-artifact@v3`
- Set appropriate `retention-days`
- Upload test reports, coverage, security scans
- Pass build outputs between jobs

## Comprehensive Testing

### Unit Tests

- Run on every push and pull request
- Use appropriate test runners (Jest, Pytest, JUnit)
- Collect and publish code coverage
- Parallelize for speed

### Integration Tests

- Use `services` for databases, message queues
- Run after unit tests
- Manage test data properly
- Balance mocks vs real services

### E2E Tests

- Use Cypress, Playwright, or Selenium
- Run against staging environment
- Capture screenshots/videos on failure
- Mitigate flakiness with explicit waits

### Performance Testing

- Use JMeter, k6, Locust, Gatling
- Define performance thresholds
- Compare against baselines
- Run less frequently (nightly, weekly)

## Deployment Strategies

### Staging Deployment

- Create dedicated `environment` for staging
- Automate deployment on merge to develop/main
- Mirror production configuration
- Run smoke tests post-deployment

### Production Deployment

- Require manual approvals
- Implement rollback capabilities
- Monitor during and after deployment
- Use environment protection rules

### Deployment Types

- **Rolling Update**: Gradual instance replacement
- **Blue/Green**: Switch traffic between environments
- **Canary**: Gradual rollout to subset of users
- **Dark Launch**: Deploy with feature flags

## Workflow Review Checklist

- [ ] Clear workflow name and appropriate triggers
- [ ] Concurrency configured for critical workflows
- [ ] Permissions set to least privilege
- [ ] Actions pinned to secure versions
- [ ] All secrets accessed via GitHub Secrets
- [ ] OIDC used for cloud authentication
- [ ] Caching configured for dependencies
- [ ] Matrix strategies for parallelization
- [ ] Comprehensive testing (unit, integration, E2E)
- [ ] Environment protection for production
- [ ] Manual approvals for critical deployments
- [ ] Rollback strategy documented and tested
- [ ] Monitoring and alerts configured

<!-- Source: https://github.com/github/awesome-copilot (MIT License) -->
