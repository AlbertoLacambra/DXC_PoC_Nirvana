# 📋 E-Commerce Smart Checkout - Project Board Configuration Guide

## Overview

This guide provides step-by-step instructions to configure your GitHub Project Board for optimal agile workflow management.

**Project Board**: [E-Commerce Smart Checkout](https://github.com/AlbertoLacambra/ecommerce-smart-checkout/projects/8)

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

**Project Timeline**: 6 weeks  
**Recommended Sprints**: 3 sprints (2 weeks each)

### Step 1️⃣: Configure Sprint Iterations

1. Navigate to your [Project Board](https://github.com/AlbertoLacambra/ecommerce-smart-checkout/projects/8)
2. Click **⚙️ Settings** (top-right)
3. Find **Sprint** field in the fields list
4. Click **Edit** → **Configure iterations**
5. Set up **3 iterations**:
   - **Duration**: 2 weeks per sprint
   - **Start date**: Choose your sprint 1 start date
   - **Naming**: Sprint 1, Sprint 2, Sprint 3

**Example**:
```
Sprint 1: Jan 15 - Jan 28
Sprint 2: Jan 29 - Feb 11
Sprint 3: Feb 12 - Feb 25
```

---

## 🤖 Step 2️⃣: Enable Automated Workflows

Automate repetitive tasks to keep your board up-to-date.

### Navigation
1. Go to [Project Board](https://github.com/AlbertoLacambra/ecommerce-smart-checkout/projects/8)
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

```
Example:
Sprint 1: Completed 21 points
Sprint 2: Completed 25 points
Sprint 3: Completed 23 points
→ Average Velocity: 23 points/sprint
```

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
| **parallel** | Stories can run simultaneously | Story A \|\| Story B → Can work together |

### How to Add Dependencies

#### Method 1: Using Issue Comments (Automated)
Our system automatically creates dependency comments like:
```
**Dependency**: blocks #42
**Dependency**: requires #15
```

#### Method 2: Using Tasklists (GitHub Native)
```markdown
## Dependencies
- [ ] Blocked by #15 (Database schema)
- [x] Requires #8 (API client)
```

#### Method 3: Manual Cross-References
Simply mention related issues:
```
This story depends on #12 and #13 being completed first.
```

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
5. Add as label: `size:M`, `size:L`, etc.

---

## 🚀 Quick Start Checklist

Use this checklist to configure your board in **under 30 minutes**:

- [ ] **Configure 3 Sprint iterations** (2 weeks each)
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

**Last Updated**: 2025-11-11  
**Auto-generated** by DXC Nirvana Control Center
