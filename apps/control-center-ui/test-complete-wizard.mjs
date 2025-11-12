/**
 * Test complete project creation with all custom fields
 */
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const API_BASE = 'http://localhost:3000';

async function testCompleteProjectCreation() {
  console.log('🚀 Testing Complete Project Creation with Wizard\n');

  // Step 1: Generate Plan
  console.log('1️⃣ Generating project plan with AI...');
  
  const generateResponse = await fetch(`${API_BASE}/api/projects/generate-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectName: 'E-Commerce Smart Checkout',
      description: 'Smart checkout system with one-click purchasing, multiple payment methods, and seamless cart management',
      timeline: '6 weeks',
      constraints: 'Must integrate with legacy inventory system',
      mustHave: [
        'Payment processing (Stripe, PayPal)',
        'Cart management',
        'Order confirmation',
        'Guest checkout'
      ],
      niceToHave: [
        'Saved payment methods',
        'One-click reorder',
        'Gift wrapping options'
      ]
    })
  });

  const planResult = await generateResponse.json();
  
  if (!planResult.success) {
    console.error('❌ Failed to generate plan:', planResult.error);
    return;
  }

  console.log('✅ Plan generated:', {
    epics: planResult.data.plan.epics?.length || 0,
    features: planResult.data.plan.features?.length || 0,
    stories: planResult.data.plan.stories?.length || 0,
    enablers: planResult.data.plan.enablers?.length || 0,
    tests: planResult.data.plan.tests?.length || 0,
  });
  console.log('   Log ID:', planResult.data.log_id);
  console.log('');

  // Step 2: Deploy to GitHub
  console.log('2️⃣ Deploying to GitHub with Project Board...');
  
  const deployResponse = await fetch(`${API_BASE}/api/projects/deploy-github`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: planResult.data.plan,
      repositoryOwner: 'AlbertoLacambra',
      repositoryName: 'ecommerce-smart-checkout',
      createProjectBoard: true,
      logId: planResult.data.log_id
    })
  });

  const deployResult = await deployResponse.json();
  
  if (!deployResult.success) {
    console.error('❌ Failed to deploy:', deployResult.error);
    console.error('Details:', deployResult.details);
    return;
  }

  console.log('✅ Deployment successful!');
  console.log('');
  console.log('📊 Results:');
  console.log(`   Repository: ${deployResult.data.repository}`);
  console.log(`   Issues created: ${deployResult.data.issues_created}`);
  console.log('');
  
  if (deployResult.data.project_board) {
    console.log('📋 Project Board:');
    console.log(`   ID: ${deployResult.data.project_board.id}`);
    console.log(`   Number: ${deployResult.data.project_board.number}`);
    console.log(`   URL: ${deployResult.data.project_board.url}`);
    console.log('');
    
    // Verify custom fields were created
    console.log('3️⃣ Verifying custom fields...');
    await verifyCustomFields(deployResult.data.project_board.id);
  } else if (deployResult.data.project_board_error) {
    console.error('⚠️  Project Board Error:', deployResult.data.project_board_error);
  }
}

async function verifyCustomFields(projectId) {
  const { graphql } = await import('@octokit/graphql');
  const token = process.env.GITHUB_TOKEN;
  
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const query = `
    query($projectId: ID!) {
      node(id: $projectId) {
        ... on ProjectV2 {
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

  const result = await graphqlWithAuth(query, { projectId });
  const fields = result.node.fields.nodes.filter(f => f.id); // Remove empty nodes

  console.log('   Custom Fields Found:');
  fields.forEach(field => {
    if (field.dataType === 'SINGLE_SELECT' && field.options) {
      console.log(`   ✅ ${field.name} (${field.dataType})`);
      field.options.forEach(opt => {
        console.log(`      - ${opt.name}`);
      });
    } else if (field.dataType === 'ITERATION' && field.configuration) {
      console.log(`   ✅ ${field.name} (${field.dataType})`);
      if (field.configuration.iterations.length > 0) {
        field.configuration.iterations.forEach(iter => {
          console.log(`      - ${iter.title}: ${iter.startDate}`);
        });
      } else {
        console.log(`      (No iterations configured yet)`);
      }
    } else {
      console.log(`   ✅ ${field.name} (${field.dataType})`);
    }
  });
  
  console.log('');
  console.log('🎉 Project creation complete!');
  console.log('');
  console.log('📝 Next Steps:');
  console.log(`   1. Open project: ${result.node.title}`);
  console.log('   2. Configure Sprint iterations (use scripts/setup-sprints.sh)');
  console.log('   3. Enable automated workflows');
  console.log('   4. Create Roadmap view');
  console.log('   5. Assign dates and sprints to issues');
}

testCompleteProjectCreation().catch(console.error);
