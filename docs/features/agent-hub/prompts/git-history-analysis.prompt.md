---
description: 'Analyze Git repository history to extract development insights, commit patterns, contributor statistics, and codebase evolution trends.'
mode: 'agent'
tools: ['runCommands/terminalLastCommand', 'runCommands/terminalSelection']
---

# Git History Analysis

Analyze Git repository history to extract insights about development patterns, contributors, code evolution, and project health.

## Analysis Categories

### 1. Commit Statistics
- **Overall Activity**: Total commits, date range, commit frequency
- **Contributors**: Active contributors, commit distribution
- **Commit Patterns**: Hourly/daily/weekly trends
- **File Changes**: Most modified files, churn rate

### 2. Code Evolution
- **Lines of Code**: Addition/deletion trends over time
- **File Lifecycle**: Created, modified, deleted files
- **Refactoring Activity**: Rename and move operations
- **Language Distribution**: Code distribution by file type

### 3. Contributor Insights
- **Top Contributors**: By commits, lines changed, files touched
- **Contribution Timeline**: When contributors are most active
- **Specialization**: Which files/modules each contributor works on
- **Collaboration Patterns**: Co-authorship, review patterns

### 4. Repository Health
- **Commit Message Quality**: Conventional commits compliance
- **Branch Strategy**: Branch creation/merge patterns
- **Release Cadence**: Tag frequency, version increments
- **Merge Conflicts**: Frequency and affected files

## Git Commands for Analysis

### Basic Statistics
```bash
# Total commits
git rev-list --count HEAD

# Commits by author
git shortlog -sn --all --no-merges

# Commit activity by date
git log --all --pretty=format:'%ad' --date=short | sort | uniq -c

# Files changed most frequently
git log --all --pretty=format: --name-only | sort | uniq -c | sort -rg | head -20
```

### Contributor Analysis
```bash
# Lines added/removed by author
git log --all --numstat --pretty="%ae" | awk '
  NF==3 {plus+=$1; minus+=$2}
  NF==1 {printf "%s: +%d -%d\n", $0, plus, minus; plus=0; minus=0}
'

# First and last commit by contributor
git log --all --format='%an|%ad' --date=short | 
  awk -F'|' '{
    if (!first[$1]) first[$1]=$2
    last[$1]=$2
  } END {
    for (a in first) printf "%s: %s to %s\n", a, first[a], last[a]
  }'

# Files touched by contributor
git log --all --author="John Doe" --pretty=format: --name-only | 
  sort | uniq -c | sort -rg
```

### Code Evolution
```bash
# Language distribution (by file extension)
git ls-files | awk -F. '{print $NF}' | sort | uniq -c | sort -rg

# Code churn (files with most add/delete activity)
git log --all --numstat --pretty=format:'' | awk '
  NF==3 {files[$3]+=$1+$2}
  END {for (f in files) printf "%d\t%s\n", files[f], f}
' | sort -rg | head -20

# Commits by day of week
git log --all --pretty=format:'%ad' --date=format:'%A' | sort | uniq -c | sort -rg

# Commits by hour of day
git log --all --pretty=format:'%ad' --date=format:'%H' | sort | uniq -c | sort -rg
```

### Repository Health
```bash
# Average commit message length
git log --all --pretty=format:'%s' | awk '{print length}' | awk '
  {sum+=$1; count++}
  END {printf "Avg: %.1f chars\n", sum/count}
'

# Commits without issue reference
git log --all --pretty=format:'%s' --no-merges | grep -v '#[0-9]' | wc -l

# Merge commit ratio
git rev-list --count --merges HEAD
git rev-list --count --no-merges HEAD

# Branches created over time
git for-each-ref --format='%(refname:short) %(creatordate:short)' refs/heads/ | 
  awk '{print $2}' | sort | uniq -c
```

## Analysis Workflow

### Step 1: Repository Overview
```bash
# Clone depth (if shallow)
git rev-parse --is-shallow-repository

# Repository age
FIRST_COMMIT=$(git log --reverse --pretty=format:'%ad' --date=short | head -1)
echo "Repository created: $FIRST_COMMIT"

# Current branch and total branches
git branch -a | wc -l

# Tags (releases)
git tag | wc -l
```

### Step 2: Contributor Analysis
```bash
# Active contributors (last 90 days)
git shortlog -sn --all --no-merges --since="90 days ago"

# Contributor diversity (unique authors)
git shortlog -sn --all --no-merges | wc -l

# Email domain distribution
git log --all --pretty=format:'%ae' | awk -F@ '{print $2}' | 
  sort | uniq -c | sort -rg
```

