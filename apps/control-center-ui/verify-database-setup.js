#!/usr/bin/env node
/**
 * verify-database-setup.js
 * Verification script for Phase 2.2 - Database Setup
 * Tests connection and queries specs from database
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function verifyDatabaseSetup() {
  console.log('='.repeat(80));
  console.log('DXC Cloud Mind - Nirvana - Database Setup Verification');
  console.log('='.repeat(80));
  console.log('');

  try {
    // Test 1: Connection
    console.log('📌 Test 1: Database Connection');
    await prisma.$connect();
    console.log('✅ Connected successfully');
    console.log('');

    // Test 2: Count specs
    console.log('📌 Test 2: Count Specs');
    const specCount = await prisma.spec.count();
    console.log(`✅ Found ${specCount} specs in database`);
    console.log('');

    // Test 3: List specs
    console.log('📌 Test 3: List All Specs');
    const specs = await prisma.spec.findMany({
      select: {
        name: true,
        displayName: true,
        category: true,
        version: true,
        status: true,
        tags: true,
        required: true,
        popularity: true,
      },
      orderBy: {
        popularity: 'desc',
      },
    });

    console.log('✅ Specs retrieved:');
    specs.forEach((spec, index) => {
      console.log('');
      console.log(`  ${index + 1}. ${spec.displayName}`);
      console.log(`     Name: ${spec.name}`);
      console.log(`     Category: ${spec.category}`);
      console.log(`     Version: ${spec.version}`);
      console.log(`     Status: ${spec.status}`);
      console.log(`     Required: ${spec.required ? 'Yes' : 'No'}`);
      console.log(`     Popularity: ${spec.popularity}`);
      console.log(`     Tags: ${spec.tags.join(', ')}`);
    });
    console.log('');

    // Test 4: Count versions
    console.log('📌 Test 4: Count Spec Versions');
    const versionCount = await prisma.specVersion.count();
    console.log(`✅ Found ${versionCount} spec versions in database`);
    console.log('');

    // Test 5: List versions
    console.log('📌 Test 5: List Spec Versions');
    const versions = await prisma.specVersion.findMany({
      include: {
        spec: {
          select: {
            name: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('✅ Versions retrieved:');
    versions.forEach((version, index) => {
      console.log(`  ${index + 1}. ${version.spec.displayName} v${version.version}`);
      console.log(`     Created: ${version.createdAt.toISOString()}`);
      console.log(`     Changelog: ${version.changelog || 'N/A'}`);
    });
    console.log('');

    // Test 6: Full-text search test
    console.log('📌 Test 6: Search Specs (keyword: "git")');
    const searchResults = await prisma.spec.findMany({
      where: {
        OR: [
          { displayName: { contains: 'git', mode: 'insensitive' } },
          { description: { contains: 'git', mode: 'insensitive' } },
          { tags: { has: 'git' } },
        ],
      },
      select: {
        name: true,
        displayName: true,
        category: true,
      },
    });

    console.log(`✅ Found ${searchResults.length} specs matching "git"`);
    searchResults.forEach((spec) => {
      console.log(`  - ${spec.displayName} (${spec.category})`);
    });
    console.log('');

    // Summary
    console.log('='.repeat(80));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(80));
    console.log('');
    console.log('📊 Summary:');
    console.log(`  - Specs in database: ${specCount}`);
    console.log(`  - Spec versions: ${versionCount}`);
    console.log(`  - Database connection: OK`);
    console.log(`  - Prisma client: OK`);
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('  1. Create API endpoints in app/api/specs/');
    console.log('  2. Create UI components in components/specs/');
    console.log('  3. Create Spec Browser page at /specs/browse');
    console.log('');
    console.log('='.repeat(80));

    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERROR:', error.message);
    console.error('');
    console.error('Stack trace:', error.stack);
    console.error('');
    console.error('='.repeat(80));
    console.error('❌ TESTS FAILED');
    console.error('='.repeat(80));
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run verification
verifyDatabaseSetup().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
