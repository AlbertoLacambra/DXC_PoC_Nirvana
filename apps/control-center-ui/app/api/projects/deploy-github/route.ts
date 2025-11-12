import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { graphql } from '@octokit/graphql';

/**
 * POST /api/projects/deploy-github
 * Creates GitHub issues and project board from generated plan
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      plan, 
      repositoryOwner, 
      repositoryName,
      createProjectBoard = true,
      logId 
    } = body;

    console.log('=== Deploy to GitHub Request ===');
    console.log('Repository:', `${repositoryOwner}/${repositoryName}`);
    console.log('Create Project Board:', createProjectBoard);
    console.log('Plan structure:', {
      hasProject: !!plan?.project,
      epicsCount: plan?.epics?.length || 0,
      featuresCount: plan?.features?.length || 0,
      storiesCount: plan?.stories?.length || 0,
      enablersCount: plan?.enablers?.length || 0,
      testsCount: plan?.tests?.length || 0,
    });

    // Validate inputs
    if (!plan || !repositoryOwner || !repositoryName) {
      return NextResponse.json(
        { error: 'Plan, repository owner, and repository name are required' },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable not configured');
    }

    const octokit = new Octokit({ auth: githubToken });

    // Verify repository access
    try {
      await octokit.repos.get({
        owner: repositoryOwner,
        repo: repositoryName,
      });
    } catch (error: any) {
      throw new Error(`Cannot access repository ${repositoryOwner}/${repositoryName}: ${error.message}`);
    }

    // Save project to database
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.AGENT_HUB_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.AGENT_HUB_DB_PORT || process.env.POSTGRES_PORT || '5432'),
      database: process.env.AGENT_HUB_DB_NAME || 'nirvana_agent_hub',
      user: process.env.AGENT_HUB_DB_USER || process.env.POSTGRES_USER || 'postgres',
      password: process.env.AGENT_HUB_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    });

    const projectResult = await pool.query(
      `INSERT INTO github_projects 
       (name, description, repository_owner, repository_name, status, timeline_start, timeline_end, success_metrics, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id`,
      [
        plan.project?.name || 'Untitled Project',
        plan.project?.description || '',
        repositoryOwner,
        repositoryName,
        'planning',
        plan.project?.timeline_start || null,
        plan.project?.timeline_end || null,
        JSON.stringify(plan.project?.success_metrics || []),
        'system' // TODO: Replace with actual user from session
      ]
    );

    const projectId = projectResult.rows[0].id;

    // Update generation log with project ID
    if (logId) {
      await pool.query(
        'UPDATE project_generation_logs SET project_id = $1 WHERE id = $2',
        [projectId, logId]
      );
    }

    // Track created issues for dependency linking
    const issueMap = new Map<string, { issueNumber: number; issueId: string }>();
    const createdIssues: any[] = [];

    // Helper function to create issue
    const createIssue = async (
      issueData: any,
      issueType: string,
      hierarchyLevel: number,
      hierarchyPath: string,
      parentIssueId?: string
    ) => {
      // Validate issueData has required fields
      if (!issueData || typeof issueData !== 'object') {
        console.error(`Invalid ${issueType} data at ${hierarchyPath}:`, issueData);
        throw new Error(`Invalid ${issueType} data: expected object, got ${typeof issueData}`);
      }

      if (!issueData.title) {
        console.error(`Missing title for ${issueType} at ${hierarchyPath}:`, JSON.stringify(issueData, null, 2));
        throw new Error(`Missing title for ${issueType} at ${hierarchyPath}. Issue data: ${JSON.stringify(issueData)}`);
      }

      const labels = [issueType, ...(issueData.labels || [])];
      if (issueData.priority) labels.push(issueData.priority);
      if (issueData.value) labels.push(`value-${issueData.value}`);

      console.log(`Creating ${issueType} issue: "${issueData.title}" at ${hierarchyPath}`);

      // Create GitHub issue
      const githubIssue = await octokit.issues.create({
        owner: repositoryOwner,
        repo: repositoryName,
        title: issueData.title,
        body: issueData.body || '',
        labels: labels,
      });

      // Save to database
      const dbIssue = await pool.query(
        `INSERT INTO github_issues_tracking 
         (project_id, github_issue_number, github_issue_id, issue_type, title, body, state, 
          priority, value, estimate, labels, hierarchy_level, hierarchy_path, parent_issue_id, dependencies, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
         RETURNING id`,
        [
          projectId,
          githubIssue.data.number,
          githubIssue.data.id.toString(),
          issueType,
          issueData.title,
          issueData.body || '',
          'open',
          issueData.priority || null,
          issueData.value || null,
          issueData.estimate || null,
          JSON.stringify(labels),
          hierarchyLevel,
          hierarchyPath,
          parentIssueId || null,
          JSON.stringify(issueData.dependencies || []),
          JSON.stringify({
            assignees: issueData.assignees || [],
            milestone: issueData.milestone || null,
            sprint: issueData.sprint || null,
            component: issueData.component || null,
          })
        ]
      );

      const result = {
        dbId: dbIssue.rows[0].id,
        issueNumber: githubIssue.data.number,
        issueId: githubIssue.data.id.toString(),
        url: githubIssue.data.html_url,
        type: issueType,
        title: issueData.title,
        hierarchyPath,
      };

      issueMap.set(hierarchyPath, { issueNumber: result.issueNumber, issueId: result.dbId });
      createdIssues.push(result);

      return result;
    };

    // Create Epics (Level 0)
    const epics = plan.epics || [];
    for (let i = 0; i < epics.length; i++) {
      const epic = epics[i];
      const hierarchyPath = `${i + 1}`;
      await createIssue(epic, 'epic', 0, hierarchyPath);
    }

    // Create Features (Level 1)
    const features = plan.features || [];
    for (const feature of features) {
      const epicPath = feature.epic_path || '1'; // Default to first epic if not specified
      const epicIssue = issueMap.get(epicPath);
      const hierarchyPath = `${epicPath}.${feature.feature_number || features.indexOf(feature) + 1}`;
      
      await createIssue(feature, 'feature', 1, hierarchyPath, epicIssue?.issueId);
    }

    // Create Stories (Level 2)
    const stories = plan.stories || [];
    for (const story of stories) {
      const featurePath = story.feature_path || '1.1';
      const featureIssue = issueMap.get(featurePath);
      const hierarchyPath = `${featurePath}.${story.story_number || stories.indexOf(story) + 1}`;
      
      await createIssue(story, 'story', 2, hierarchyPath, featureIssue?.issueId);
    }

    // Create Enablers (Level 2)
    const enablers = plan.enablers || [];
    for (const enabler of enablers) {
      const featurePath = enabler.feature_path || '1.1';
      const featureIssue = issueMap.get(featurePath);
      const hierarchyPath = `${featurePath}.E${enabler.enabler_number || enablers.indexOf(enabler) + 1}`;
      
      await createIssue(enabler, 'enabler', 2, hierarchyPath, featureIssue?.issueId);
    }

    // Create Tests (Level 2)
    const tests = plan.tests || [];
    for (const test of tests) {
      const featurePath = test.feature_path || '1.1';
      const featureIssue = issueMap.get(featurePath);
      const hierarchyPath = `${featurePath}.T${test.test_number || tests.indexOf(test) + 1}`;
      
      await createIssue(test, 'test', 2, hierarchyPath, featureIssue?.issueId);
    }

    // Create dependency links via comments
    const dependencies = plan.dependencies || [];
    for (const dep of dependencies) {
      const fromIssue = issueMap.get(dep.from_path);
      const toIssue = issueMap.get(dep.to_path);
      
      if (fromIssue && toIssue) {
        const depComment = `**Dependency**: ${dep.type} #${toIssue.issueNumber}`;
        
        await octokit.issues.createComment({
          owner: repositoryOwner,
          repo: repositoryName,
          issue_number: fromIssue.issueNumber,
          body: depComment,
        });
      }
    }

    // Create GitHub Project Board V2 (if requested)
    // Uses GraphQL API for Projects V2 (requires 'project' and 'read:project' scopes)
    let projectBoard = null;
    let projectBoardError = null;
    
    if (createProjectBoard) {
      try {
        console.log('Creating GitHub Project Board V2 with GraphQL...');
        
        const graphqlWithAuth = graphql.defaults({
          headers: {
            authorization: `Bearer ${githubToken}`,
          },
        });

        // Step 1: Get repository owner ID (user or organization)
        const ownerQuery = `
          query($owner: String!) {
            repositoryOwner(login: $owner) {
              id
              login
            }
          }
        `;
        
        const ownerResult: any = await graphqlWithAuth(ownerQuery, {
          owner: repositoryOwner,
        });
        
        const ownerId = ownerResult.repositoryOwner.id;
        console.log('Repository owner ID:', ownerId);

        // Step 2: Create Project V2
        const createProjectMutation = `
          mutation($ownerId: ID!, $title: String!) {
            createProjectV2(input: {
              ownerId: $ownerId
              title: $title
            }) {
              projectV2 {
                id
                number
                title
                url
              }
            }
          }
        `;

        const projectResult: any = await graphqlWithAuth(createProjectMutation, {
          ownerId: ownerId,
          title: plan.project?.name || 'Project Board',
        });

        const project = projectResult.createProjectV2.projectV2;
        console.log('Project V2 created:', project);

        // Step 3: Link project to repository
        const linkProjectMutation = `
          mutation($projectId: ID!, $repositoryId: ID!) {
            linkProjectV2ToRepository(input: {
              projectId: $projectId
              repositoryId: $repositoryId
            }) {
              repository {
                id
              }
            }
          }
        `;

        // Get repository ID
        const repoQuery = `
          query($owner: String!, $name: String!) {
            repository(owner: $owner, name: $name) {
              id
            }
          }
        `;

        const repoResult: any = await graphqlWithAuth(repoQuery, {
          owner: repositoryOwner,
          name: repositoryName,
        });

        const repositoryId = repoResult.repository.id;

        await graphqlWithAuth(linkProjectMutation, {
          projectId: project.id,
          repositoryId: repositoryId,
        });

        console.log('Project linked to repository');

        // Step 4: Get the default "Status" field ID
        const fieldQuery = `
          query($projectId: ID!) {
            node(id: $projectId) {
              ... on ProjectV2 {
                fields(first: 20) {
                  nodes {
                    ... on ProjectV2SingleSelectField {
                      id
                      name
                      options {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const fieldsResult: any = await graphqlWithAuth(fieldQuery, {
          projectId: project.id,
        });

        const statusField = fieldsResult.node.fields.nodes.find(
          (field: any) => field.name === 'Status'
        );

        // Step 5: Use default Status field options (Todo, In Progress, Done)
        // Note: GitHub's GraphQL API for modifying field options has changed
        // Projects V2 now uses default columns which work well for most workflows
        if (statusField) {
          console.log('Using default Status field with options:', 
            statusField.options.map((o: any) => o.name).join(', ')
          );
        }

        // Step 5.1: Add custom fields for project management
        console.log('Adding custom fields for roadmap and tracking...');
        
        // Add Start Date field
        const createStartDateField = `
          mutation($projectId: ID!) {
            createProjectV2Field(input: {
              projectId: $projectId
              dataType: DATE
              name: "Start Date"
            }) {
              projectV2Field {
                ... on ProjectV2Field {
                  id
                  name
                }
              }
            }
          }
        `;
        
        await graphqlWithAuth(createStartDateField, { projectId: project.id });
        console.log('✓ Start Date field created');

        // Add Target Date field
        const createTargetDateField = `
          mutation($projectId: ID!) {
            createProjectV2Field(input: {
              projectId: $projectId
              dataType: DATE
              name: "Target Date"
            }) {
              projectV2Field {
                ... on ProjectV2Field {
                  id
                  name
                }
              }
            }
          }
        `;
        
        await graphqlWithAuth(createTargetDateField, { projectId: project.id });
        console.log('✓ Target Date field created');

        // Add Sprint/Iteration field
        const createSprintField = `
          mutation($projectId: ID!) {
            createProjectV2Field(input: {
              projectId: $projectId
              dataType: ITERATION
              name: "Sprint"
            }) {
              projectV2Field {
                ... on ProjectV2IterationField {
                  id
                  name
                }
              }
            }
          }
        `;
        
        await graphqlWithAuth(createSprintField, { projectId: project.id });
        console.log('✓ Sprint field created');

        // Add Priority field (single select)
        const createPriorityField = `
          mutation($projectId: ID!) {
            createProjectV2Field(input: {
              projectId: $projectId
              dataType: SINGLE_SELECT
              name: "Priority"
              singleSelectOptions: [
                { name: "P0 - Critical", description: "Must have for MVP, blocks launch", color: RED }
                { name: "P1 - High", description: "Important for MVP, high business value", color: ORANGE }
                { name: "P2 - Medium", description: "Nice to have, enhances experience", color: YELLOW }
                { name: "P3 - Low", description: "Future improvements, low impact", color: GRAY }
              ]
            }) {
              projectV2Field {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                }
              }
            }
          }
        `;
        
        await graphqlWithAuth(createPriorityField, { projectId: project.id });
        console.log('✓ Priority field created');

        // Add Story Points field (number)
        const createPointsField = `
          mutation($projectId: ID!) {
            createProjectV2Field(input: {
              projectId: $projectId
              dataType: NUMBER
              name: "Story Points"
            }) {
              projectV2Field {
                ... on ProjectV2Field {
                  id
                  name
                }
              }
            }
          }
        `;
        
        await graphqlWithAuth(createPointsField, { projectId: project.id });
        console.log('✓ Story Points field created');

        // Save default column names to database for reference
        const defaultColumns = statusField?.options.map((o: any) => o.name) || ['Todo', 'In Progress', 'Done'];

        // Step 6: Add all created issues to the project
        console.log('Adding issues to project...');
        let addedCount = 0;
        
        for (const issue of createdIssues) {
          const addIssueMutation = `
            mutation($projectId: ID!, $contentId: ID!) {
              addProjectV2ItemById(input: {
                projectId: $projectId
                contentId: $contentId
              }) {
                item {
                  id
                }
              }
            }
          `;

          // Get issue node ID
          const issueQuery = `
            query($owner: String!, $name: String!, $number: Int!) {
              repository(owner: $owner, name: $name) {
                issue(number: $number) {
                  id
                }
              }
            }
          `;

          const issueResult: any = await graphqlWithAuth(issueQuery, {
            owner: repositoryOwner,
            name: repositoryName,
            number: issue.issueNumber,
          });

          const issueNodeId = issueResult.repository.issue.id;

          await graphqlWithAuth(addIssueMutation, {
            projectId: project.id,
            contentId: issueNodeId,
          });
          
          addedCount++;
        }

        console.log(`Added ${addedCount} issues to project`);

        // Step 7: Auto-configure roadmap fields (dates, sprints, story points)
        console.log('Configuring roadmap and planning fields...');
        
        try {
          // Get field IDs for the custom fields we created
          const projectFieldsQuery = `
            query($projectId: ID!) {
              node(id: $projectId) {
                ... on ProjectV2 {
                  fields(first: 20) {
                    nodes {
                      ... on ProjectV2Field {
                        id
                        name
                        dataType
                      }
                      ... on ProjectV2SingleSelectField {
                        id
                        name
                        dataType
                        options {
                          id
                          name
                        }
                      }
                      ... on ProjectV2IterationField {
                        id
                        name
                        dataType
                        configuration {
                          iterations {
                            id
                            title
                            startDate
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          `;
          
          const fieldsData: any = await graphqlWithAuth(projectFieldsQuery, {
            projectId: project.id,
          });
          
          const fields = fieldsData.node.fields.nodes.filter((f: any) => f.id);
          const startDateField = fields.find((f: any) => f.name === 'Start Date');
          const targetDateField = fields.find((f: any) => f.name === 'Target Date');
          const priorityField = fields.find((f: any) => f.name === 'Priority');
          const storyPointsField = fields.find((f: any) => f.name === 'Story Points');
          const sprintField = fields.find((f: any) => f.name === 'Sprint');

          console.log('✓ Retrieved custom field IDs');

          // Calculate project timeline
          const projectTimeline = plan.project?.timeline || '6 weeks';
          const weeksMatch = projectTimeline.match(/(\d+)\s*weeks?/i);
          const totalWeeks = weeksMatch ? parseInt(weeksMatch[1]) : 6;
          const sprintCount = Math.ceil(totalWeeks / 2); // 2-week sprints
          
          console.log(`Project timeline: ${totalWeeks} weeks (${sprintCount} sprints)`);

          // Note: Sprint configuration is complex and requires manual setup or script
          // Users should configure sprints manually via GitHub UI or using setup-sprints.sh script
          console.log(`ℹ️  Sprint field created. Configure ${sprintCount} sprints in project settings.`);

          // TODO: Update individual issue fields (Priority, Story Points, Dates, Sprint assignment)
          // This requires additional GraphQL mutations to update project items
          // For now, we've created the structure - users can manually assign or we can enhance this later
          
          console.log('✓ Roadmap configuration complete');
        } catch (configError: any) {
          console.error('Error configuring roadmap fields:', configError.message);
          // Don't fail the whole deployment if this fails
        }

        projectBoard = {
          id: project.id,
          number: project.number,
          url: project.url,
        };

        // Update database with project info
        await pool.query(
          `UPDATE github_projects 
           SET github_project_id = $1, github_project_number = $2
           WHERE id = $3`,
          [project.number.toString(), project.number, projectId]
        );

        // Save column names in database (using the default columns from GitHub)
        for (let i = 0; i < defaultColumns.length; i++) {
          await pool.query(
            `INSERT INTO project_board_columns (project_id, column_name, column_order)
             VALUES ($1, $2, $3)`,
            [projectId, defaultColumns[i], i + 1]
          );
        }
        
        console.log('Project board created successfully with default columns:', defaultColumns.join(', '));
        
      } catch (projectError: any) {
        console.error('Failed to create project board:', projectError);
        projectBoardError = projectError.message || 'Unknown error creating project board';
        
        // Save error details for debugging
        console.error('Project board error details:', {
          message: projectError.message,
          errors: projectError.errors,
          request: projectError.request,
        });
        
        // Continue even if project board creation fails
        // Users can create the project board manually from GitHub UI
      }
    }

    // Calculate recommended sprints info
    const projectTimeline = plan.project?.timeline || '6 weeks';
    const weeksMatch = projectTimeline.match(/(\d+)\s*weeks?/i);
    const totalWeeks = weeksMatch ? parseInt(weeksMatch[1]) : 6;
    const recommendedSprints = Math.ceil(totalWeeks / 2);

    // Create PROJECT_INSTRUCTIONS.md in repository
    const projectInstructionsContent = generateProjectInstructions(
      plan.project?.name || 'Project',
      projectTimeline,
      recommendedSprints,
      projectBoard
    );

    try {
      // Check if file already exists
      let sha = undefined;
      try {
        const existingFile = await octokit.repos.getContent({
          owner: repositoryOwner,
          repo: repositoryName,
          path: 'PROJECT_INSTRUCTIONS.md',
        });
        if ('sha' in existingFile.data) {
          sha = existingFile.data.sha;
        }
      } catch (err: any) {
        // File doesn't exist, will create new
        if (err.status !== 404) throw err;
      }

      // Create or update the file
      await octokit.repos.createOrUpdateFileContents({
        owner: repositoryOwner,
        repo: repositoryName,
        path: 'PROJECT_INSTRUCTIONS.md',
        message: sha 
          ? '📋 Update project board configuration instructions'
          : '📋 Add project board configuration instructions',
        content: Buffer.from(projectInstructionsContent).toString('base64'),
        sha,
      });

      console.log('✅ PROJECT_INSTRUCTIONS.md created/updated successfully');
    } catch (fileError: any) {
      console.error('⚠️ Failed to create PROJECT_INSTRUCTIONS.md:', fileError.message);
      // Don't fail the whole deployment if this fails
    }

    // Mark project as deployed
    await pool.query(
      `UPDATE github_projects SET status = $1, deployed_at = CURRENT_TIMESTAMP WHERE id = $2`,
      ['active', projectId]
    );

    return NextResponse.json({
      success: true,
      data: {
        project_id: projectId,
        repository: `${repositoryOwner}/${repositoryName}`,
        issues_created: createdIssues.length,
        issues: createdIssues,
        project_board: projectBoard,
        project_board_error: projectBoardError,
        recommended_sprints: recommendedSprints,
        timeline: projectTimeline,
        manual_steps: !projectBoard ? {
          message: 'Project board could not be created automatically. Please create it manually:',
          steps: [
            `1. Go to https://github.com/${repositoryOwner}/${repositoryName}`,
            '2. Click on "Projects" tab',
            '3. Click "Link a project" → "New project"',
            '4. Choose "Board" template',
            `5. Name it: "${plan.project?.name || 'Project Board'}"`,
            '6. Add columns: Backlog, Sprint Ready, In Progress, Review, Testing, Done',
            '7. Link the issues to the project'
          ]
        } : null,
      }
    });

  } catch (error: any) {
    console.error('Error deploying to GitHub:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to deploy project to GitHub',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

/**
 * Generate PROJECT_INSTRUCTIONS.md content
 */
