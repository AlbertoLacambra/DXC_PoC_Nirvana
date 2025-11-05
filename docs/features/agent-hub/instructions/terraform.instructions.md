---
description: 'Terraform conventions and guidelines for infrastructure as code'
applyTo: '**/*.tf'
---

# Terraform Conventions and Best Practices

## General Instructions

- Use Terraform to provision and manage infrastructure
- Use version control for your Terraform configurations
- Always use the latest stable version of Terraform and providers
- Regularly update configurations to incorporate security patches

## Security

- Store sensitive information in secure manner (AWS Secrets Manager, SSM Parameter Store)
- Regularly rotate credentials and secrets (automate where possible)
- Use AWS environment variables to reference secrets (keeps values out of state files)
- **Never commit** sensitive information to version control:
  - AWS credentials
  - API keys
  - Passwords
  - Certificates
  - Terraform state files
- Use `.gitignore` to exclude sensitive files
- Always mark sensitive variables: `sensitive = true`
  - Prevents values from appearing in plan/apply output
- Use IAM roles and policies for access control
  - Follow principle of least privilege
- Use security groups and network ACLs for network access control
- Deploy resources in private subnets whenever possible
  - Public subnets only for internet-facing resources (load balancers, NAT gateways)
- Use encryption for sensitive data at rest and in transit
  - Enable encryption: EBS volumes, S3 buckets, RDS instances
  - Use TLS for inter-service communication
- Regularly audit configurations for security vulnerabilities
  - Use tools: `trivy`, `tfsec`, `checkov`

## Modularity

- Use separate projects for each major component:
  - Reduces complexity
  - Easier to manage and maintain
  - Speeds up `plan` and `apply` operations
  - Allows independent development/deployment
  - Reduces risk of accidental changes
- Use modules to avoid duplication
  - Encapsulate related resources
  - Simplify complex configurations
  - Avoid circular dependencies
  - Avoid unnecessary abstraction layers
    - Don't use modules for single resources
    - Avoid excessive nesting (keep hierarchy shallow)
- Use `output` blocks to expose important infrastructure information
  - Provide info useful for other modules or users
  - Mark outputs as `sensitive = true` for sensitive data

## Maintainability

- Prioritize readability, clarity, and maintainability
- Use comments to explain complex configurations and design decisions
- Write concise, efficient, idiomatic configs
- Avoid hard-coded values; use variables instead
  - Set default values where appropriate
- Use data sources to retrieve existing resource information
  - Reduces errors, ensures up-to-date configs
  - Allows adaptation to different environments
  - Don't use data sources for resources created in same configuration
  - Remove unnecessary data sources (slow down operations)
- Use `locals` for values used multiple times (ensures consistency)

## Style and Formatting

- Follow Terraform best practices for resource naming and organization
- Use descriptive names for resources, variables, and outputs
- Use consistent naming conventions across all configurations
- Follow **Terraform Style Guide**:
  - 2 spaces for each indentation level
- Group related resources in same file
  - Consistent naming: `providers.tf`, `variables.tf`, `network.tf`, `ecs.tf`, `mariadb.tf`
- Place `depends_on` blocks at beginning of resource definitions
  - Use only when necessary to avoid circular dependencies
- Place `for_each` and `count` blocks at beginning of resource definitions
  - Use `for_each` for collections, `count` for numeric iterations
  - Place after `depends_on` blocks if present
- Place `lifecycle` blocks at end of resource definitions
- Alphabetize providers, variables, data sources, resources, and outputs within files
- Group related attributes together within blocks
  - Required attributes before optional ones
  - Comment each section
  - Separate sections with blank lines
  - Alphabetize attributes within sections
- Use blank lines to separate logical sections
- Use `terraform fmt` to format automatically
- Use `terraform validate` to check syntax and validity
- Use `tflint` to check style violations and best practices
  - Run regularly to catch issues early

## Documentation

- Always include `description` and `type` for variables and outputs
  - Use clear, concise descriptions
  - Use appropriate types: `string`, `number`, `bool`, `list`, `map`
- Document configurations using comments
  - Explain purpose of resources and variables
  - Explain complex configurations or decisions
  - Avoid redundant comments
- Include `README.md` in each project:
  - Project overview and structure
  - Setup and usage instructions
- Use `terraform-docs` to generate documentation automatically

## Testing

- Write tests to validate Terraform functionality
- Use `.tftest.hcl` extension for test files
- Cover positive and negative scenarios
- Ensure tests are idempotent (can run multiple times without side effects)

## Best Practices

- Use version constraints for providers
- Implement remote state management (S3, Terraform Cloud)
- Enable state locking to prevent concurrent modifications
- Use workspaces for environment management
- Implement proper dependency management with `depends_on`
- Use provisioners sparingly (prefer native resources)
- Implement proper tagging strategy for resource organization
- Use data sources for cross-project references
- Implement proper destroy workflows with protection flags

---

**Source**: [Terraform Instructions - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/instructions/terraform.instructions.md)
