---
description: 'Analyze Azure resources used in the app (IaC files and/or resources in a target rg) and optimize costs - creating GitHub issues for identified optimizations.'
mode: 'agent'
---

# Azure Cost Optimize

This workflow analyzes Infrastructure-as-Code (IaC) files and Azure resources to generate cost optimization recommendations. It creates individual GitHub issues for each optimization opportunity plus one EPIC issue to coordinate implementation, enabling efficient tracking and execution of cost savings initiatives.

## Prerequisites

- Azure MCP server configured and authenticated
- GitHub MCP server configured and authenticated  
- Target GitHub repository identified
- Azure resources deployed (IaC files optional but helpful)
- Prefer Azure MCP tools (`azmcp-*`) over direct Azure CLI when available

## Workflow Overview

### Step 1: Get Azure Best Practices
- Execute `azmcp-bestpractices-get` to retrieve cost optimization guidelines
- Use these practices to inform analysis and recommendations
- Reference best practices in optimization recommendations

### Step 2: Discover Azure Infrastructure
- Dynamically discover and analyze Azure resources and configurations
- Use Azure MCP tools + Azure CLI fallback + Local file system access
- Resource Discovery: subscriptions → resource groups → resources
- IaC Detection: Scan for `**/*.bicep`, `**/*.tf`, `**/main.json`, `**/*template*.json`
- Configuration Analysis: Extract SKUs, tiers, settings, relationships

### Step 3: Collect Usage Metrics & Validate Costs
- Gather utilization data from Log Analytics workspaces
- Execute usage queries (CPU, memory, database throughput, storage access)
- **VALIDATE CURRENT COSTS**: Look up Azure pricing, document Resource → SKU → Cost
- Calculate realistic current monthly total before recommendations

### Step 4: Generate Optimization Recommendations
- Apply optimization patterns by resource type (Compute, Database, Storage, Infrastructure)
- Calculate evidence-based savings (Current → Target = Savings)
- Calculate Priority Score: `(Value × Monthly Savings) / (Risk × Implementation Days)`
- Validate recommendations with accurate Azure CLI commands

### Step 5: User Confirmation
- Display optimization summary with total resources, costs, savings, priorities
- Wait for user confirmation before creating issues

### Step 6: Create Individual Optimization Issues
- Label: "cost-optimization" (green), "azure" (blue)
- Title: `[COST-OPT] [Resource Type] - [Description] - $X/month savings`
- Include: Implementation commands (IaC or CLI), evidence, validation steps, risks

### Step 7: Create EPIC Coordinating Issue
- Label: "cost-optimization" (green), "azure" (blue), "epic" (purple)
- Title: `[EPIC] Azure Cost Optimization Initiative - $X/month potential savings`
- Include: Executive summary, architecture diagram, implementation tracking by priority

## Key Features

- **Evidence-Based**: All recommendations backed by actual usage metrics
- **Cost Validated**: Pricing verified against Azure documentation
- **Priority Scoring**: ROI-focused implementation order
- **IaC-Aware**: Detects and prioritizes infrastructure-as-code changes
- **Trackable**: Individual issues per optimization for clear ownership
- **Coordinated**: EPIC issue provides oversight and progress tracking

## Example Optimizations

**Compute**: App Service Plan right-sizing, Function Apps Premium→Consumption
**Database**: Cosmos DB Provisioned→Serverless, SQL tier optimization
**Storage**: Lifecycle policies (Hot→Cool→Archive), account consolidation
**Infrastructure**: Remove unused resources, implement auto-scaling

---

**Full Workflow Details**: See [original prompt](https://raw.githubusercontent.com/github/awesome-copilot/main/prompts/az-cost-optimize.prompt.md) for complete implementation with queries, error handling, and success criteria.

**Source**: [Azure Cost Optimize - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/az-cost-optimize.prompt.md)
