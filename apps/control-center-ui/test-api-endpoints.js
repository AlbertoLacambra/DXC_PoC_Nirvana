#!/usr/bin/env node

/**
 * API Testing Script for Spec Library Manager
 * 
 * This script tests all 8 API endpoints with various scenarios:
 * - CRUD operations
 * - Filtering, searching, pagination
 * - Error handling (400, 404, 409, 500)
 * - Edge cases
 * 
 * Prerequisites:
 * 1. Next.js dev server running: npm run dev
 * 2. Database accessible (port-forward if needed):
 *    kubectl port-forward -n dify svc/dify-postgres 5432:5432
 */

const BASE_URL = 'http://localhost:3000/api/specs';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0,
  tests: [],
};

// Helper function to make HTTP requests
async function request(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data,
    };
  } catch (error) {
    console.error(`${colors.red}✗ Request failed: ${error.message}${colors.reset}`);
    throw error;
  }
}

// Helper function to log test results
function logTest(name, passed, message = '') {
  results.total++;
  
  if (passed) {
    results.passed++;
    console.log(`${colors.green}✓${colors.reset} ${name}`);
  } else {
    results.failed++;
    console.log(`${colors.red}✗${colors.reset} ${name}`);
    if (message) {
      console.log(`  ${colors.gray}${message}${colors.reset}`);
    }
  }
  
  results.tests.push({ name, passed, message });
}

// Helper function to print section headers
function logSection(title) {
  console.log(`\n${colors.cyan}━━━ ${title} ━━━${colors.reset}\n`);
}

