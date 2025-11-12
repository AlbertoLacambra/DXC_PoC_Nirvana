# Test Case: Complete Project Creation with Custom Fields

## Test Scenario
Create a complete project using the Project Wizard to verify all custom fields are created automatically.

## Test Data

### Step 1: Project Information
- **Project Name**: `E-Commerce Smart Checkout`
- **Description**: `Smart checkout system with one-click purchasing, multiple payment methods, and seamless cart management`
- **Timeline**: `6 weeks`
- **Constraints**: `Must integrate with legacy inventory system`

### Step 2: Must-Have Features
```
- Payment processing (Stripe, PayPal)
- Cart management
- Order confirmation
- Guest checkout
```

### Step 3: Nice-to-Have Features
```
- Saved payment methods
- One-click reorder
- Gift wrapping options
```

### Step 4: Deployment
- **Repository Owner**: `AlbertoLacambra`
- **Repository Name**: `ecommerce-smart-checkout`
- **Create Project Board**: ✅ Yes

## Expected Results

### 1. Plan Generation
The AI should generate a plan with approximately:
- **Epics**: 2-3 (major business themes)
- **Features**: 5-7 (user-facing capabilities)
- **Stories**: 8-12 (user stories)
- **Enablers**: 2-4 (technical work)
- **Tests**: 2-3 (test suites)

### 2. GitHub Issues Created
All issues should be created in the repository with:
- Proper hierarchy (Epic → Feature → Story)
- Labels (epic, feature, story, enabler, test, P0-P3)
- Dependencies documented in issue bodies
- Estimates (Fibonacci for stories, T-shirt for epics)

### 3. Project Board Created
A GitHub Project V2 should be created with:

#### Default Fields:
- **Status**: Todo, In Progress, Done
- **Title**: Issue title
- **Assignees**: (empty initially)
- **Labels**: From GitHub issues

#### Custom Fields (Automatically Created):
- ✅ **Start Date** (Date field)
- ✅ **Target Date** (Date field)
- ✅ **Sprint** (Iteration field)
- ✅ **Priority** (Single Select: P0-Critical, P1-High, P2-Medium, P3-Low)
- ✅ **Story Points** (Number field)

### 4. All Issues Linked to Project
All created issues should be automatically added to the project board in "Todo" status.

## Server Logs to Verify

When deployment runs, you should see these logs:

```
=== Deploy to GitHub Request ===
Repository: AlbertoLacambra/ecommerce-smart-checkout
Create Project Board: true
Plan structure: { ... }

Creating epic issue: "Epic: ..." at 1
Creating feature issue: "Feature: ..." at 1.1
Creating story issue: "Story: ..." at 1.1.1
...

Creating GitHub Project Board V2 with GraphQL...
Repository owner ID: MDQ6VXNlcjY0NTE5MDg5
Project V2 created: { id: '...', number: X, url: '...' }
Project linked to repository
Using default Status field with options: Todo, In Progress, Done

Adding custom fields for roadmap and tracking...
✓ Start Date field created
✓ Target Date field created
✓ Sprint field created
✓ Priority field created
✓ Story Points field created

Adding issues to project...
Added XX issues to project
Project board created successfully with default columns: Todo, In Progress, Done
```

## Verification Steps

### Via GitHub Web UI:

1. **Go to the project**:
   - URL will be shown in wizard success message
   - Format: `https://github.com/users/AlbertoLacambra/projects/X`

2. **Verify Custom Fields**:
   - Click on any issue in the project
   - In the side panel, you should see:
     - Status (dropdown)
     - Start Date (date picker)
     - Target Date (date picker)
     - Sprint (iteration picker - initially empty)
     - Priority (dropdown with P0-P3)
     - Story Points (number input)

3. **Verify Issues**:
   - All issues should be in "Todo" column
   - Count should match deployment message
   - Open a few issues to verify hierarchy and dependencies

### Via GraphQL:

```bash
# Get project ID from the project URL (last part after /projects/)
PROJECT_NUMBER=9  # Replace with actual number

# Query project fields
gh api graphql -f query='
query {
  viewer {
    projectV2(number: '$PROJECT_NUMBER') {
      id
      title
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
            options {
              name
            }
          }
        }
      }
    }
  }
}'
```

Expected output should include:
- Start Date (DATE)
- Target Date (DATE)
- Sprint (ITERATION)
- Priority (SINGLE_SELECT with P0-P3 options)
- Story Points (NUMBER)

## Success Criteria

- ✅ All issues created successfully
- ✅ Project board created
- ✅ All 5 custom fields present
- ✅ Priority field has 4 options (P0-P3)
- ✅ All issues linked to project
- ✅ No errors in server logs
- ✅ Project accessible via provided URL

## Next Steps After Test

If all success criteria are met:

1. **Configure Sprints**:
   ```bash
   ./scripts/setup-sprints.sh <PROJECT_ID>
   ```

2. **Enable Workflows**:
   - Go to project → ⋯ → Workflows
   - Enable "Auto-add to project"
   - Enable "Item closed"

3. **Create Views**:
   - Board view (default)
   - Roadmap view (for timeline)
   - Table view (for bulk editing)

4. **Assign Values**:
   - Set Start Date and Target Date for stories
   - Assign stories to Sprint 1
   - Set Story Points based on estimates

## Troubleshooting

### If custom fields are missing:
- Check server logs for "✓ X field created" messages
- Verify no GraphQL errors in logs
- Check GitHub token has `project` scope

### If issues not linked to project:
- Check "Adding issues to project..." in logs
- Verify "Added XX issues to project" appears
- Check for GraphQL errors with `addProjectV2ItemById`

### If project not created:
- Check "Project V2 created" in logs
- Verify token has `project` scope
- Check repository exists and is accessible
