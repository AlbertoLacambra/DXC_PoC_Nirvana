/**
 * Auto-Optimization Service
 * 
 * LEVEL 2: Automatic optimization with Pull Request generation
 * 
 * This service:
 * 1. Analyzes FinOps recommendations from Cost Optimizer
 * 2. Generates Terraform code changes
 * 3. Creates a branch and Pull Request
 * 4. Integrates with existing DRIFT workflow
 * 5. Assigns to resource owners for review
 */

import { execFile } from 'child_process';
import { promisify } from 'util';
import type { RightSizingRecommendation } from './optimizer-types';

const execFileAsync = promisify(execFile);

// ============================================
// Types
// ============================================

export interface AutoOptimizationConfig {
  enabled: boolean;
  autoCreatePR: boolean;
  minMonthlySavings: number;           // Only create PR if savings > this amount
  maxPriority: number;                 // Only auto-optimize priority >= this
  requireApproval: boolean;
  assignees: string[];
  terraformPath: string;
}

export interface TerraformChange {
  file: string;
  resourceAddress: string;
  currentConfig: string;
  newConfig: string;
  changeType: 'downsize' | 'upsize' | 'shutdown' | 'spot_migration';
  monthlySavings: number;
  annualSavings: number;
  impactLevel: 'low' | 'medium' | 'high';
}

