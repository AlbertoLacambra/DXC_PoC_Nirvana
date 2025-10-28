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
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Link from 'next/link';
import {
  ProjectScaffolderStepper,
  WizardState,
} from '@/components/scaffolder/ProjectScaffolderStepper';
import { ProjectTypeSelection } from '@/components/scaffolder/ProjectTypeSelection';
import { SpecSelection } from '@/components/scaffolder/SpecSelection';
import { ProjectConfigurationForm } from '@/components/scaffolder/ProjectConfigurationForm';
import { ProjectReview } from '@/components/scaffolder/ProjectReview';

// =============================================================================
// Component
// =============================================================================

export default function NewProjectPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleComplete = async (wizardState: WizardState) => {
    setGenerating(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(wizardState),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to generate project');
      }

      setSuccess(true);

      // Redirect to project details page after 2 seconds
      setTimeout(() => {
        router.push(`/projects/${data.data.id}`);
      }, 2000);
    } catch (err: any) {
      console.error('Generation error:', err);
      setError(err.message || 'An error occurred while generating the project');
      setGenerating(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          component={Link}
          href="/projects"
          startIcon={<BackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Project
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Use this wizard to scaffold a new project with selected specifications
          and best practices.
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Project generated successfully! Redirecting to project details...
        </Alert>
      )}

      {/* Wizard */}
      <Paper elevation={2} sx={{ p: 4 }}>
        {generating ? (
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
              Generating your project...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This may take a few moments. Please don't close this page.
            </Typography>
          </Box>
        ) : (
          <ProjectScaffolderStepper onComplete={handleComplete}>
            {({ activeStep, wizardState, updateWizardState }) => (
              <>
                {activeStep === 0 && (
                  <ProjectTypeSelection
                    selected={wizardState.projectType}
                    onSelect={(type: any) =>
                      updateWizardState({ ...wizardState, projectType: type })
                    }
                  />
                )}
                {activeStep === 1 && (
                  <SpecSelection
                    projectType={wizardState.projectType!}
                    selectedSpecs={wizardState.selectedSpecs}
                    onSelectionChange={(specs: string[]) =>
                      updateWizardState({ ...wizardState, selectedSpecs: specs })
                    }
                  />
                )}
                {activeStep === 2 && (
                  <ProjectConfigurationForm
                    configuration={wizardState.configuration}
                    onChange={(config) =>
                      updateWizardState({ ...wizardState, configuration: config })
                    }
                  />
                )}
                {activeStep === 3 && <ProjectReview wizardState={wizardState} />}
              </>
            )}
          </ProjectScaffolderStepper>
        )}
      </Paper>
    </Container>
  );
}
