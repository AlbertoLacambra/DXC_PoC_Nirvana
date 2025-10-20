import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface WorkflowRun {
  id: number;
  name: string;
  status: string;
  conclusion: string | null;
  head_branch: string;
  head_sha: string;
  created_at: string;
  updated_at: string;
  run_started_at: string;
  html_url: string;
  actor: {
    login: string;
  };
}

export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER || 'AlbertoLacambra';
    const repo = process.env.GITHUB_REPO || 'DXC_PoC_Nirvana';

    if (!token) {
      return NextResponse.json(
        { error: 'GITHUB_TOKEN no está configurado en .env.local' },
        { status: 500 }
      );
    }

    // Obtener workflow runs de GitHub Actions
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/actions/runs?per_page=20`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('GitHub API Error:', error);
      return NextResponse.json(
        { error: `GitHub API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const runs: WorkflowRun[] = data.workflow_runs || [];

    // Calcular estadísticas
    const stats = {
      totalPipelines: runs.length,
      running: runs.filter(r => r.status === 'in_progress' || r.status === 'queued').length,
      succeeded: runs.filter(r => r.conclusion === 'success').length,
      failed: runs.filter(r => r.conclusion === 'failure').length,
      cancelled: runs.filter(r => r.conclusion === 'cancelled').length,
    };

    // Formatear runs para el frontend
    const recentRuns = runs.slice(0, 10).map(run => {
      const startedAt = new Date(run.run_started_at || run.created_at);
      const updatedAt = new Date(run.updated_at);
      const durationMs = updatedAt.getTime() - startedAt.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      const durationSeconds = Math.floor((durationMs % 60000) / 1000);

      // Determinar estado
      let status = 'unknown';
      if (run.status === 'in_progress' || run.status === 'queued') {
        status = 'running';
      } else if (run.conclusion === 'success') {
        status = 'succeeded';
      } else if (run.conclusion === 'failure') {
        status = 'failed';
      } else if (run.conclusion === 'cancelled') {
        status = 'cancelled';
      }

      return {
        id: run.id,
        name: run.name,
        status,
        branch: run.head_branch,
        commit: run.head_sha.substring(0, 7),
        startedAt: startedAt.toLocaleTimeString('es-ES'),
        duration: `${durationMinutes}m ${durationSeconds}s`,
        triggeredBy: run.actor.login,
        url: run.html_url,
      };
    });

    return NextResponse.json({
      success: true,
      stats,
      recentRuns,
      lastUpdate: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('Error fetching GitHub Actions data:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener datos de GitHub Actions' },
      { status: 500 }
    );
  }
}
