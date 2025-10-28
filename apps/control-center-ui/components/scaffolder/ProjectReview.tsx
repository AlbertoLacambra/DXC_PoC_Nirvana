'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { WizardState, ProjectType } from './ProjectScaffolderStepper';

// =============================================================================
// Types
// =============================================================================

interface Spec {
  id: string;
  name: string;
  displayName: string;
  category: string;
  version: string;
}

export interface ProjectReviewProps {
  wizardState: WizardState;
  onGenerate?: () => void;
}

// =============================================================================
// Helper Functions
// =============================================================================

const getProjectTypeLabel = (type: ProjectType): string => {
  const labels: Record<ProjectType, string> = {
    'nextjs-app': 'Next.js App',
    'react-spa': 'React SPA',
    'terraform-infra': 'Terraform Infrastructure',
    'python-api': 'Python API',
    'azure-function': 'Azure Function',
    'nodejs-microservice': 'Node.js Microservice',
  };
  return labels[type] || type;
};

const getCiCdProviderLabel = (provider: string): string => {
  const labels: Record<string, string> = {
    'azure-pipelines': 'Azure Pipelines',
    'github-actions': 'GitHub Actions',
    'gitlab-ci': 'GitLab CI',
  };
  return labels[provider] || provider;
};

// Mock directory structure (will be replaced by actual generation in Phase 3)
const getMockDirectoryStructure = (projectType: ProjectType): any[] => {
  const baseStructure = [
    { name: '.git/', type: 'folder' },
    { name: '.gitignore', type: 'file' },
    { name: 'README.md', type: 'file' },
    { name: 'package.json', type: 'file' },
  ];

  const typeStructures: Record<ProjectType, any[]> = {
    'nextjs-app': [
      ...baseStructure,
      { name: 'app/', type: 'folder' },
      { name: 'components/', type: 'folder' },
      { name: 'lib/', type: 'folder' },
      { name: 'public/', type: 'folder' },
      { name: 'next.config.js', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
    ],
    'react-spa': [
      ...baseStructure,
      { name: 'src/', type: 'folder' },
      { name: 'public/', type: 'folder' },
      { name: 'vite.config.ts', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
    ],
    'terraform-infra': [
      { name: '.gitignore', type: 'file' },
      { name: 'README.md', type: 'file' },
      { name: 'main.tf', type: 'file' },
      { name: 'variables.tf', type: 'file' },
      { name: 'outputs.tf', type: 'file' },
      { name: 'providers.tf', type: 'file' },
      { name: 'terraform.tfvars', type: 'file' },
    ],
    'python-api': [
      { name: '.gitignore', type: 'file' },
      { name: 'README.md', type: 'file' },
      { name: 'requirements.txt', type: 'file' },
      { name: 'main.py', type: 'file' },
      { name: 'app/', type: 'folder' },
      { name: 'tests/', type: 'folder' },
    ],
    'azure-function': [
      { name: '.gitignore', type: 'file' },
      { name: 'README.md', type: 'file' },
      { name: 'requirements.txt', type: 'file' },
      { name: 'host.json', type: 'file' },
      { name: 'local.settings.json', type: 'file' },
      { name: 'HttpTrigger/', type: 'folder' },
    ],
    'nodejs-microservice': [
      ...baseStructure,
      { name: 'src/', type: 'folder' },
      { name: 'tests/', type: 'folder' },
      { name: 'Dockerfile', type: 'file' },
      { name: 'tsconfig.json', type: 'file' },
    ],
  };

  return typeStructures[projectType] || baseStructure;
};

// =============================================================================
// Component
// =============================================================================

export const ProjectReview: React.FC<ProjectReviewProps> = ({ wizardState }) => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSelectedSpecs = async () => {
      if (wizardState.selectedSpecs.length === 0) return;

      setLoading(true);
      try {
        // Fetch all selected specs in parallel
        const promises = wizardState.selectedSpecs.map((id) =>
          fetch(`/api/specs/${id}`).then((r) => r.json())
        );
        const results = await Promise.all(promises);
        const validSpecs = results
          .filter((r) => r.success)
          .map((r) => r.data);
        setSpecs(validSpecs);
      } catch (error) {
        console.error('Error fetching specs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSelectedSpecs();
  }, [wizardState.selectedSpecs]);

  const directoryStructure = wizardState.projectType
    ? getMockDirectoryStructure(wizardState.projectType)
    : [];

  const estimatedFileCount =
    directoryStructure.filter((item) => item.type === 'file').length +
    wizardState.selectedSpecs.length * 2; // Rough estimate

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Review & Generate
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Review your selections and click "Generate Project" to create your project.
      </Typography>

      {/* Summary Alert */}
      <Alert severity="info" icon={<CheckIcon />} sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Ready to generate:</strong> {wizardState.configuration.name} (
          {getProjectTypeLabel(wizardState.projectType!)}) with{' '}
          {wizardState.selectedSpecs.length} specification(s)
        </Typography>
      </Alert>

      {/* Project Configuration */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Project Configuration
        </Typography>
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                Project Type
              </TableCell>
              <TableCell>
                {wizardState.projectType
                  ? getProjectTypeLabel(wizardState.projectType)
                  : 'Not selected'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Project Name</TableCell>
              <TableCell>{wizardState.configuration.name}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Directory</TableCell>
              <TableCell>
                <code>{wizardState.configuration.directory}</code>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Initialize Git</TableCell>
              <TableCell>
                {wizardState.configuration.options.initGit ? 'Yes' : 'No'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Create CI/CD</TableCell>
              <TableCell>
                {wizardState.configuration.options.createCiCd
                  ? `Yes (${getCiCdProviderLabel(
                      wizardState.configuration.options.ciCdProvider
                    )})`
                  : 'No'}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Estimated Files</TableCell>
              <TableCell>{estimatedFileCount} files</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>

      {/* Selected Specifications */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Selected Specifications ({wizardState.selectedSpecs.length})
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {loading ? (
          <Typography variant="body2" color="text.secondary">
            Loading specifications...
          </Typography>
        ) : specs.length > 0 ? (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {specs.map((spec) => (
              <Chip
                key={spec.id}
                label={`${spec.displayName} (v${spec.version})`}
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No specifications selected
          </Typography>
        )}
      </Paper>

      {/* Directory Structure Preview */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Directory Structure Preview
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List dense>
          {directoryStructure.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                {item.type === 'folder' ? (
                  <FolderIcon fontSize="small" color="action" />
                ) : (
                  <FileIcon fontSize="small" color="action" />
                )}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography
                    variant="body2"
                    component="code"
                    sx={{ fontFamily: 'monospace' }}
                  >
                    {item.name}
                  </Typography>
                }
              />
            </ListItem>
          ))}
        </List>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Note: This is a preview. Actual structure may include additional files
          based on selected specifications.
        </Typography>
      </Paper>
    </Box>
  );
};
