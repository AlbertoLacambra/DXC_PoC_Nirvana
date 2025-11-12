'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  TextField,
  Grid,
  FormControlLabel,
  Switch,
  Chip,
  IconButton,
  Stack,
} from '@mui/material';
import { 
  ArrowBack as BackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  GitHub as GitHubIcon,
  Rocket as RocketIcon,
} from '@mui/icons-material';
import Link from 'next/link';


export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [repositoryOwner, setRepositoryOwner] = useState('AlbertoLacambra');
  const [repositoryName, setRepositoryName] = useState('');
  const [timeline, setTimeline] = useState('6 weeks');
  const [constraints, setConstraints] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [createRepo, setCreateRepo] = useState(true);
  
  const [mustHave, setMustHave] = useState<string[]>([]);
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [newMustHave, setNewMustHave] = useState('');
  const [newNiceToHave, setNewNiceToHave] = useState('');

  // Helper function to normalize repository name (same logic as API)
  const normalizeRepoName = (name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/[^a-zA-Z0-9._-]/g, '') // Remove invalid characters
      .replace(/--+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  };

  // Get normalized repo name for preview
  const normalizedRepoName = normalizeRepoName(repositoryName);
  const showRepoNameWarning = repositoryName && normalizedRepoName !== repositoryName;

  const addMustHave = () => {
    if (newMustHave.trim()) {
      setMustHave([...mustHave, newMustHave.trim()]);
      setNewMustHave('');
    }
  };

  const removeMustHave = (index: number) => {
    setMustHave(mustHave.filter((_, i) => i !== index));
  };

  const addNiceToHave = () => {
    if (newNiceToHave.trim()) {
      setNiceToHave([...niceToHave, newNiceToHave.trim()]);
      setNewNiceToHave('');
    }
  };

  const removeNiceToHave = (index: number) => {
    setNiceToHave(niceToHave.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!projectName.trim() || !description.trim() || !repositoryOwner.trim() || !repositoryName.trim()) {
      setError('Please fill in all required fields (Project Name, Description, Repository Owner, Repository Name)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let finalRepositoryName = repositoryName; // Will be updated with normalized name if repo is created
      
      // Step 1: Create or verify repository exists
      if (createRepo) {
        const repoResponse = await fetch('/api/github/create-repo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            owner: repositoryOwner,
            name: repositoryName,
            description: description,
            isPrivate: isPrivate,
            autoInit: true,
          }),
        });

        const repoResult = await repoResponse.json();

        if (!repoResult.success) {
          throw new Error(repoResult.error || 'Failed to create repository');
        }

        // Use the actual repository name from GitHub (normalized)
        finalRepositoryName = repoResult.repository.name;
        
        console.log('✅ Repository ready:', repoResult.repository.url);
        console.log('📝 Normalized repository name:', finalRepositoryName);
      }

      // Step 2: Redirect to wizard with all parameters (use normalized repo name)
      const params = new URLSearchParams({
        projectName,
        description,
        repositoryOwner,
        repositoryName: finalRepositoryName, // Use normalized name
        timeline: timeline || '6 weeks',
        constraints: constraints || '',
        mustHave: JSON.stringify(mustHave),
        niceToHave: JSON.stringify(niceToHave),
      });

      router.push(`/projects/new/wizard?${params.toString()}`);

    } catch (err: any) {
      console.error('Setup error:', err);
      setError(err.message || 'An error occurred during project setup');
      setLoading(false);
    }
  };


  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/development"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Volver a Project Development
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure your project settings and GitHub repository. The AI wizard will help you generate a complete project plan.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Form */}
      <Paper elevation={2} sx={{ p: 4 }}>
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 400,
              gap: 2,
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" color="text.secondary">
              {createRepo ? 'Creating repository and preparing wizard...' : 'Preparing wizard...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait a moment...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* Project Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📋 Project Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Project Name"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g., E-Commerce Smart Checkout"
                helperText="The name of your project"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={4}
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this project aims to achieve..."
                helperText="A clear description helps the AI generate better plans"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Timeline"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g., 6 weeks, 3 months"
                helperText="Expected project duration"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Constraints"
                value={constraints}
                onChange={(e) => setConstraints(e.target.value)}
                placeholder="e.g., Budget, Technology, Team size"
                helperText="Any limitations or requirements"
              />
            </Grid>

            {/* GitHub Repository */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                <GitHubIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                GitHub Repository
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Repository Owner"
                value={repositoryOwner}
                onChange={(e) => setRepositoryOwner(e.target.value)}
                placeholder="username or organization"
                helperText="Your GitHub username or organization"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Repository Name"
                value={repositoryName}
                onChange={(e) => setRepositoryName(e.target.value)}
                placeholder="my-awesome-project"
                helperText={
                  showRepoNameWarning
                    ? `⚠️ Will be normalized to: ${normalizedRepoName}`
                    : "Repository name (lowercase, hyphens allowed)"
                }
                error={!!showRepoNameWarning}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={createRepo}
                    onChange={(e) => setCreateRepo(e.target.checked)}
                  />
                }
                label="Create repository if it doesn't exist"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    disabled={!createRepo}
                  />
                }
                label="Private repository"
              />
            </Grid>

            {/* Requirements */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                🎯 Requirements (Optional)
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Must Have Features
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add must-have feature"
                  value={newMustHave}
                  onChange={(e) => setNewMustHave(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addMustHave()}
                />
                <IconButton color="primary" onClick={addMustHave}>
                  <AddIcon />
                </IconButton>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {mustHave.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => removeMustHave(index)}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Nice to Have Features
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add nice-to-have feature"
                  value={newNiceToHave}
                  onChange={(e) => setNewNiceToHave(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addNiceToHave()}
                />
                <IconButton color="secondary" onClick={addNiceToHave}>
                  <AddIcon />
                </IconButton>
              </Box>
              <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                {niceToHave.map((item, index) => (
                  <Chip
                    key={index}
                    label={item}
                    onDelete={() => removeNiceToHave(index)}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<RocketIcon />}
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {createRepo ? 'Create Repository & Continue to Wizard' : 'Continue to Wizard'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Container>
  );
}
