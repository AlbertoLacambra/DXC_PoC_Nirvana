---
description: 'Ansible conventions and best practices for infrastructure automation'
applyTo: '**/*.yaml, **/*.yml'
---

# Ansible Conventions and Best Practices

## General Instructions

- Use Ansible to configure and manage infrastructure
- Use version control for your Ansible configurations
- Keep things simple; only use advanced features when necessary
- Give every play, block, and task a concise but descriptive `name`
  - Start names with an action verb (e.g., "Install," "Configure," "Copy")
  - Capitalize the first letter of task names
  - Omit periods from task names for brevity
  - Omit role name from role tasks (Ansible displays it automatically)
  - When including tasks from separate files, include filename in task name: `<TASK_FILENAME> : <TASK_NAME>`
- Use comments to provide context about **what**, **how**, and/or **why**
  - Don't include redundant comments
- Use dynamic inventory for cloud resources
  - Use tags to dynamically create groups (environment, function, location)
  - Use `group_vars` to set variables based on attributes
- Use idempotent Ansible modules whenever possible
  - Avoid `shell`, `command`, and `raw` (they break idempotency)
  - If using `shell`/`command`, use `creates:` or `removes:` parameters
- Use [Fully Qualified Collection Names (FQCN)](https://docs.ansible.com/ansible/latest/reference_appendices/glossary.html#term-Fully-Qualified-Collection-Name-FQCN)
  - Use `ansible.builtin` collection for builtin modules
- Group related tasks together for readability and modularity
- For modules where `state` is optional, explicitly set `state: present` or `state: absent`
- Use lowest privileges necessary
  - Only set `become: true` at play level if all tasks require super user privileges
  - Otherwise specify `become: true` at task level only where needed

## Secret Management

### Ansible Vault (Ansible-only deployments)
- Store secrets using Ansible Vault
- Use this process for organized variable management:
  1. Create `group_vars/` subdirectory named after the group
  2. Inside subdirectory, create two files: `vars` and `vault`
  3. In `vars` file, define all variables (including sensitive ones)
  4. Copy sensitive variables to `vault` file and prefix with `vault_`
  5. In `vars` file, point to `vault_` variables using Jinja2: `db_password: "{{ vault_db_password }}"`
  6. Encrypt `vault` file to protect contents
  7. Use variable name from `vars` file in playbooks

### Third-Party Secret Management (Multi-tool environments)
- When using Ansible with other tools (e.g., Terraform), use third-party secret managers:
  - HashiCorp Vault
  - AWS Secrets Manager
  - Azure Key Vault
- Benefits: Single source of truth, prevents config drift

## Style Guidelines

- Use 2-space indentation and always indent lists
- Separate with single blank lines:
  - Two host blocks
  - Two task blocks
  - Host and include blocks
- Use `snake_case` for variable names
- Sort variables alphabetically when defining in `vars:` maps or files
- Always use multi-line map syntax (improves readability, reduces merge conflicts)
- Prefer single quotes over double quotes
  - Use double quotes when nested within single quotes or for escaped characters
- For long strings, use folded block scalar (`>`) or literal block scalar (`|`)
- Order `host` section:
  - `hosts` declaration
  - Host options alphabetically (`become`, `remote_user`, `vars`)
  - `pre_tasks`
  - `roles`
  - `tasks`
- Order each task:
  - `name`
  - Task declaration (e.g., `service:`, `package:`)
  - Task parameters (multi-line map syntax)
  - Loop operators (e.g., `loop`)
  - Task options alphabetically (`become`, `ignore_errors`, `register`)
  - `tags`
- For `include` statements: quote filenames, use blank lines only for multi-line includes

## Linting and Validation

- Use `ansible-lint` to enforce project standards
- Use `yamllint` to check YAML syntax
- Use `ansible-playbook --syntax-check` for syntax validation
- Use `ansible-playbook --check --diff` for dry-run testing

## Best Practices

- Prefer declarative modules over imperative commands
- Use handlers for service restarts (triggered by `notify`)
- Implement proper error handling with `failed_when` and `ignore_errors`
- Use `tags` for selective playbook execution
- Document complex logic in comments
- Test playbooks in development before production deployment
- Use `check_mode` for validation without changes
- Implement idempotent playbooks (running multiple times produces same result)

---

**Source**: [Ansible Instructions - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/instructions/ansible.instructions.md)
