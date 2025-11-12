/**
 * Test script to verify GraphQL Projects V2 API access
 */
import { graphql } from '@octokit/graphql';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function testGraphQL() {
  const token = process.env.GITHUB_TOKEN;
  
  console.log('Testing GitHub GraphQL API...');
  console.log('Token:', token ? `${token.substring(0, 10)}...` : 'NOT FOUND');
  
  if (!token) {
    console.error('❌ GITHUB_TOKEN not found in .env.local');
    process.exit(1);
  }

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  try {
    // Test 1: Get viewer info
    console.log('\n1️⃣ Testing viewer query...');
    const viewer = await graphqlWithAuth(`
      query {
        viewer {
          login
          id
        }
      }
    `);
    console.log('✅ Viewer:', viewer.viewer);

    // Test 2: Get owner info
    console.log('\n2️⃣ Testing repositoryOwner query...');
    const owner = await graphqlWithAuth(`
      query($owner: String!) {
        repositoryOwner(login: $owner) {
          id
          login
        }
      }
    `, {
      owner: 'AlbertoLacambra'
    });
    console.log('✅ Owner:', owner.repositoryOwner);

    // Test 3: Create a test project
    console.log('\n3️⃣ Testing createProjectV2 mutation...');
    const project = await graphqlWithAuth(`
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
    `, {
      ownerId: owner.repositoryOwner.id,
      title: 'GraphQL API Test Project'
    });
    console.log('✅ Project created:', project.createProjectV2.projectV2);

    // Test 4: Link project to repository
    console.log('\n4️⃣ Testing linkProjectV2ToRepository mutation...');
    const repoQuery = await graphqlWithAuth(`
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `, {
      owner: 'AlbertoLacambra',
      name: 'ecommerce-smart-checkout'
    });
    console.log('✅ Repository ID:', repoQuery.repository.id);

    const linkedProject = await graphqlWithAuth(`
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
    `, {
      projectId: project.createProjectV2.projectV2.id,
      repositoryId: repoQuery.repository.id
    });
    console.log('✅ Project linked to repository');

    console.log('\n✅ ALL TESTS PASSED!');
    console.log('\n📋 Test Project Details:');
    console.log(`   ID: ${project.createProjectV2.projectV2.id}`);
    console.log(`   Number: ${project.createProjectV2.projectV2.number}`);
    console.log(`   URL: ${project.createProjectV2.projectV2.url}`);
    console.log('\n⚠️  Please delete the test project manually from GitHub.');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    if (error.errors) {
      console.error('GraphQL Errors:', JSON.stringify(error.errors, null, 2));
    }
    if (error.request) {
      console.error('Request:', error.request);
    }
    process.exit(1);
  }
}

testGraphQL();
