'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Folder,
  InsertDriveFile,
  CheckCircle,
  Error as ErrorIcon,
  Code,
  Schedule,
  GitHub,
} from '@mui/icons-material';

interface ProjectDetails {
  id: string;
  name: string;
  path: string;
  type: string;
  generatedFiles: number;
  specsApplied: number;
  gitCommit?: string;
  duration: number;
  createdAt: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // For now, we'll use mock data since we don't have a GET endpoint yet
    // In a real implementation, this would fetch from /api/projects/[id]
    const mockProject: ProjectDetails = {
      id: projectId,
      name: 'my-first-project',
      path: '/projects/my-first-project',
      type: 'nextjs-app',
      generatedFiles: 10,
      specsApplied: 4,
      gitCommit: 'abc123',
      duration: 3115,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setProject(mockProject);
      setLoading(false);
    }, 500);
  }, [projectId]);

  const handleBack = () => {
    router.push('/projects/new');
  };

  const handleOpenFolder = () => {
    if (project?.path) {
      // This would need to be implemented with a native API
      alert(`Opening folder: ${project.path}`);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !project) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Project not found'}
        </Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack}>
          Back to Projects
        </Button>
      </Container>
    );
  }

  const getProjectTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'nextjs-app': 'Next.js App',
      'react-spa': 'React SPA',
      'terraform-infra': 'Terraform Infrastructure',
      'python-api': 'Python API',
      'azure-function': 'Azure Function',
      'nodejs-microservice': 'Node.js Microservice',
    };
    return labels[type] || type;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box mb={4}>
        <Button
          startIcon={<ArrowBack />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>

        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <CheckCircle color="success" sx={{ fontSize: 40 }} />
          <Typography variant="h4" component="h1">
            Project Generated Successfully
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary">
          Your project has been created and is ready to use.
        </Typography>
      </Box>

      {/* Success Alert */}
      <Alert severity="success" sx={{ mb: 3 }}>
        Project <strong>{project.name}</strong> has been successfully generated with {project.generatedFiles} files
        {project.gitCommit && ' and initialized as a Git repository'}.
      </Alert>

      {/* Project Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project Details
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <List>
          <ListItem>
            <ListItemIcon>
              <Code />
            </ListItemIcon>
            <ListItemText
              primary="Project Type"
              secondary={getProjectTypeLabel(project.type)}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <Folder />
            </ListItemIcon>
            <ListItemText
              primary="Location"
              secondary={project.path}
              secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <InsertDriveFile />
            </ListItemIcon>
            <ListItemText
              primary="Generated Files"
              secondary={`${project.generatedFiles} files created`}
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <Code />
            </ListItemIcon>
            <ListItemText
              primary="Applied Specifications"
              secondary={`${project.specsApplied} specs applied`}
            />
          </ListItem>

          {project.gitCommit && (
            <ListItem>
              <ListItemIcon>
                <GitHub />
              </ListItemIcon>
              <ListItemText
                primary="Git Repository"
                secondary={`Initialized with commit ${project.gitCommit.substring(0, 7)}`}
                secondaryTypographyProps={{ sx: { fontFamily: 'monospace' } }}
              />
            </ListItem>
          )}

          <ListItem>
            <ListItemIcon>
              <Schedule />
            </ListItemIcon>
            <ListItemText
              primary="Generation Time"
              secondary={`Completed in ${(project.duration / 1000).toFixed(2)}s`}
            />
          </ListItem>
        </List>
      </Paper>

      {/* Next Steps */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Next Steps
        </Typography>
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ '& > *': { mb: 2 } }}>
          <Typography variant="body1">
            1. Navigate to your project directory:
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
            cd {project.path}
          </Paper>

          {project.type === 'nextjs-app' && (
            <>
              <Typography variant="body1">
                2. Install dependencies:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                npm install
              </Paper>

              <Typography variant="body1">
                3. Start the development server:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                npm run dev
              </Paper>
            </>
          )}

          {project.type === 'react-spa' && (
            <>
              <Typography variant="body1">
                2. Install dependencies:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                npm install
              </Paper>

              <Typography variant="body1">
                3. Start the development server:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                npm run dev
              </Paper>
            </>
          )}

          {project.type === 'python-api' && (
            <>
              <Typography variant="body1">
                2. Create a virtual environment:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                python -m venv venv
              </Paper>

              <Typography variant="body1">
                3. Install dependencies:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                pip install -r requirements.txt
              </Paper>

              <Typography variant="body1">
                4. Run the application:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                python main.py
              </Paper>
            </>
          )}

          {project.type === 'terraform-infra' && (
            <>
              <Typography variant="body1">
                2. Initialize Terraform:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                terraform init
              </Paper>

              <Typography variant="body1">
                3. Review the plan:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                terraform plan
              </Paper>

              <Typography variant="body1">
                4. Apply the configuration:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', fontFamily: 'monospace' }}>
                terraform apply
              </Paper>
            </>
          )}
        </Box>

        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<Folder />}
            onClick={handleOpenFolder}
            sx={{ mr: 2 }}
          >
            Open in File Explorer
          </Button>
          <Button
            variant="outlined"
            onClick={handleBack}
          >
            Create Another Project
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
