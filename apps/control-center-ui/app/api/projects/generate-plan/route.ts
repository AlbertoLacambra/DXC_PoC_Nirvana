import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

/**
 * POST /api/projects/generate-plan
 * Generates a comprehensive GitHub project plan using AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      projectName, 
      description, 
      timeline, 
      constraints,
      mustHave = [],
      niceToHave = []
    } = body;

    // Validate required fields
    if (!projectName || !description) {
      return NextResponse.json(
        { error: 'Project name and description are required' },
        { status: 400 }
      );
    }

    // Read Project Planner Agent prompt
    const agentPromptPath = path.join(
      process.cwd(),
      '..',
      '..',
      'docs',
      'features',
      'agent-hub',
      'agents',
      'dxc-custom',
      'project-planner.agent.md'
    );
    
    const agentPrompt = await fs.readFile(agentPromptPath, 'utf-8');

    // Build user input for AI
    const userInput = `
Project Name: ${projectName}

Description: ${description}

${timeline ? `Timeline: ${timeline}` : ''}

${constraints ? `Constraints: ${constraints}` : ''}

${mustHave.length > 0 ? `Must-Have Features:\n${mustHave.map((f: string) => `- ${f}`).join('\n')}` : ''}

${niceToHave.length > 0 ? `Nice-to-Have Features:\n${niceToHave.map((f: string) => `- ${f}`).join('\n')}` : ''}

Please generate a complete project plan with Epic > Feature > Story hierarchy, including:
1. Project overview with success metrics
2. Complete issue hierarchy
3. Priority assignments (P0-P3)
4. Estimates (Fibonacci for stories, T-shirt for epics)
5. Dependencies mapping
6. Sprint distribution
7. GitHub-ready JSON output

Format the output as valid JSON with this structure:
{
  "project": {
    "name": "...",
    "description": "...",
    "timeline": "...",
    "success_metrics": [...]
  },
  "epics": [...],
  "features": [...],
  "stories": [...],
  "enablers": [...],
  "tests": [...],
  "dependencies": [...],
  "sprint_plan": [...]
}
`;

    // Call GitHub Models API
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable not configured');
    }

    const startTime = Date.now();
    
    const aiResponse = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${githubToken}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: agentPrompt
          },
          {
            role: 'user',
            content: userInput
          }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`GitHub Models API error: ${aiResponse.status} - ${errorText}`);
    }

    const aiResult = await aiResponse.json();
    const generationTime = Date.now() - startTime;

    const assistantMessage = aiResult.choices[0]?.message?.content;
    if (!assistantMessage) {
      throw new Error('No response from AI model');
    }

    // Parse JSON from response (handle markdown code blocks)
    let generatedPlan;
    try {
      const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/) || 
                       assistantMessage.match(/```\n([\s\S]*?)\n```/) ||
                       [null, assistantMessage];
      
      const jsonContent = jsonMatch[1] || assistantMessage;
      generatedPlan = JSON.parse(jsonContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Return raw response if parsing fails
      generatedPlan = {
        raw_response: assistantMessage,
        parse_error: 'Could not parse as JSON',
      };
    }

    // Save to database (project_generation_logs)
    const { Pool } = await import('pg');
    const pool = new Pool({
      host: process.env.AGENT_HUB_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.AGENT_HUB_DB_PORT || process.env.POSTGRES_PORT || '5432'),
      database: process.env.AGENT_HUB_DB_NAME || 'nirvana_agent_hub',
      user: process.env.AGENT_HUB_DB_USER || process.env.POSTGRES_USER || 'postgres',
      password: process.env.AGENT_HUB_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
    });

    const logResult = await pool.query(
      `INSERT INTO project_generation_logs 
       (user_input, agent_prompt, ai_response, generated_plan, model_used, tokens_used, generation_time_ms, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        userInput,
        agentPrompt.substring(0, 5000), // Truncate for storage
        assistantMessage,
        JSON.stringify(generatedPlan),
        'gpt-4o',
        aiResult.usage?.total_tokens || 0,
        generationTime,
        'success'
      ]
    );

    return NextResponse.json({
      success: true,
      data: {
        plan: generatedPlan,
        log_id: logResult.rows[0].id,
        metadata: {
          model: 'gpt-4o',
          tokens_used: aiResult.usage?.total_tokens || 0,
          generation_time_ms: generationTime,
        }
      }
    });

  } catch (error: any) {
    console.error('Error generating project plan:', error);

    // Log error to database
    try {
      const { Pool } = await import('pg');
      const pool = new Pool({
        host: process.env.AGENT_HUB_DB_HOST || process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.AGENT_HUB_DB_PORT || process.env.POSTGRES_PORT || '5432'),
        database: process.env.AGENT_HUB_DB_NAME || 'nirvana_agent_hub',
        user: process.env.AGENT_HUB_DB_USER || process.env.POSTGRES_USER || 'postgres',
        password: process.env.AGENT_HUB_DB_PASSWORD || process.env.POSTGRES_PASSWORD,
      });
      
      await pool.query(
        `INSERT INTO project_generation_logs 
         (user_input, ai_response, model_used, status, error_message)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          JSON.stringify(request.body),
          null,
          'gpt-4o',
          'error',
          error.message
        ]
      );
    } catch (dbError) {
      console.error('Failed to log error to database:', dbError);
    }

    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to generate project plan',
        details: error.stack
      },
      { status: 500 }
    );
  }
}
