#!/bin/bash

# Script para configurar sprints/iteraciones en un GitHub Project V2
# Usage: ./setup-sprints.sh PROJECT_ID

PROJECT_ID=${1:-""}

if [ -z "$PROJECT_ID" ]; then
  echo "❌ Error: PROJECT_ID is required"
  echo "Usage: ./setup-sprints.sh PROJECT_ID"
  echo ""
  echo "Example: ./setup-sprints.sh PVT_kwHOA9h7sc4BHwNm"
  echo ""
  echo "Find your PROJECT_ID:"
  echo "1. Go to your project on GitHub"
  echo "2. The URL will be: https://github.com/users/USERNAME/projects/NUMBER"
  echo "3. Run: gh api graphql -f query='{ viewer { projectV2(number: NUMBER) { id } } }'"
  exit 1
fi

echo "🚀 Setting up Sprints for Project: $PROJECT_ID"
echo ""

# Get the Sprint field ID
echo "1️⃣ Getting Sprint field ID..."
SPRINT_FIELD_QUERY='
query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      field(name: "Sprint") {
        ... on ProjectV2IterationField {
          id
          name
        }
      }
    }
  }
}
'

FIELD_RESULT=$(gh api graphql -f query="$SPRINT_FIELD_QUERY" -F projectId="$PROJECT_ID")
SPRINT_FIELD_ID=$(echo "$FIELD_RESULT" | jq -r '.data.node.field.id')

if [ "$SPRINT_FIELD_ID" == "null" ]; then
  echo "❌ Sprint field not found. Creating it first..."
  
  CREATE_SPRINT_FIELD='
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
  '
  
  FIELD_CREATE_RESULT=$(gh api graphql -f query="$CREATE_SPRINT_FIELD" -F projectId="$PROJECT_ID")
  SPRINT_FIELD_ID=$(echo "$FIELD_CREATE_RESULT" | jq -r '.data.createProjectV2Field.projectV2Field.id')
fi

echo "✅ Sprint Field ID: $SPRINT_FIELD_ID"
echo ""

# Calculate sprint dates (6 sprints, 2 weeks each, starting next Monday)
echo "2️⃣ Creating sprint iterations..."

# Get next Monday
NEXT_MONDAY=$(date -d "next Monday" +%Y-%m-%d 2>/dev/null || date -v+Mon +%Y-%m-%d 2>/dev/null || echo "2025-11-11")

# Function to add days to date
add_days() {
  local base_date=$1
  local days=$2
  date -d "$base_date + $days days" +%Y-%m-%d 2>/dev/null || \
  date -j -v+${days}d -f "%Y-%m-%d" "$base_date" +%Y-%m-%d 2>/dev/null || \
  echo "$base_date"
}

# Create 6 sprints
SPRINT_START=$NEXT_MONDAY

for i in {1..6}; do
  SPRINT_END=$(add_days "$SPRINT_START" 13)  # 14 days (2 weeks) - 1
  
  echo "   Creating Sprint $i: $SPRINT_START to $SPRINT_END"
  
  ADD_ITERATION='
  mutation($fieldId: ID!, $projectId: ID!, $title: String!, $startDate: Date!, $duration: Int!) {
    updateProjectV2IterationField(input: {
      fieldId: $fieldId
      projectId: $projectId
      iterations: {
        title: $title
        startDate: $startDate
        duration: $duration
      }
    }) {
      projectV2IterationField {
        id
        configuration {
          iterations {
            id
            title
            startDate
            duration
          }
        }
      }
    }
  }
  '
  
  gh api graphql \
    -f query="$ADD_ITERATION" \
    -F fieldId="$SPRINT_FIELD_ID" \
    -F projectId="$PROJECT_ID" \
    -F title="Sprint $i" \
    -F startDate="$SPRINT_START" \
    -F duration=14 \
    > /dev/null 2>&1
  
  # Next sprint starts 14 days later
  SPRINT_START=$(add_days "$SPRINT_START" 14)
done

echo ""
echo "✅ 6 sprints created successfully!"
echo ""

# Show created sprints
echo "📅 Sprint Schedule:"
gh api graphql -f query="
query(\$projectId: ID!) {
  node(id: \$projectId) {
    ... on ProjectV2 {
      field(name: \"Sprint\") {
        ... on ProjectV2IterationField {
          configuration {
            iterations {
              id
              title
              startDate
              duration
            }
          }
        }
      }
    }
  }
}" -F projectId="$PROJECT_ID" | jq -r '.data.node.field.configuration.iterations[] | "   \(.title): \(.startDate) (\(.duration) days)"'

echo ""
echo "🎉 Done! Your sprints are ready to use."
echo ""
echo "Next steps:"
echo "1. Go to your project: https://github.com/projects (find your project)"
echo "2. Assign issues to sprints using the 'Sprint' field"
echo "3. Create a 'Current Sprint' view filtered by sprint:@current"
