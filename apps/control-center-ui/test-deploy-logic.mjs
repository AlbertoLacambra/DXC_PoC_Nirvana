/**
 * Direct test of the deploy-github API endpoint logic
 */
import { graphql } from '@octokit/graphql';
import dotenv from 'dotenv';
import { Octokit } from '@octokit/rest';

dotenv.config({ path: '.env.local' });

async function testDeployLogic() {
  const githubToken = process.env.GITHUB_TOKEN;
  const repositoryOwner = 'AlbertoLacambra';
  const repositoryName = 'ecommerce-smart-checkout';
  const createProjectBoard = true;

  console.log('🧪 Testing deploy-github API logic...\n');
  console.log(`Token: ${githubToken ? githubToken.substring(0, 10) + '...' : 'NOT FOUND'}`);
  console.log(`Repository: ${repositoryOwner}/${repositoryName}\n`);

  if (!githubToken) {
    console.error('❌ GITHUB_TOKEN not found');
    process.exit(1);
  }

  const octokit = new Octokit({ auth: githubToken });

  try {
    // Step 1: Verify repository access
    console.log('1️⃣ Verifying repository access...');
    await octokit.repos.get({
      owner: repositoryOwner,
      repo: repositoryName,
    });
    console.log('✅ Repository accessible\n');

    // Step 2: Create project board with GraphQL
    if (createProjectBoard) {
      console.log('2️⃣ Creating GitHub Project Board V2 with GraphQL...');
      
      const graphqlWithAuth = graphql.defaults({
        headers: {
          authorization: `Bearer ${githubToken}`,
        },
      });

      // Get repository owner ID
      console.log('   Getting owner ID...');
      const ownerQuery = `
        query($owner: String!) {
          repositoryOwner(login: $owner) {
            id
            login
          }
        }
      `;
      
      const ownerResult = await graphqlWithAuth(ownerQuery, {
        owner: repositoryOwner,
      });
      
      console.log(`   ✅ Owner: ${ownerResult.repositoryOwner.login} (${ownerResult.repositoryOwner.id})`);

      // Create project
      console.log('   Creating project...');
      const createProjectMutation = `
        mutation($ownerId: ID!, $title: String!) {
          createProjectV2(input: {
            ownerId: $ownerId
            title: $title
          }) {
            projectV2 {
              id
              number
              url
            }
          }
        }
      `;
      
      const projectResult = await graphqlWithAuth(createProjectMutation, {
        ownerId: ownerResult.repositoryOwner.id,
        title: 'E-Commerce Smart Checkout - API Test'
      });
      
      const project = projectResult.createProjectV2.projectV2;
      console.log(`   ✅ Project created: #${project.number}`);
      console.log(`   URL: ${project.url}`);

      // Link project to repository
      console.log('   Linking project to repository...');
      const repoQuery = `
        query($owner: String!, $name: String!) {
          repository(owner: $owner, name: $name) {
            id
          }
        }
      `;

      const repoResult = await graphqlWithAuth(repoQuery, {
        owner: repositoryOwner,
        name: repositoryName,
      });

      const linkProjectMutation = `
        mutation($projectId: ID!, $repositoryId: ID!) {
          linkProjectV2ToRepository(input: {
            projectId: $projectId
            repositoryId: $repositoryId
          }) {
            repository {
              projectsV2(first: 1) {
                nodes {
                  id
                  title
                }
              }
            }
          }
        }
      `;

      await graphqlWithAuth(linkProjectMutation, {
        projectId: project.id,
        repositoryId: repoResult.repository.id,
      });
      
      console.log('   ✅ Project linked to repository\n');

      console.log('✅ ALL STEPS COMPLETED SUCCESSFULLY!\n');
      console.log('📋 Project Details:');
      console.log(`   ID: ${project.id}`);
      console.log(`   Number: ${project.number}`);
      console.log(`   URL: ${project.url}`);
      console.log('\n⚠️  Please delete the test project manually from GitHub.');
    }

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.errors) {
      console.error('GraphQL Errors:', JSON.stringify(error.errors, null, 2));
    }
    if (error.status) {
      console.error('HTTP Status:', error.status);
    }
    if (error.request) {
      console.error('Request:', {
        method: error.request.method,
        url: error.request.url,
        headers: error.request.headers,
      });
    }
    process.exit(1);
  }
}

testDeployLogic();
