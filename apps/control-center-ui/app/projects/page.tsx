'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  GitHub as GitHubIcon,
  FolderOpen as FolderIcon,
} from '@mui/icons-material';

interface Project {
  id: string;
  name: string;
  description: string;
  repository_owner: string;
  repository_name: string;
  status: string;
  created_at: string;
  deployed_at: string | null;
}

export default function ProjectsListPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/projects');
      
      if (!response.ok) {
        throw new Error('Failed to fetch projects');
      }

      const data = await response.json();
      setProjects(data.projects || []);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching projects:', err);
      setError(err.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'planning':
        return 'warning';
      case 'archived':
        return 'default';
      default:
        return 'info';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not deployed';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your GitHub projects and deployment plans
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/projects/new/wizard')}
          size="large"
        >
          New Project
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : projects.length === 0 ? (
        /* Empty State */
        <Card variant="outlined" sx={{ py: 8, textAlign: 'center' }}>
          <CardContent>
            <FolderIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No projects yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create your first project using the Project Wizard
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push('/projects/new/wizard')}
            >
              Create First Project
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Projects Grid */
        <Grid container spacing={3}>
          {projects.map((project) => (
            <Grid item xs={12} md={6} key={project.id}>
              <Card 
                variant="outlined" 
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    boxShadow: 3,
                    borderColor: 'primary.main',
                  },
                }}
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardContent>
                  {/* Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {project.name}
                    </Typography>
                    <Chip
                      label={project.status}
                      color={getStatusColor(project.status) as any}
                      size="small"
                    />
                  </Box>

                  {/* Description */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      minHeight: 40,
                    }}
                  >
                    {project.description || 'No description provided'}
                  </Typography>

                  {/* Repository */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <GitHubIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {project.repository_owner}/{project.repository_name}
                    </Typography>
                  </Box>

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(project.created_at)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.deployed_at ? `Deployed: ${formatDate(project.deployed_at)}` : 'Not deployed'}
                    </Typography>
                  </Box>

                  {/* Actions */}
                  <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<GitHubIcon />}
                      href={`https://github.com/${project.repository_owner}/${project.repository_name}`}
                      target="_blank"
                      onClick={(e) => e.stopPropagation()}
                    >
                      View on GitHub
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Summary Stats */}
      {!loading && projects.length > 0 && (
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Chip
            label={`${projects.length} Total Projects`}
            variant="outlined"
          />
          <Chip
            label={`${projects.filter((p) => p.status === 'active').length} Active`}
            color="success"
            variant="outlined"
          />
          <Chip
            label={`${projects.filter((p) => p.status === 'planning').length} Planning`}
            color="warning"
            variant="outlined"
          />
        </Box>
      )}
    </Container>
  );
}