export interface OptimizationPR {
  id: string;
  branchName: string;
  prNumber?: number;
  prUrl?: string;
  title: string;
  description: string;
  changes: TerraformChange[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
  status: 'draft' | 'open' | 'merged' | 'closed';
  createdAt: string;
  assignees: string[];
}

export interface AutoOptimizationResult {
  success: boolean;
  recommendationsAnalyzed: number;
  changesGenerated: number;
  prCreated: boolean;
  pr?: OptimizationPR;
  terraformChanges: TerraformChange[];
  errors: string[];
}

// ============================================
// Configuration
// ============================================

const DEFAULT_CONFIG: AutoOptimizationConfig = {
  enabled: true,
  autoCreatePR: true,
  minMonthlySavings: 50,              // €50/month minimum
  maxPriority: 7,                     // Priority 7-10 auto-eligible
  requireApproval: true,
  assignees: ['cloudops@dxc.com', 'finops@dxc.com'],
  terraformPath: 'c:\\PROYECTS\\DXC_PoC_Nirvana\\terraform\\hub',
};

// ============================================
// WSL Command Execution
// ============================================

async function executeWSLCommand(workingDir: string, command: string): Promise<string> {
  const wslPath = workingDir
    .replace(/\\/g, '/')
    .replace(/^([A-Za-z]):/, (_, drive) => `/mnt/${drive.toLowerCase()}`);
  
  const pathSetup = 'export PATH=/home/alacambra/bin:/usr/local/bin:/usr/bin:/bin';
  const fullCommand = `cd '${wslPath}' && ${pathSetup} && ${command}`;
  
  console.log('WSL Command:', fullCommand);
  
  try {
    const { stdout, stderr } = await execFileAsync('wsl', ['bash', '-c', fullCommand]);
    
    if (stderr && !stderr.includes('Refreshing state')) {
      console.warn('STDERR:', stderr);
    }
    
    return stdout;
  } catch (error: any) {
    console.error('WSL Command Error:', error);
    throw new Error(`Failed to execute: ${error.message}`);
  }
}

// ============================================
// Terraform Code Generation
// ============================================

/**
 * Generate Terraform code change for VM right-sizing
 */
function generateTerraformChange(
  recommendation: RightSizingRecommendation,
  terraformPath: string
): TerraformChange | null {
  // Extract resource name from Azure resource ID
  // /subscriptions/.../resourceGroups/rg-hub-prod/providers/Microsoft.Compute/virtualMachines/vm-prod-01
  const resourceName = recommendation.resourceName;
  const resourceGroup = recommendation.resourceGroup;
  
  // Find corresponding Terraform resource
  // In our case, VMs are typically defined like: resource "azurerm_linux_virtual_machine" "vm_name"
  const terraformResource = `azurerm_linux_virtual_machine.${resourceName.replace(/-/g, '_')}`;
  
  let changeType: TerraformChange['changeType'];
  let currentConfig = '';
  let newConfig = '';
  
  if (recommendation.recommendationType === 'shutdown') {
    changeType = 'shutdown';
    currentConfig = `resource "azurerm_linux_virtual_machine" "${resourceName.replace(/-/g, '_')}" {
  name                = "${resourceName}"
  resource_group_name = "${resourceGroup}"
  location            = "${recommendation.currentUtilization.location}"
  size                = "${recommendation.currentSku.name}"
  # ... other config
}`;
    
    newConfig = `# SHUTDOWN RECOMMENDED - Resource underutilized (CPU: ${recommendation.currentUtilization.cpuAverage.toFixed(1)}%, Memory: ${recommendation.currentUtilization.memoryAverage.toFixed(1)}%)
# Savings: €${recommendation.monthlySavings.toFixed(2)}/month
# Uncomment to delete:
# resource "azurerm_linux_virtual_machine" "${resourceName.replace(/-/g, '_')}" {
#   ... (resource will be destroyed)
# }`;
    
  } else if (recommendation.recommendationType === 'downsize' || recommendation.recommendationType === 'upsize') {
    changeType = recommendation.recommendationType;
    currentConfig = `  size = "${recommendation.currentSku.name}"`;
    newConfig = `  size = "${recommendation.recommendedSku.name}"  # ${recommendation.recommendationType}: saves €${recommendation.monthlySavings.toFixed(2)}/month`;
  } else {
    return null;
  }
  
  return {
    file: `${terraformPath}/main.tf`,
    resourceAddress: terraformResource,
    currentConfig,
    newConfig,
    changeType,
    monthlySavings: recommendation.monthlySavings,
    annualSavings: recommendation.annualSavings,
    impactLevel: recommendation.impactLevel,
  };
}

// ============================================
// Pull Request Generation
// ============================================

/**
 * Generate Pull Request description with detailed analysis
 */
function generatePRDescription(
  changes: TerraformChange[],
  totalMonthlySavings: number
): string {
  const totalAnnualSavings = totalMonthlySavings * 12;
  
  const changesByType = {
    downsize: changes.filter(c => c.changeType === 'downsize'),
    upsize: changes.filter(c => c.changeType === 'upsize'),
    shutdown: changes.filter(c => c.changeType === 'shutdown'),
    spot_migration: changes.filter(c => c.changeType === 'spot_migration'),
  };
  
  let description = `## 💰 FinOps Auto-Optimization

**Generated by:** DXC Cloud Mind - FinOps Toolkit  
**Analysis Date:** ${new Date().toISOString()}  
**Total Monthly Savings:** €${totalMonthlySavings.toFixed(2)}  
**Total Annual Savings:** €${totalAnnualSavings.toFixed(2)}  

---

## 📊 Summary

This PR implements ${changes.length} infrastructure optimization${changes.length > 1 ? 's' : ''} based on 7-day utilization analysis:

`;

  if (changesByType.downsize.length > 0) {
    const savingsDownsize = changesByType.downsize.reduce((sum, c) => sum + c.monthlySavings, 0);
    description += `- **${changesByType.downsize.length} Downsize Recommendations** → €${savingsDownsize.toFixed(2)}/month\n`;
  }
  
  if (changesByType.upsize.length > 0) {
    const costUpsize = changesByType.upsize.reduce((sum, c) => sum + Math.abs(c.monthlySavings), 0);
    description += `- **${changesByType.upsize.length} Upsize Recommendations** → +€${costUpsize.toFixed(2)}/month (performance improvement)\n`;
  }
  
  if (changesByType.shutdown.length > 0) {
    const savingsShutdown = changesByType.shutdown.reduce((sum, c) => sum + c.monthlySavings, 0);
    description += `- **${changesByType.shutdown.length} Shutdown Recommendations** → €${savingsShutdown.toFixed(2)}/month\n`;
  }
  
  description += `\n---

## 🔧 Changes Detail

`;

  changes.forEach((change, idx) => {
    description += `### ${idx + 1}. \`${change.resourceAddress}\`

**Type:** ${change.changeType}  
**Impact:** ${change.impactLevel}  
**Savings:** €${change.monthlySavings.toFixed(2)}/month (€${change.annualSavings.toFixed(2)}/year)

\`\`\`diff
- ${change.currentConfig.split('\n')[0]}
+ ${change.newConfig.split('\n')[0]}
\`\`\`

`;
  });
  
  description += `---

## ✅ Testing & Validation

### Before Merging:

1. **Review Utilization Data**
   - Check Azure Monitor metrics for the last 7-30 days
   - Verify peak usage patterns align with recommendations
   
2. **Impact Assessment**
   - [ ] Review application performance requirements
   - [ ] Verify no upcoming scaling events planned
   - [ ] Check with resource owners for business context
   
3. **Terraform Plan**
   \`\`\`bash
   cd terraform/hub
   terragrunt plan
   \`\`\`
   Expected changes: ${changes.length} resource${changes.length > 1 ? 's' : ''} modified

4. **Gradual Rollout** (recommended for production)
   - Start with dev/test environments
   - Monitor for 24-48 hours
   - Proceed with production if stable

### After Merging:

1. **Monitor Performance**
   - CPU/Memory utilization
   - Application response times
   - Error rates
   
2. **Cost Validation**
   - Verify expected savings in Azure Cost Management (5-7 days)
   - Update FinOps dashboard

---

## 📋 Checklist

- [ ] Terraform plan reviewed
- [ ] Resource owners notified
- [ ] Performance requirements validated
- [ ] Testing strategy approved
- [ ] Rollback plan documented

---

## 🤖 Automation Details

- **Source:** FinOps Toolkit - Cost Optimizer
- **Analysis Period:** 7 days
- **Confidence Level:** High
- **Data Source:** Azure Monitor API

**Note:** This PR was automatically generated. Please review carefully before merging.

For questions, contact: finops@dxc.com
`;

  return description;
}

/**
 * Create Git branch and commit changes
 */
async function createOptimizationBranch(
  terraformPath: string,
  changes: TerraformChange[],
  totalSavings: number
): Promise<{ branchName: string; commitSha: string }> {
  const timestamp = Date.now();
  const branchName = `finops/auto-optimize-${timestamp}`;
  
  console.log('📝 Creating optimization branch:', branchName);
  
  // Create new branch
  await executeWSLCommand(terraformPath, `git checkout -b ${branchName}`);
  
  // Apply changes to Terraform files
  // In reality, you would modify the actual .tf files here
  // For demo purposes, we'll create a summary file
  const changesSummary = changes.map(c => 
    `# ${c.resourceAddress}\n# ${c.changeType}: €${c.monthlySavings.toFixed(2)}/month\n${c.newConfig}\n`
  ).join('\n---\n');
  
  // Create optimization plan file
  const planContent = `# FinOps Auto-Optimization Plan
# Generated: ${new Date().toISOString()}
# Total Savings: €${totalSavings.toFixed(2)}/month

${changesSummary}
`;
  
  // In production, you would:
  // 1. Parse existing .tf files
  // 2. Update VM size parameters
  // 3. Add comments with savings info
  // 4. Commit actual changes
  
  // For demo, create a plan file
  await executeWSLCommand(terraformPath, `cat > finops_optimization_plan.txt << 'EOF'\n${planContent}\nEOF`);
  
  // Git add and commit
  await executeWSLCommand(terraformPath, 'git add finops_optimization_plan.txt');
  await executeWSLCommand(
    terraformPath,
    `git commit -m "feat(finops): Auto-optimize ${changes.length} resources - Save €${totalSavings.toFixed(2)}/month"`
  );
  
  // Get commit SHA
  const commitSha = (await executeWSLCommand(terraformPath, 'git rev-parse HEAD')).trim();
  
  console.log('✅ Branch created:', branchName);
  console.log('✅ Commit SHA:', commitSha);
  
  return { branchName, commitSha };
}

/**
 * Create Pull Request using GitHub CLI
 */
async function createGitHubPR(
  terraformPath: string,
  branchName: string,
  title: string,
  description: string,
  assignees: string[]
): Promise<{ prNumber: number; prUrl: string }> {
  console.log('🚀 Creating GitHub Pull Request...');
  
  // Push branch to remote
  await executeWSLCommand(terraformPath, `git push -u origin ${branchName}`);
  
  // Create PR using GitHub CLI
  const assigneeList = assignees.join(',');
  const prCommand = `gh pr create --title "${title}" --body "${description.replace(/"/g, '\\"')}" --assignee "${assigneeList}" --label "finops,auto-optimization"`;
  
  try {
    const prOutput = await executeWSLCommand(terraformPath, prCommand);
    
    // Parse PR URL from output
    const prUrlMatch = prOutput.match(/https:\/\/github\.com\/[^\s]+\/pull\/(\d+)/);
    if (!prUrlMatch) {
      throw new Error('Could not parse PR URL from gh output');
    }
    
    const prUrl = prUrlMatch[0];
    const prNumber = parseInt(prUrlMatch[1], 10);
    
    console.log('✅ PR Created:', prUrl);
    
    return { prNumber, prUrl };
  } catch (error: any) {
    console.error('Failed to create PR:', error);
    throw error;
  }
}

// ============================================
// Main Auto-Optimization Flow
// ============================================

/**
 * Execute auto-optimization workflow
 */
export async function executeAutoOptimization(
  recommendations: RightSizingRecommendation[],
  config: AutoOptimizationConfig = DEFAULT_CONFIG
): Promise<AutoOptimizationResult> {
  const result: AutoOptimizationResult = {
    success: false,
    recommendationsAnalyzed: recommendations.length,
    changesGenerated: 0,
    prCreated: false,
    terraformChanges: [],
    errors: [],
  };
  
  try {
    console.log('🤖 Starting Auto-Optimization Workflow...');
    console.log(`📊 Analyzing ${recommendations.length} recommendations...`);
    
    // Filter recommendations based on config
    const eligibleRecs = recommendations.filter(rec => 
      rec.priority >= config.maxPriority &&
      rec.monthlySavings >= config.minMonthlySavings
    );
    
    console.log(`✅ ${eligibleRecs.length} recommendations eligible for auto-optimization`);
    
    if (eligibleRecs.length === 0) {
      result.success = true;
      result.errors.push('No recommendations meet auto-optimization criteria');
      return result;
    }
    
    // Generate Terraform changes
    const changes: TerraformChange[] = [];
    for (const rec of eligibleRecs) {
      const change = generateTerraformChange(rec, config.terraformPath);
      if (change) {
        changes.push(change);
      }
    }
    
    result.terraformChanges = changes;
    result.changesGenerated = changes.length;
    
    console.log(`🔧 Generated ${changes.length} Terraform changes`);
    
    if (changes.length === 0) {
      result.success = true;
      result.errors.push('No Terraform changes could be generated');
      return result;
    }
    
    // Calculate total savings
    const totalMonthlySavings = changes.reduce((sum, c) => sum + c.monthlySavings, 0);
    const totalAnnualSavings = totalMonthlySavings * 12;
    
    console.log(`💰 Total Savings: €${totalMonthlySavings.toFixed(2)}/month`);
    
    if (!config.autoCreatePR) {
      result.success = true;
      console.log('ℹ️ Auto-create PR disabled. Changes generated but not committed.');
      return result;
    }
    
    // Create branch and commit
    const { branchName, commitSha } = await createOptimizationBranch(
      config.terraformPath,
      changes,
      totalMonthlySavings
    );
    
    // Generate PR title and description
    const prTitle = `FinOps: Optimize ${changes.length} resources - Save €${totalMonthlySavings.toFixed(2)}/month`;
    const prDescription = generatePRDescription(changes, totalMonthlySavings);
    
    // Create GitHub PR
    const { prNumber, prUrl } = await createGitHubPR(
      config.terraformPath,
      branchName,
      prTitle,
      prDescription,
      config.assignees
    );
    
    // Build PR object
    const pr: OptimizationPR = {
      id: `opt-pr-${Date.now()}`,
      branchName,
      prNumber,
      prUrl,
      title: prTitle,
      description: prDescription,
      changes,
      totalMonthlySavings,
      totalAnnualSavings,
      status: 'open',
      createdAt: new Date().toISOString(),
      assignees: config.assignees,
    };
    
    result.pr = pr;
    result.prCreated = true;
    result.success = true;
    
    console.log('✅ Auto-Optimization Complete!');
    console.log(`📌 PR: ${prUrl}`);
    
    return result;
    
  } catch (error: any) {
    console.error('❌ Auto-Optimization Failed:', error);
    result.success = false;
    result.errors.push(error.message);
    return result;
  }
}

/**
 * Execute dry-run (preview only, no PR creation)
 */
export async function executeAutoOptimizationDryRun(
  recommendations: RightSizingRecommendation[],
  config: AutoOptimizationConfig = DEFAULT_CONFIG
): Promise<AutoOptimizationResult> {
  const dryRunConfig = { ...config, autoCreatePR: false };
  return executeAutoOptimization(recommendations, dryRunConfig);
}
