---
name: Create Specification
description: 'Create a new specification file for the solution, optimized for Generative AI consumption.'
source: https://github.com/github/awesome-copilot/blob/main/prompts/create-specification.prompt.md
category: documentation
tags: ["specification", "documentation", "requirements", "ai-ready"]
author: GitHub Copilot Community
version: 1.0.0
imported: 2025-11-05
mode: 'agent'
tools: ['changes', 'search/codebase', 'edit/editFiles', 'extensions', 'fetch', 'githubRepo', 'openSimpleBrowser', 'problems', 'runTasks', 'search', 'search/searchResults', 'runCommands/terminalLastCommand', 'runCommands/terminalSelection', 'testFailure', 'usages', 'vscodeAPI']
---

# Create Specification

Your goal is to create a new specification file for `${input:SpecPurpose}`.

The specification file must define the requirements, constraints, and interfaces for the solution components in a manner that is clear, unambiguous, and structured for effective use by Generative AIs. Follow established documentation standards and ensure the content is machine-readable and self-contained.

## Best Practices for AI-Ready Specifications

- Use precise, explicit, and unambiguous language
- Clearly distinguish between requirements, constraints, and recommendations
- Use structured formatting (headings, lists, tables) for easy parsing
- Avoid idioms, metaphors, or context-dependent references
- Define all acronyms and domain-specific terms
- Include examples and edge cases where applicable
- Ensure the document is self-contained and does not rely on external context

## File Naming Convention

Save the specification in the `/spec/` directory:
- Format: `spec-[a-z0-9-]+.md`
- Name should be descriptive and start with the high-level purpose
- Purpose categories: schema, tool, data, infrastructure, process, architecture, design

## Required Structure

### Front Matter

```yaml
---
title: [Concise Title Describing the Specification's Focus]
version: [Optional: e.g., 1.0, Date]
date_created: [YYYY-MM-DD]
last_updated: [Optional: YYYY-MM-DD]
owner: [Optional: Team/Individual responsible for this spec]
tags: [Optional: List of relevant tags or categories]
---
```

### Document Sections

1. **Introduction** - Short concise introduction to the specification and the goal
2. **Purpose & Scope** - Clear description of purpose, scope, intended audience, assumptions
3. **Definitions** - All acronyms, abbreviations, domain-specific terms
4. **Requirements, Constraints & Guidelines** - Explicitly list all with coded references
   - REQ-001, SEC-001, CON-001, GUD-001, PAT-001 format
5. **Interfaces & Data Contracts** - APIs, data contracts, integration points with schemas/examples
6. **Acceptance Criteria** - Clear, testable criteria (Given-When-Then format where appropriate)
7. **Test Automation Strategy** - Testing approach, frameworks, automation requirements
8. **Rationale & Context** - Reasoning behind requirements and design decisions
9. **Dependencies & External Integrations** - External systems, services, architectural dependencies
   - Focus on WHAT is needed, not HOW it's implemented
   - EXT-001, SVC-001, INF-001, DAT-001, PLT-001, COM-001 format
10. **Examples & Edge Cases** - Code snippets or data examples demonstrating correct application
11. **Validation Criteria** - Criteria/tests for compliance
12. **Related Specifications / Further Reading** - Links to related specs and external docs

---

**Full Template and Guidelines**: See [original prompt](https://github.com/github/awesome-copilot/blob/main/prompts/create-specification.prompt.md) for complete template and detailed examples.
