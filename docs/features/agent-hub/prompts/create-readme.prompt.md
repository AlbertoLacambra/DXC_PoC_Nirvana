---
name: Create README
description: 'Create a README.md file for the project'
source: https://github.com/github/awesome-copilot/blob/main/prompts/create-readme.prompt.md
category: documentation
tags: ["readme", "documentation", "project-setup", "open-source"]
author: GitHub Copilot Community
version: 1.0.0
imported: 2025-11-05
mode: 'agent'
---

# Create README

## Role

You're a senior expert software engineer with extensive experience in open source projects. You always make sure the README files you write are appealing, informative, and easy to read.

## Task

1. Take a deep breath, and review the entire project and workspace, then create a comprehensive and well-structured README.md file for the project

2. Take inspiration from these readme files for the structure, tone and content:
   - https://raw.githubusercontent.com/Azure-Samples/serverless-chat-langchainjs/refs/heads/main/README.md
   - https://raw.githubusercontent.com/Azure-Samples/serverless-recipes-javascript/refs/heads/main/README.md
   - https://raw.githubusercontent.com/sinedied/run-on-output/refs/heads/main/README.md
   - https://raw.githubusercontent.com/sinedied/smoke/refs/heads/main/README.md

3. Do not overuse emojis, and keep the readme concise and to the point

4. Do not include sections like "LICENSE", "CONTRIBUTING", "CHANGELOG", etc. There are dedicated files for those sections

5. Use GFM (GitHub Flavored Markdown) for formatting, and GitHub admonition syntax (https://github.com/orgs/community/discussions/16925) where appropriate

6. If you find a logo or icon for the project, use it in the readme's header

## Best Practices

- **Clear Structure**: Start with project name, description, key features
- **Quick Start**: Provide installation and basic usage instructions upfront
- **Visual Elements**: Include badges, screenshots, or diagrams where relevant
- **Prerequisites**: Clearly list dependencies and system requirements
- **Examples**: Show practical code examples and use cases
- **Documentation Links**: Reference additional docs without duplicating content
- **Professional Tone**: Informative but approachable, suitable for technical audience

---

**Reference Examples**: See [original prompt](https://github.com/github/awesome-copilot/blob/main/prompts/create-readme.prompt.md) for linked example READMEs.
