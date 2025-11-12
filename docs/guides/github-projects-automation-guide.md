# GitHub Projects V2 - Automation & Roadmap Guide

This guide explains how to use the advanced features of GitHub Projects V2 for automated tracking, roadmap planning, and dependency management in projects created by the Project Wizard.

## 📋 Table of Contents

- [Custom Fields Overview](#custom-fields-overview)
- [Automated Workflows](#automated-workflows)
- [Roadmap View](#roadmap-view)
- [Managing Dependencies](#managing-dependencies)
- [Sprint Planning](#sprint-planning)
- [Best Practices](#best-practices)

---

## 🎯 Custom Fields Overview

When you create a project using the Project Wizard, the following custom fields are automatically added:

### 1. **Status** (Built-in)
- **Type**: Single Select
- **Options**: Todo, In Progress, Done
- **Purpose**: Track the current state of each issue
- **Automation**: Can trigger workflows when changed

### 2. **Start Date**
- **Type**: Date
- **Purpose**: When work on this issue begins
- **Usage**: Set this when moving an issue to "In Progress"
- **Roadmap**: Shows as the start point in timeline views

### 3. **Target Date**
- **Type**: Date
- **Purpose**: Expected completion date
- **Usage**: Set based on estimates and sprint planning
- **Roadmap**: Shows as the end point in timeline views

### 4. **Sprint**
- **Type**: Iteration
- **Purpose**: Assign issues to sprints/iterations
- **Usage**: Organize work into time-boxed periods
- **Configuration**: Add iterations via project settings

### 5. **Priority**
- **Type**: Single Select
- **Options**:
  - **P0 - Critical** (Red): Must have for MVP, blocks launch
  - **P1 - High** (Orange): Important for MVP, high business value
  - **P2 - Medium** (Yellow): Nice to have, enhances experience
  - **P3 - Low** (Gray): Future improvements, low impact
- **Purpose**: Business priority alignment
- **Usage**: Helps with sprint planning and triage

### 6. **Story Points**
- **Type**: Number
- **Purpose**: Fibonacci estimation (1, 2, 3, 5, 8, 13)
- **Usage**: Team velocity tracking and sprint capacity planning
- **Best Practice**: Update after estimation sessions

---

## 🤖 Automated Workflows

GitHub Projects V2 has built-in workflows that can automate issue tracking. Here's how to set them up:

### Accessing Workflows

1. Go to your project: `https://github.com/users/YOUR_USERNAME/projects/PROJECT_NUMBER`
2. Click **⋯ (three dots)** in the top-right
3. Select **Workflows**

### Recommended Workflows

#### 1. **Auto-add to Project**
Automatically add issues/PRs from the repository to the project.

```yaml
Trigger: Issue opened
Action: Add to project
Status: Set to "Todo"
```

**Setup:**
- Workflow: "Item added to project"
- Trigger: When issue or pull request is added
- Action: Set Status to "Todo"

#### 2. **Auto-archive Closed Issues**
Archive issues when they're closed.

```yaml
Trigger: Issue closed
Action: Set Status to "Done"
Archive: After 7 days
```

**Setup:**
- Workflow: "Item closed"
- Trigger: When issue or pull request is closed
- Action: Set Status to "Done", then Archive

#### 3. **Pull Request Linked**
Move issue to "In Progress" when a PR is linked.

```yaml
Trigger: Pull request linked to issue
Action: Set Status to "In Progress"
Set: Start Date to today
```

**Setup:**
- Workflow: "Pull request merged"
- Trigger: When PR is linked
- Action: Update Status field

#### 4. **Sprint Auto-assignment**
When setting Target Date, auto-assign to current sprint.

**Manual Setup Required:**
- This requires custom GitHub Actions workflow in `.github/workflows/`

### Creating Custom Workflows

For more complex automation, create a GitHub Actions workflow:

```yaml
# .github/workflows/project-automation.yml
name: Project Automation

on:
  issues:
    types: [opened, labeled, assigned]
  pull_request:
    types: [opened, ready_for_review, closed]

jobs:
  update-project:
    runs-on: ubuntu-latest
    steps:
      - name: Move to In Progress when PR opened
        if: github.event_name == 'pull_request' && github.event.action == 'opened'
        uses: actions/github-script@v7
        with:
          script: |
            // Update project item status
            // Use GraphQL to update ProjectV2 fields
            
      - name: Set Priority from Labels
        if: github.event_name == 'issues' && github.event.action == 'labeled'
        uses: actions/github-script@v7
        with:
          script: |
            const label = context.payload.label.name;
            if (label.startsWith('P0')) {
              // Update Priority field to P0
            }
```

---

## 🗺️ Roadmap View

The Roadmap view provides a timeline visualization of your project using the Start Date and Target Date fields.

### Creating a Roadmap View

1. **Open your project**
2. Click **+ New view** (top-right)
3. Select **Roadmap**
4. Configure:
   - **Start date field**: Start Date
   - **Target date field**: Target Date
   - **Group by**: Sprint (or Epic, Feature)
   - **Zoom**: Month, Quarter, or Year

### Using the Roadmap

#### Setting Dates for Issues

**Option 1: Bulk Edit**
1. Select multiple issues (Cmd/Ctrl + Click)
2. Right-click → **Set field value**
3. Choose Start Date or Target Date
4. Pick date from calendar

**Option 2: Drag & Drop**
1. In Roadmap view, drag issue bars
2. Resize to adjust duration
3. Dates update automatically

**Option 3: From Issue**
1. Open issue in project
2. Set Start Date and Target Date in side panel
3. Values reflect immediately in Roadmap

#### Roadmap Best Practices

**For Epics:**
- Start Date: Beginning of first sprint that includes epic work
- Target Date: End of last sprint for epic completion
- Duration: Typically 4-8 weeks

**For Features:**
- Start Date: Sprint where feature development begins
- Target Date: End of sprint for feature completion
- Duration: Typically 1-2 sprints

**For Stories:**
- Start Date: Day work begins (set when moving to "In Progress")
- Target Date: Expected completion (usually within same sprint)
- Duration: Typically 1-5 days

### Visualizing Dependencies

While GitHub doesn't have native dependency arrows, you can:

1. **Color-code by Epic**: Group related items visually
2. **Use Swim Lanes**: Group by Feature or Epic
3. **Add Markers**: Use the iteration field to show sprint boundaries
4. **Stack Items**: Items blocking others should appear earlier in timeline

---

## 🔗 Managing Dependencies

Dependencies show which issues must be completed before others can start.

### Documenting Dependencies

The Project Wizard already includes dependencies in issue bodies. They appear as:

```markdown
## Dependencies
- **Requires**: #15 (Enabler: Payment Gateway Infrastructure)
- **Blocks**: #25 (Story: Order Confirmation)
```

### Tracking Dependencies

#### Method 1: Task Lists (Recommended)

Add a tasklist to the blocking issue:

```markdown
## Blocks
- [ ] #25 - Story: Order Confirmation
- [ ] #26 - Story: Email Notification

Once this is complete, these stories can begin.
```

GitHub will:
- Show completion percentage on the issue
- Display checkmarks when linked issues close
- Update automatically

#### Method 2: Issue References

In the issue body or comments:

```markdown
Blocks: #25, #26
Depends on: #15
```

**Pro Tip**: Use these keywords for automatic linking:
- `blocks #X` - This issue prevents #X from starting
- `depends on #X` - This issue requires #X to be done first
- `related to #X` - This issue is connected to #X

#### Method 3: Custom Labels

Create dependency-type labels:

- `blocked-by-external` - Waiting on external dependency
- `blocked-by-issue` - Waiting on another issue
- `blocking-others` - Other issues depend on this

Filter by these labels to identify bottlenecks.

### Dependency Queries

**Find all blocked issues:**
```
is:open label:blocked-by-issue
```

**Find blocking issues:**
```
is:open label:blocking-others
```

**Issues with unresolved dependencies:**
```
is:open "Depends on: #" NOT is:closed
```

### Visualizing Dependencies in Project

1. **Create a "Blocked" view**:
   - Filter: `label:blocked-by-issue`
   - Group by: Epic or Feature
   - Sort by: Priority

2. **Create a "Critical Path" view**:
   - Filter: `label:blocking-others OR priority:P0`
   - Sort by: Start Date
   - Show: Roadmap layout

3. **Use the Roadmap**:
   - Items that depend on others should start after their dependencies
   - Use Start Date to enforce sequencing
   - Color-code by dependency chain

---

## 📅 Sprint Planning

Use the Sprint (Iteration) field to organize work into time-boxed periods.

### Setting Up Sprints

1. **Go to Project Settings** (⋯ → Settings)
2. **Find "Sprint" field**
3. **Click "Edit"**
4. **Add iterations**:
   - **Sprint 1**: Nov 11 - Nov 24 (2 weeks)
   - **Sprint 2**: Nov 25 - Dec 8 (2 weeks)
   - **Sprint 3**: Dec 9 - Dec 22 (2 weeks)
   - Continue as needed...

5. **Configure**:
   - **Duration**: 2 weeks (standard)
   - **Start day**: Monday (recommended)
   - **Marks**: Show current sprint

### Sprint Planning Workflow

#### 1. **Sprint Backlog Grooming** (Before sprint starts)

Create a view called "Sprint Planning":
- **Filter**: `status:Todo priority:P0,P1`
- **Group by**: Priority
- **Sort by**: Story Points (ascending)

Actions:
- Review P0/P1 stories that are unassigned to sprints
- Estimate story points if not yet done
- Assign to upcoming sprint
- Verify dependencies are resolved

#### 2. **Sprint Commitment** (Sprint planning meeting)

- **Calculate team velocity**: Sum of story points completed in last sprint
- **Select stories**: Total points ≤ team velocity
- **Assign to sprint**: Set Sprint field to current iteration
- **Set Target Dates**: All items should have Target Date = Sprint end date

#### 3. **Daily Standups** (During sprint)

Create view "Current Sprint":
- **Filter**: `sprint:@current`
- **Group by**: Status
- **Sort by**: Assignee

Review:
- Items in "In Progress" - any blockers?
- Items still in "Todo" - can we start them?
- Items near Target Date - on track?

#### 4. **Sprint Review** (End of sprint)

Create view "Sprint X Complete":
- **Filter**: `sprint:"Sprint X" status:Done`
- **Show**: Sum of Story Points

Metrics:
- **Completed points** / **Committed points** = Sprint success rate
- **Average velocity** over last 3 sprints = Team capacity

### Sprint Views

**Template: Current Sprint Board**
```
Filter: sprint:@current
Group by: Status
Columns: Todo | In Progress | Done
Fields: Title, Assignee, Priority, Story Points, Target Date
```

**Template: Sprint Burndown**
```
Filter: sprint:@current
Chart type: Line
X-axis: Date
Y-axis: Remaining Story Points
```

---

## ✅ Best Practices

### 1. **Keep Status Updated**
- Move issues to "In Progress" when work starts
- Set Start Date when moving to "In Progress"
- Move to "Done" when complete (triggers automation)

### 2. **Use Priorities Consistently**
- **P0**: Must have for MVP launch
- **P1**: Important for user value
- **P2**: Nice to have, next phase
- **P3**: Future ideas, backlog

### 3. **Estimate Early**
- Add Story Points during backlog grooming
- Use Fibonacci sequence (1, 2, 3, 5, 8, 13)
- Re-estimate if scope changes

### 4. **Set Realistic Dates**
- Start Date: When you can actually begin
- Target Date: Based on estimates + dependencies
- Buffer: Add 20% for unknowns

### 5. **Document Dependencies**
- Use issue references (#123)
- Add to issue body
- Create tasklists for tracking

### 6. **Review Regularly**
- Daily: Check current sprint progress
- Weekly: Groom backlog, update priorities
- Sprint end: Calculate velocity, plan next sprint

### 7. **Automate Where Possible**
- Enable auto-add to project
- Auto-archive closed issues
- Use GitHub Actions for complex workflows

### 8. **Use Multiple Views**
- **Board**: For daily work (Status columns)
- **Roadmap**: For timeline planning
- **Table**: For bulk editing
- **Backlog**: Filtered by Priority, grouped by Epic

---

## 🔧 Troubleshooting

### Issues not appearing in Project
- Check if workflow "Auto-add" is enabled
- Manually add via issue → Projects → Select project

### Roadmap not showing items
- Verify Start Date and Target Date are set
- Check view filters aren't hiding items

### Dependencies not updating
- Use proper keywords: "blocks", "depends on"
- Ensure issues are in same repository or linked projects

### Sprint field not showing
- Check project settings → Fields → Sprint
- Add iterations if empty

---

## 📚 Additional Resources

- [GitHub Projects V2 Documentation](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
- [GitHub GraphQL API for Projects](https://docs.github.com/en/graphql/reference/objects#projectv2)
- [Project Automation Examples](https://github.com/github/awesome-actions#project-management)

---

## 🚀 Quick Start Checklist

After creating a project with the wizard:

- [ ] Enable "Auto-add to project" workflow
- [ ] Set up Sprint iterations (in project settings)
- [ ] Create views: Board, Roadmap, Backlog
- [ ] Set Start Date and Target Date for all items
- [ ] Assign stories to first sprint
- [ ] Review dependencies in issue bodies
- [ ] Configure automated workflows
- [ ] Add team members to project

**Your project is now ready for agile delivery!** 🎉
