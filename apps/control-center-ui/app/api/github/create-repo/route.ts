import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

/**
 * POST /api/github/create-repo
 * Creates a new GitHub repository
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      owner,
      name: rawName,
      description,
      isPrivate = false,
      autoInit = true, // Create with README
      gitignoreTemplate,
    } = body;

    // Normalize repository name: GitHub doesn't allow spaces, convert to hyphens
    // Also remove special characters except hyphens, underscores, and dots
    const name = rawName
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove invalid characters
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    console.log('=== Create GitHub Repository ===');
    console.log('Owner:', owner);
    console.log('Original Name:', rawName);
    console.log('Normalized Name:', name);
    console.log('Private:', isPrivate);

    // Validate inputs
    if (!owner || !name) {
      return NextResponse.json(
        { error: 'Owner and repository name are required' },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable not configured');
    }

    const octokit = new Octokit({ auth: githubToken });

    // Check if repository already exists
    try {
      const existing = await octokit.repos.get({
        owner,
        repo: name,
      });

      console.log('✅ Repository already exists:', existing.data.html_url);
      
      return NextResponse.json({
        success: true,
        exists: true,
        repository: {
          owner: existing.data.owner.login,
          name: existing.data.name,
          fullName: existing.data.full_name,
          url: existing.data.html_url,
          cloneUrl: existing.data.clone_url,
          sshUrl: existing.data.ssh_url,
          isPrivate: existing.data.private,
          defaultBranch: existing.data.default_branch,
        },
        message: 'Repository already exists. You can continue with this repository.',
      });
    } catch (err: any) {
      if (err.status !== 404) {
        throw err; // Re-throw if it's not a "not found" error
      }
      // Repository doesn't exist, continue with creation
      console.log('Repository does not exist, creating new one...');
    }

    // Get authenticated user info to determine if we're creating in user or org
    const { data: authUser } = await octokit.users.getAuthenticated();
    const isUserRepo = owner === authUser.login;

    // Create repository
    let createResponse;
    
    if (isUserRepo) {
      // Create in user's account
      createResponse = await octokit.repos.createForAuthenticatedUser({
        name,
        description,
        private: isPrivate,
        auto_init: autoInit,
        gitignore_template: gitignoreTemplate,
      });
    } else {
      // Create in organization
      createResponse = await octokit.repos.createInOrg({
        org: owner,
        name,
        description,
        private: isPrivate,
        auto_init: autoInit,
        gitignore_template: gitignoreTemplate,
      });
    }

    console.log('✅ Repository created successfully:', createResponse.data.html_url);

    return NextResponse.json({
      success: true,
      exists: false,
      repository: {
        owner: createResponse.data.owner.login,
        name: createResponse.data.name,
        fullName: createResponse.data.full_name,
        url: createResponse.data.html_url,
        cloneUrl: createResponse.data.clone_url,
        sshUrl: createResponse.data.ssh_url,
        isPrivate: createResponse.data.private,
        defaultBranch: createResponse.data.default_branch,
      },
      message: 'Repository created successfully!',
    });

  } catch (error: any) {
    console.error('Error creating repository:', error);
    
    let errorMessage = 'Failed to create repository';
    
    if (error.status === 422) {
      errorMessage = 'Repository name already exists or is invalid';
    } else if (error.status === 403) {
      errorMessage = 'Permission denied. Check your GitHub token permissions';
    } else if (error.status === 404) {
      errorMessage = 'Organization not found or you don\'t have access';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || errorMessage,
        details: error.response?.data || error.stack,
      },
      { status: error.status || 500 }
    );
  }
}