function generateProjectInstructions(
  projectName: string,
  timeline: string,
  recommendedSprints: number,
  projectBoard: any
): string {
  const boardUrl = projectBoard?.url || '[Your Project Board URL]';
  const boardName = projectBoard?.title || projectName;

  return `# 📋 ${projectName} - Project Board Configuration Guide

## Overview

This guide provides step-by-step instructions to configure your GitHub Project Board for optimal agile workflow management.

**Project Board**: [${boardName}](${boardUrl})

---

## 🎯 Project Board Setup

We've created **5 custom fields** to track your work:

| Field | Type | Purpose |
|-------|------|---------|
| **Start Date** | Date | When work begins on this item |
| **Target Date** | Date | Expected completion date |
| **Sprint** | Iteration | Which sprint this item belongs to |
| **Priority** | Single Select | Business value priority (P0-P3) |
| **Story Points** | Number | Effort estimation (Fibonacci) |

---

## ⏱️ Timeline & Sprints

**Project Timeline**: ${timeline}  
**Recommended Sprints**: ${recommendedSprints} sprints (2 weeks each)

### Step 1️⃣: Configure Sprint Iterations

1. Navigate to your [Project Board](${boardUrl})
2. Click **⚙️ Settings** (top-right)
3. Find **Sprint** field in the fields list
4. Click **Edit** → **Configure iterations**
5. Set up **${recommendedSprints} iterations**:
   - **Duration**: 2 weeks per sprint
   - **Start date**: Choose your sprint 1 start date
   - **Naming**: Sprint 1, Sprint 2, Sprint 3${recommendedSprints > 3 ? ', ...' : ''}

**Example**:
\`\`\`
Sprint 1: Jan 15 - Jan 28
Sprint 2: Jan 29 - Feb 11
Sprint 3: Feb 12 - Feb 25
${recommendedSprints > 3 ? `Sprint ${recommendedSprints}: [Auto-calculated]` : ''}
\`\`\`

---

## 🤖 Step 2️⃣: Enable Automated Workflows

Automate repetitive tasks to keep your board up-to-date.

### Navigation
1. Go to [Project Board](${boardUrl})
2. Click **⚙️ Settings**
3. Select **Workflows** from sidebar

### Recommended Workflows

#### ✅ Auto-add to project
- **Trigger**: When issues/PRs are created in repository
- **Action**: Automatically add to "📥 Backlog" column
- **Benefit**: Never miss tracking new work

#### ✅ Auto-archive closed items
- **Trigger**: When issue/PR is closed
- **Action**: Move to "✅ Done" and archive after 7 days
- **Benefit**: Keep board clean and focused

#### ✅ Item reopened
- **Trigger**: Closed item is reopened
- **Action**: Move back to "🔄 In Progress"
- **Benefit**: Handle rework automatically

---

## 📅 Step 3️⃣: Assign Dates to Stories

Enable **Roadmap timeline visualization** by setting dates.

### How to Set Dates

1. Switch to **🗺️ Roadmap** view (top-right view selector)
2. Click on any **Story** card
3. In the side panel, set:
   - **Start Date**: When development begins
   - **Target Date**: Expected completion
4. Repeat for all stories in Sprint 1 first

### 📊 Timeline Best Practices

| Item Type | Date Strategy |
|-----------|---------------|
| **Epic** | Set Start = first story start, Target = last story end |
| **Feature** | Set Start = first child story, Target = last child story |
| **Story** | Set realistic dates within sprint boundaries |
| **Enabler** | Set dates before dependent stories |

**💡 Tip**: Stories without dates won't appear in Roadmap view!

---

## 🔢 Step 4️⃣: Story Points for Velocity Tracking

Use **Fibonacci sequence** to estimate effort and track team velocity.

### Estimation Guide

| Points | Time Estimate | Complexity | Examples |
|--------|---------------|------------|----------|
| **1** | < 4 hours | Trivial | Update text, fix typo, config change |
| **2** | < 1 day | Simple | Add button, simple form field |
| **3** | 1-2 days | Moderate | CRUD page, API endpoint |
| **5** | 2-3 days | Complex | Authentication flow, search feature |
| **8** | 3-5 days | Very Complex | Payment integration, file upload |
| **13** | 1 sprint | Epic-level | Full checkout flow, reporting dashboard |

**⚠️ If a story is >13 points, break it down into smaller stories!**

### How to Set Story Points

1. Open any Story issue
2. In the Project panel (right sidebar)
3. Find **Story Points** field
4. Select appropriate value (1, 2, 3, 5, 8, 13)

### 📈 Calculating Velocity

**Velocity** = Total story points completed per sprint

\`\`\`
Example:
Sprint 1: Completed 21 points
Sprint 2: Completed 25 points
Sprint 3: Completed 23 points
→ Average Velocity: 23 points/sprint
\`\`\`

Use this to forecast future sprints!

---

## 🎯 Step 5️⃣: Priority & Business Value

Prioritize work based on **business impact** and **urgency**.

### Priority Levels

| Priority | Criteria | % of Total | Examples |
|----------|----------|------------|----------|
| **P0 - Critical** | Blocks launch, security, legal compliance | ~40% | Payment processing, user authentication, GDPR compliance |
| **P1 - High** | Core user journeys, key differentiators | ~35% | Checkout flow, product search, order tracking |
| **P2 - Medium** | Important but not blocking launch | ~20% | Wishlist, reviews, advanced filters |
| **P3 - Low** | Nice-to-have, optimizations | ~5% | Social sharing, animations, tooltips |

### How to Set Priority

1. Open any issue (Epic, Feature, Story)
2. In Project panel, find **Priority** field
3. Select appropriate level:
   - **P0**: Must have for launch
   - **P1**: Core functionality
   - **P2**: Important enhancement
   - **P3**: Future optimization

### 💡 Balancing Work

Aim for this distribution in each sprint:
- **60% P0+P1**: Core work
- **30% P2**: Important features
- **10% P3**: Polish & tech debt

---

## 🔗 Step 6️⃣: Managing Dependencies

Visualize and track dependencies between work items.

### Dependency Types

| Type | Description | Notation |
|------|-------------|----------|
| **blocks** | Story A must complete before Story B | A blocks B → B can't start until A is done |
| **requires** | Story needs an Enabler first | Story requires Enabler E → E must finish first |
| **parallel** | Stories can run simultaneously | Story A \\|\\| Story B → Can work together |

### How to Add Dependencies

#### Method 1: Using Issue Comments (Automated)
Our system automatically creates dependency comments like:
\`\`\`
**Dependency**: blocks #42
**Dependency**: requires #15
\`\`\`

#### Method 2: Using Tasklists (GitHub Native)
\`\`\`markdown
## Dependencies
- [ ] Blocked by #15 (Database schema)
- [x] Requires #8 (API client)
\`\`\`

#### Method 3: Manual Cross-References
Simply mention related issues:
\`\`\`
This story depends on #12 and #13 being completed first.
\`\`\`

### 📊 Dependency View

To see dependencies visually:
1. Use **Board view** with grouping by Sprint
2. Look for dependency comments on each card
3. Plan sprints ensuring blockers are scheduled first

---

## 📐 Epic Sizing (T-Shirt Sizes)

For high-level estimation, use **T-shirt sizes** for Epics.

| Size | Story Count | Total Points | Sprint Count | Examples |
|------|-------------|--------------|--------------|----------|
| **XS** | 1-2 stories | 5-8 points | < 1 sprint | Single feature, bug fix |
| **S** | 3-5 stories | 13-21 points | 1 sprint | Simple user flow |
| **M** | 6-10 stories | 34-55 points | 2-3 sprints | Medium feature set |
| **L** | 11-20 stories | 89-144 points | 4-6 sprints | Major feature area |
| **XL** | 21-40 stories | 233+ points | 7-12 sprints | Platform capability |

### How to Size Epics

1. List all Features under the Epic
2. Count Stories under each Feature
3. Sum total Story count
4. Match to T-shirt size above
5. Add as label: \`size:M\`, \`size:L\`, etc.

---

## 🚀 Quick Start Checklist

Use this checklist to configure your board in **under 30 minutes**:

- [ ] **Configure ${recommendedSprints} Sprint iterations** (2 weeks each)
- [ ] **Enable 3 automated workflows** (auto-add, auto-archive, item-reopened)
- [ ] **Set Priority** for all Epics and Features (P0-P3)
- [ ] **Assign Story Points** to all Stories (Fibonacci: 1,2,3,5,8,13)
- [ ] **Set Start/Target dates** for Sprint 1 stories
- [ ] **Review dependencies** in issue comments
- [ ] **Verify Roadmap view** shows timeline correctly
- [ ] **Calculate initial velocity** after Sprint 1

---

## 📚 Additional Resources

- [GitHub Projects Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [Agile Estimation Guide](https://www.atlassian.com/agile/project-management/estimation)
- [Story Point Fibonacci Explained](https://www.scrum.org/resources/blog/practical-fibonacci-beginners-guide-relative-sizing)

---

## 🆘 Need Help?

If you encounter issues:
1. Check GitHub Projects [status page](https://www.githubstatus.com/)
2. Review [Projects API documentation](https://docs.github.com/en/graphql/reference/objects#projectv2)
3. Contact your team's Project Manager or Scrum Master

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}  
**Auto-generated** by DXC Nirvana Control Center
`;
}
