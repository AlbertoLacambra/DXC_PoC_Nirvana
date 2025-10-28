'use client';

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
  Paper,
  Divider,
} from '@mui/material';
import { ProjectConfiguration } from './ProjectScaffolderStepper';

// =============================================================================
// Types
// =============================================================================

export interface ProjectConfigurationFormProps {
  configuration: ProjectConfiguration;
  onChange: (config: ProjectConfiguration) => void;
}

// =============================================================================
// Component
// =============================================================================

export const ProjectConfigurationForm: React.FC<ProjectConfigurationFormProps> = ({
  configuration,
  onChange,
}) => {
  const handleChange = (field: keyof ProjectConfiguration, value: any) => {
    onChange({ ...configuration, [field]: value });
  };

  const handleOptionsChange = (field: string, value: any) => {
    onChange({
      ...configuration,
      options: { ...configuration.options, [field]: value },
    });
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Configure Project
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Set project name, directory, and additional options for code generation.
      </Typography>

      {/* Basic Configuration */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Configuration
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Project Name"
            placeholder="my-awesome-project"
            value={configuration.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            fullWidth
            helperText="Alphanumeric characters and hyphens only"
            error={
              configuration.name.trim() !== '' &&
              !/^[a-zA-Z0-9-]+$/.test(configuration.name)
            }
          />

          <TextField
            label="Target Directory"
            placeholder="/projects/my-awesome-project"
            value={configuration.directory}
            onChange={(e) => handleChange('directory', e.target.value)}
            required
            fullWidth
            helperText="Absolute path where the project will be generated"
          />
        </Box>
      </Paper>

      {/* Git Options */}
      <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Git Options
        </Typography>

        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                checked={configuration.options.initGit}
                onChange={(e) => handleOptionsChange('initGit', e.target.checked)}
              />
            }
            label="Initialize Git repository"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
            Creates a .git directory and makes an initial commit
          </Typography>
        </FormGroup>
      </Paper>

      {/* CI/CD Options */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          CI/CD Options
        </Typography>

        <FormGroup sx={{ mb: 3 }}>
          <FormControlLabel
            control={
              <Switch
                checked={configuration.options.createCiCd}
                onChange={(e) => handleOptionsChange('createCiCd', e.target.checked)}
              />
            }
            label="Create CI/CD pipeline"
          />
          <Typography variant="caption" color="text.secondary" sx={{ ml: 4, mt: -1 }}>
            Generates pipeline configuration files
          </Typography>
        </FormGroup>

        {configuration.options.createCiCd && (
          <>
            <Divider sx={{ mb: 2 }} />
            <FormControl component="fieldset">
              <FormLabel component="legend">CI/CD Provider</FormLabel>
              <RadioGroup
                value={configuration.options.ciCdProvider}
                onChange={(e) =>
                  handleOptionsChange('ciCdProvider', e.target.value as any)
                }
              >
                <FormControlLabel
                  value="azure-pipelines"
                  control={<Radio />}
                  label="Azure Pipelines"
                />
                <FormControlLabel
                  value="github-actions"
                  control={<Radio />}
                  label="GitHub Actions"
                />
                <FormControlLabel
                  value="gitlab-ci"
                  control={<Radio />}
                  label="GitLab CI"
                />
              </RadioGroup>
            </FormControl>
          </>
        )}
      </Paper>

      {/* Template Variables (Future Enhancement) */}
      {/* 
      <Paper elevation={1} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Template Variables
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Coming soon: Custom variables for template interpolation
        </Typography>
      </Paper>
      */}
    </Box>
  );
};