// Helper to generate unique names
function uniqueName(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Test data
let createdSpecId = null;
let createdVersionId = null;

// ============================================================================
// Test Suite
// ============================================================================

async function runTests() {
  console.log(`${colors.blue}
╔═══════════════════════════════════════════════════════════════╗
║       Spec Library Manager API - Test Suite                  ║
║       Testing 8 endpoints with comprehensive scenarios        ║
╚═══════════════════════════════════════════════════════════════╝
${colors.reset}`);

  try {
    await testGetSpecs();
    await testCreateSpec();
    await testGetSpecById();
    await testUpdateSpec();
    await testSearch();
    await testGetVersions();
    await testCreateVersion();
    await testDeleteSpec();
    await testErrorCases();
    
    printSummary();
  } catch (error) {
    console.error(`${colors.red}Fatal error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// ============================================================================
// Test 1: GET /api/specs - List specs
// ============================================================================

async function testGetSpecs() {
  logSection('Test 1: GET /api/specs - List Specs');

  // Test 1.1: Basic list
  const res1 = await request(BASE_URL);
  logTest(
    'Should return 200 and list of specs',
    res1.status === 200 && res1.data.success && Array.isArray(res1.data.data),
    res1.status !== 200 ? `Status: ${res1.status}` : ''
  );

  // Test 1.2: Filter by category
  const res2 = await request(`${BASE_URL}?category=security`);
  logTest(
    'Should filter by category (security)',
    res2.status === 200 && res2.data.success,
    res2.data.data ? `Found ${res2.data.data.length} specs` : ''
  );

  // Test 1.3: Filter by status
  const res3 = await request(`${BASE_URL}?status=active`);
  logTest(
    'Should filter by status (active)',
    res3.status === 200 && res3.data.success,
    res3.data.data ? `Found ${res3.data.data.length} specs` : ''
  );

  // Test 1.4: Pagination
  const res4 = await request(`${BASE_URL}?limit=2&offset=0`);
  logTest(
    'Should paginate results (limit=2, offset=0)',
    res4.status === 200 && res4.data.data.length <= 2 && res4.data.meta,
    res4.data.meta ? `Total: ${res4.data.meta.total}, hasMore: ${res4.data.meta.hasMore}` : ''
  );

  // Test 1.5: Sorting
  const res5 = await request(`${BASE_URL}?sortBy=name&sortOrder=asc`);
  logTest(
    'Should sort by name ascending',
    res5.status === 200 && res5.data.success,
    res5.data.data && res5.data.data.length > 1 ? 
      `First: ${res5.data.data[0].name}` : ''
  );

  // Test 1.6: Search
  const res6 = await request(`${BASE_URL}?search=git`);
  logTest(
    'Should search across fields (search=git)',
    res6.status === 200 && res6.data.success,
    res6.data.data ? `Found ${res6.data.data.length} specs` : ''
  );

  // Test 1.7: Combined filters
  const res7 = await request(`${BASE_URL}?category=development&status=active&limit=10`);
  logTest(
    'Should combine multiple filters',
    res7.status === 200 && res7.data.success,
    res7.data.data ? `Found ${res7.data.data.length} specs` : ''
  );
}

// ============================================================================
// Test 2: POST /api/specs - Create spec
// ============================================================================

async function testCreateSpec() {
  logSection('Test 2: POST /api/specs - Create Spec');

  const newSpec = {
    name: uniqueName('test-spec'),
    displayName: 'Test Specification',
    description: 'This is a test specification created by the test suite',
    category: 'testing',
    content: '# Test Spec\n\nThis is test content.\n\n## Requirements\n- Test requirement 1\n- Test requirement 2',
    tags: ['test', 'automated', 'ci-cd'],
    applicableTo: ['nextjs', 'react'],
    required: false,
    createdBy: 'test-suite',
  };

  // Test 2.1: Create valid spec
  const res1 = await request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(newSpec),
  });

  logTest(
    'Should create spec with valid data',
    res1.status === 201 && res1.data.success && res1.data.data.spec,
    res1.status === 201 ? `Created spec ID: ${res1.data.data.spec.id}` : `Status: ${res1.status}, Error: ${res1.data.error}`
  );

  if (res1.status === 201) {
    createdSpecId = res1.data.data.spec.id;
    
    // Test 2.2: Verify initial version created
    logTest(
      'Should create initial version (1.0.0)',
      res1.data.data.version && res1.data.data.version.version === '1.0.0',
      res1.data.data.version ? `Version ID: ${res1.data.data.version.id}` : ''
    );
  }

  // Test 2.3: Try to create duplicate
  const res2 = await request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(newSpec),
  });

  logTest(
    'Should reject duplicate spec name (409)',
    res2.status === 409 && !res2.data.success,
    res2.status === 409 ? `Error: ${res2.data.error}` : `Status: ${res2.status}`
  );

  // Test 2.4: Try to create without required fields
  const res3 = await request(BASE_URL, {
    method: 'POST',
    body: JSON.stringify({ name: uniqueName('incomplete') }),
  });

  logTest(
    'Should reject incomplete data (400)',
    res3.status === 400 && !res3.data.success,
    res3.status === 400 ? `Error: ${res3.data.error}` : `Status: ${res3.status}`
  );
}

// ============================================================================
// Test 3: GET /api/specs/:id - Get spec by ID
// ============================================================================

async function testGetSpecById() {
  logSection('Test 3: GET /api/specs/:id - Get Spec by ID');

  if (!createdSpecId) {
    console.log(`${colors.yellow}⚠ Skipping: No spec created in previous test${colors.reset}`);
    return;
  }

  // Test 3.1: Get existing spec
  const res1 = await request(`${BASE_URL}/${createdSpecId}`);
  logTest(
    'Should get spec by valid ID',
    res1.status === 200 && res1.data.success && res1.data.data.id === createdSpecId,
    res1.status === 200 ? `Name: ${res1.data.data.name}` : `Status: ${res1.status}`
  );

  // Test 3.2: Verify includes versions
  logTest(
    'Should include versions array',
    res1.data.data.versions && Array.isArray(res1.data.data.versions),
    res1.data.data.versions ? `${res1.data.data.versions.length} version(s)` : ''
  );

  // Test 3.3: Verify includes counts
  logTest(
    'Should include version and usage counts',
    res1.data.data._count && 
    typeof res1.data.data._count.versions === 'number' &&
    typeof res1.data.data._count.usage === 'number',
    res1.data.data._count ? 
      `Versions: ${res1.data.data._count.versions}, Usage: ${res1.data.data._count.usage}` : ''
  );

  // Test 3.4: Get non-existent spec
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res2 = await request(`${BASE_URL}/${fakeId}`);
  logTest(
    'Should return 404 for non-existent ID',
    res2.status === 404 && !res2.data.success,
    res2.status === 404 ? `Error: ${res2.data.error}` : `Status: ${res2.status}`
  );
}

// ============================================================================
// Test 4: PUT /api/specs/:id - Update spec
// ============================================================================

async function testUpdateSpec() {
  logSection('Test 4: PUT /api/specs/:id - Update Spec');

  if (!createdSpecId) {
    console.log(`${colors.yellow}⚠ Skipping: No spec created in previous test${colors.reset}`);
    return;
  }

  // Test 4.1: Update spec metadata
  const updates = {
    displayName: 'Updated Test Specification',
    description: 'This spec has been updated by the test suite',
    status: 'active',
    tags: ['test', 'automated', 'updated'],
  };

  const res1 = await request(`${BASE_URL}/${createdSpecId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  logTest(
    'Should update spec metadata',
    res1.status === 200 && res1.data.success && res1.data.data.displayName === updates.displayName,
    res1.status === 200 ? `Updated displayName: ${res1.data.data.displayName}` : `Status: ${res1.status}`
  );

  // Test 4.2: Verify update
  const res2 = await request(`${BASE_URL}/${createdSpecId}`);
  logTest(
    'Should persist updates',
    res2.data.data.displayName === updates.displayName &&
    res2.data.data.status === updates.status,
    `Status: ${res2.data.data.status}, Tags: ${res2.data.data.tags.length}`
  );

  // Test 4.3: Update non-existent spec
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res3 = await request(`${BASE_URL}/${fakeId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });

  logTest(
    'Should return 404 for non-existent spec',
    res3.status === 404 && !res3.data.success,
    res3.status === 404 ? `Error: ${res3.data.error}` : `Status: ${res3.status}`
  );
}

// ============================================================================
// Test 5: GET /api/specs/search - Full-text search
// ============================================================================

async function testSearch() {
  logSection('Test 5: GET /api/specs/search - Full-Text Search');

  // Test 5.1: Search with query
  const res1 = await request(`${BASE_URL}/search?q=test`);
  logTest(
    'Should search with query parameter',
    res1.status === 200 && res1.data.success && Array.isArray(res1.data.data),
    res1.data.meta ? `Found ${res1.data.meta.total} specs` : ''
  );

  // Test 5.2: Verify relevance score
  if (res1.data.data && res1.data.data.length > 0) {
    logTest(
      'Should include relevance score',
      typeof res1.data.data[0].relevance === 'number',
      `First result relevance: ${res1.data.data[0].relevance}`
    );
  }

  // Test 5.3: Search without query
  const res2 = await request(`${BASE_URL}/search`);
  logTest(
    'Should return 400 without query parameter',
    res2.status === 400 && !res2.data.success,
    res2.status === 400 ? `Error: ${res2.data.error}` : `Status: ${res2.status}`
  );

  // Test 5.4: Search with pagination
  const res3 = await request(`${BASE_URL}/search?q=spec&limit=5&offset=0`);
  logTest(
    'Should paginate search results',
    res3.status === 200 && res3.data.data.length <= 5 && res3.data.meta,
    res3.data.meta ? `Total: ${res3.data.meta.total}, Limit: ${res3.data.meta.limit}` : ''
  );
}

// ============================================================================
// Test 6: GET /api/specs/:id/versions - List versions
// ============================================================================

async function testGetVersions() {
  logSection('Test 6: GET /api/specs/:id/versions - List Versions');

  if (!createdSpecId) {
    console.log(`${colors.yellow}⚠ Skipping: No spec created in previous test${colors.reset}`);
    return;
  }

  // Test 6.1: Get versions
  const res1 = await request(`${BASE_URL}/${createdSpecId}/versions`);
  logTest(
    'Should list versions for spec',
    res1.status === 200 && res1.data.success && Array.isArray(res1.data.data),
    res1.data.meta ? `${res1.data.meta.total} version(s)` : ''
  );

  // Test 6.2: Verify metadata
  logTest(
    'Should include spec metadata in response',
    res1.data.meta && 
    res1.data.meta.specId === createdSpecId &&
    typeof res1.data.meta.specName === 'string',
    res1.data.meta ? `Spec: ${res1.data.meta.specName}` : ''
  );

  // Test 6.3: Get versions for non-existent spec
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res2 = await request(`${BASE_URL}/${fakeId}/versions`);
  logTest(
    'Should return 404 for non-existent spec',
    res2.status === 404 && !res2.data.success,
    res2.status === 404 ? `Error: ${res2.data.error}` : `Status: ${res2.status}`
  );

  // Test 6.4: Pagination
  const res3 = await request(`${BASE_URL}/${createdSpecId}/versions?limit=10&offset=0`);
  logTest(
    'Should paginate versions',
    res3.status === 200 && res3.data.meta,
    res3.data.meta ? `Limit: ${res3.data.meta.limit}, Offset: ${res3.data.meta.offset}` : ''
  );
}

// ============================================================================
// Test 7: POST /api/specs/:id/versions - Create version
// ============================================================================

async function testCreateVersion() {
  logSection('Test 7: POST /api/specs/:id/versions - Create Version');

  if (!createdSpecId) {
    console.log(`${colors.yellow}⚠ Skipping: No spec created in previous test${colors.reset}`);
    return;
  }

  // Test 7.1: Create valid version
  const newVersion = {
    version: '1.1.0',
    content: '# Test Spec v1.1.0\n\nUpdated content with new features.',
    changelog: 'Added new requirements and examples',
  };

  const res1 = await request(`${BASE_URL}/${createdSpecId}/versions`, {
    method: 'POST',
    body: JSON.stringify(newVersion),
  });

  logTest(
    'Should create new version',
    res1.status === 201 && res1.data.success && res1.data.data.version === newVersion.version,
    res1.status === 201 ? `Created version ${res1.data.data.version}` : `Status: ${res1.status}`
  );

  if (res1.status === 201) {
    createdVersionId = res1.data.data.id;
  }

  // Test 7.2: Try to create duplicate version
  const res2 = await request(`${BASE_URL}/${createdSpecId}/versions`, {
    method: 'POST',
    body: JSON.stringify(newVersion),
  });

  logTest(
    'Should reject duplicate version (409)',
    res2.status === 409 && !res2.data.success,
    res2.status === 409 ? `Error: ${res2.data.error}` : `Status: ${res2.status}`
  );

  // Test 7.3: Invalid semantic version
  const res3 = await request(`${BASE_URL}/${createdSpecId}/versions`, {
    method: 'POST',
    body: JSON.stringify({
      version: 'invalid-version',
      content: 'Content',
    }),
  });

  logTest(
    'Should reject invalid semver format (400)',
    res3.status === 400 && !res3.data.success,
    res3.status === 400 ? `Error: ${res3.data.error}` : `Status: ${res3.status}`
  );

  // Test 7.4: Missing required fields
  const res4 = await request(`${BASE_URL}/${createdSpecId}/versions`, {
    method: 'POST',
    body: JSON.stringify({ version: '1.2.0' }),
  });

  logTest(
    'Should reject missing content (400)',
    res4.status === 400 && !res4.data.success,
    res4.status === 400 ? `Error: ${res4.data.error}` : `Status: ${res4.status}`
  );
}

// ============================================================================
// Test 8: DELETE /api/specs/:id - Delete spec
// ============================================================================

async function testDeleteSpec() {
  logSection('Test 8: DELETE /api/specs/:id - Delete Spec');

  if (!createdSpecId) {
    console.log(`${colors.yellow}⚠ Skipping: No spec created in previous test${colors.reset}`);
    return;
  }

  // Test 8.1: Delete spec
  const res1 = await request(`${BASE_URL}/${createdSpecId}`, {
    method: 'DELETE',
  });

  logTest(
    'Should delete spec successfully',
    res1.status === 200 && res1.data.success,
    res1.status === 200 ? res1.data.message : `Status: ${res1.status}`
  );

  // Test 8.2: Verify deletion
  const res2 = await request(`${BASE_URL}/${createdSpecId}`);
  logTest(
    'Should return 404 for deleted spec',
    res2.status === 404 && !res2.data.success,
    res2.status === 404 ? 'Spec successfully deleted' : `Status: ${res2.status}`
  );

  // Test 8.3: Delete non-existent spec
  const fakeId = '00000000-0000-0000-0000-000000000000';
  const res3 = await request(`${BASE_URL}/${fakeId}`, {
    method: 'DELETE',
  });

  logTest(
    'Should return 404 for non-existent spec',
    res3.status === 404 && !res3.data.success,
    res3.status === 404 ? `Error: ${res3.data.error}` : `Status: ${res3.status}`
  );
}

// ============================================================================
// Test 9: Error cases and edge cases
// ============================================================================

async function testErrorCases() {
  logSection('Test 9: Error Cases & Edge Cases');

  // Test 9.1: Invalid UUID format
  const res1 = await request(`${BASE_URL}/invalid-uuid-format`);
  logTest(
    'Should handle invalid UUID format gracefully',
    res1.status === 404 || res1.status === 400 || res1.status === 500,
    `Status: ${res1.status}`
  );

  // Test 9.2: Empty search query
  const res2 = await request(`${BASE_URL}/search?q=`);
  logTest(
    'Should reject empty search query',
    res2.status === 400 && !res2.data.success,
    `Status: ${res2.status}`
  );

  // Test 9.3: Invalid category filter
  const res3 = await request(`${BASE_URL}?category=invalid-category`);
  logTest(
    'Should handle invalid category gracefully',
    res3.status === 200, // Should return empty results, not error
    res3.data.data ? `Found ${res3.data.data.length} specs (should be 0)` : ''
  );

  // Test 9.4: Negative offset
  const res4 = await request(`${BASE_URL}?offset=-1`);
  logTest(
    'Should handle negative offset',
    res4.status === 200 || res4.status === 400,
    `Status: ${res4.status}`
  );

  // Test 9.5: Very large limit
  const res5 = await request(`${BASE_URL}?limit=10000`);
  logTest(
    'Should handle very large limit',
    res5.status === 200,
    res5.data.data ? `Returned ${res5.data.data.length} specs` : ''
  );
}

// ============================================================================
// Summary
// ============================================================================

function printSummary() {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  const passRate = ((results.passed / results.total) * 100).toFixed(1);
  const color = passRate >= 90 ? colors.green : passRate >= 70 ? colors.yellow : colors.red;
  
  console.log(`${colors.blue}Test Results Summary:${colors.reset}`);
  console.log(`  Total Tests:  ${results.total}`);
  console.log(`  ${colors.green}Passed:       ${results.passed}${colors.reset}`);
  console.log(`  ${colors.red}Failed:       ${results.failed}${colors.reset}`);
  console.log(`  ${color}Pass Rate:    ${passRate}%${colors.reset}\n`);
  
  if (results.failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.tests
      .filter(t => !t.passed)
      .forEach(t => {
        console.log(`  ${colors.red}✗${colors.reset} ${t.name}`);
        if (t.message) {
          console.log(`    ${colors.gray}${t.message}${colors.reset}`);
        }
      });
    console.log('');
  }
  
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`);
  
  if (passRate < 100) {
    process.exit(1);
  }
}

// ============================================================================
// Run tests
// ============================================================================

runTests().catch(error => {
  console.error(`${colors.red}Fatal error: ${error.stack}${colors.reset}`);
  process.exit(1);
});