### Step 3: Code Quality Metrics
```bash
# Average files per commit
git log --all --numstat --pretty=format:'' | awk 'NF==3 {files++; commits++}
  NF==0 {if (commits) {printf "%.1f\n", files/commits; files=0; commits=0}}'

# Large commits (>500 lines changed)
git log --all --numstat --pretty=format:'%h %s' | awk '
  NF==3 {add+=$1; del+=$2}
  NF>3 {
    if (add+del > 500) printf "%s (+%d -%d)\n", $0, add, del
    add=0; del=0
  }'

# Binary file commits
git log --all --numstat --pretty=format:'%h %s' | grep -E '\-\s+\-' | head -20
```

### Step 4: Time-Based Analysis
```bash
# Commit velocity (commits per month)
git log --all --pretty=format:'%ad' --date=format:'%Y-%m' | 
  sort | uniq -c | awk '{printf "%s: %d commits\n", $2, $1}'

# Busiest development days
git log --all --pretty=format:'%ad' --date=short | sort | uniq -c | sort -rg | head -10

# Weekend vs weekday commits
git log --all --pretty=format:'%ad' --date=format:'%u' | awk '
  $1<=5 {weekday++}
  $1>5 {weekend++}
  END {printf "Weekday: %d, Weekend: %d (%.1f%%)\n", weekday, weekend, weekend*100/(weekday+weekend)}
'
```

## Insights to Extract

### Development Patterns
- **Peak Hours**: When are commits most frequent? (Time zones, work hours)
- **Commit Size**: Are commits small and focused or large and infrequent?
- **Branching Strategy**: Feature branches, hotfixes, release branches?
- **Release Frequency**: Regular releases or ad-hoc?

### Team Dynamics
- **Bus Factor**: How many contributors have >50% of commits?
- **Onboarding**: Are new contributors joining regularly?
- **Collaboration**: Do contributors work in silos or across modules?
- **Turnover**: Are contributors leaving? (No recent commits)

### Code Health
- **Churn Hotspots**: Files changing frequently (potential design issues)
- **Orphaned Code**: Files with no recent changes (technical debt?)
- **Test Coverage Trend**: Are test files growing with code?
- **Documentation**: Are docs updated with features?

### Quality Indicators
- **Commit Message Quality**: Descriptive messages, issue references?
- **Commit Atomicity**: One logical change per commit?
- **Revert Frequency**: How often are commits reverted? (Quality issues)
- **Conflict Rate**: Frequent merge conflicts? (Communication gaps)

## Visualization Tools

### CLI Tools
- **git-quick-stats**: Pre-built Git analytics
- **gource**: Visual repository history
- **gitstats**: HTML report generator
- **git-of-theseus**: Language evolution over time

### Web Tools
- **GitHub Insights**: Contributor graph, commit activity
- **GitLab Analytics**: CI/CD metrics, code review stats
- **CodeClimate**: Code quality trends
- **Codecov**: Test coverage evolution

## Reporting Template

```markdown
# Git Repository Analysis

**Repository**: [name]
**Analysis Date**: [date]
**Commit Range**: [first] to [last] ([total] commits)

## Overview
- **Age**: X years, Y months
- **Contributors**: N unique authors
- **Branches**: M active branches
- **Releases**: P tags

## Top Contributors (Last 90 Days)
1. Author 1: X commits (+Y -Z lines)
2. Author 2: X commits (+Y -Z lines)
...

## Most Active Files
1. src/main.ts: X commits (Y KB churn)
2. package.json: X commits (Y KB churn)
...

## Commit Patterns
- **Peak Hours**: [hours] (timezone: [tz])
- **Busiest Day**: [day] ([N] commits)
- **Weekend Commits**: [%]

## Code Evolution
- **Total LOC**: [current] ([+/-] from 6 months ago)
- **Language Mix**: [lang1] [%], [lang2] [%]
- **Churn Rate**: [lines/week]

## Health Indicators
- **Avg Commit Message**: [chars]
- **Issue References**: [%] of commits
- **Merge Conflicts**: [N] in last 90 days
- **Revert Rate**: [%]

## Recommendations
- [Insight 1 → Recommendation]
- [Insight 2 → Recommendation]
...
```

Focus on actionable insights that improve team productivity, code quality, and project health.

---

**Source**: [Git History Analysis - awesome-copilot](https://github.com/github/awesome-copilot/blob/main/prompts/git-history-analysis.prompt.md)
