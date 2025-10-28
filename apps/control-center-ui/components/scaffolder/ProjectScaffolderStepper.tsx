'use client';

import React, { useState } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Paper,
} from '@mui/material';
import {
  AccountTree as ProjectIcon,
  PlaylistAddCheck as SpecIcon,
  Settings as ConfigIcon,
  Preview as ReviewIcon,
} from '@mui/icons-material';

// =============================================================================
// Types
// =============================================================================

export type ProjectType =
  | 'nextjs-app'
  | 'terraform-infra'
  | 'python-api'
  | 'azure-function'
  | 'react-spa'
  | 'nodejs-microservice';

export interface ProjectConfiguration {
  name: string;
  directory: string;
  variables: Record<string, string>;
  options: {
    initGit: boolean;
    createCiCd: boolean;
    ciCdProvider: 'azure-pipelines' | 'github-actions' | 'gitlab-ci';
  };
}

export interface WizardState {
  projectType: ProjectType | null;
  selectedSpecs: string[]; // Spec IDs
  configuration: ProjectConfiguration;
}

export interface ProjectScaffolderStepperProps {
  children: (props: {
    activeStep: number;
    wizardState: WizardState;
    updateWizardState: (updates: Partial<WizardState>) => void;
    handleNext: () => void;
    handleBack: () => void;
  }) => React.ReactNode;
  onComplete: (state: WizardState) => void;
}

// =============================================================================
// Steps Configuration
// =============================================================================

const steps = [
  {
    label: 'Select Project Type',
    icon: <ProjectIcon />,
    description: 'Choose the type of project to generate',
  },
  {
    label: 'Select Specifications',
    icon: <SpecIcon />,
    description: 'Choose specs to apply to your project',
  },
  {
    label: 'Configure Project',
    icon: <ConfigIcon />,
    description: 'Set project name, directory, and options',
  },
  {
    label: 'Review & Generate',
    icon: <ReviewIcon />,
    description: 'Review your selections and generate project',
  },
];

// =============================================================================
// Component
// =============================================================================

export const ProjectScaffolderStepper: React.FC<ProjectScaffolderStepperProps> = ({
  children,
  onComplete,
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [wizardState, setWizardState] = useState<WizardState>({
    projectType: null,
    selectedSpecs: [],
    configuration: {
      name: '',
      directory: '',
      variables: {},
      options: {
        initGit: true,
        createCiCd: true,
        ciCdProvider: 'azure-pipelines',
      },
    },
  });

  const updateWizardState = (updates: Partial<WizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Last step - complete wizard
      onComplete(wizardState);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
    setWizardState({
      projectType: null,
      selectedSpecs: [],
      configuration: {
        name: '',
        directory: '',
        variables: {},
        options: {
          initGit: true,
          createCiCd: true,
          ciCdProvider: 'azure-pipelines',
        },
      },
    });
  };

  // Validation for each step
  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        return wizardState.projectType !== null;
      case 1:
        return wizardState.selectedSpecs.length > 0;
      case 2:
        return (
          wizardState.configuration.name.trim() !== '' &&
          wizardState.configuration.directory.trim() !== ''
        );
      case 3:
        return true; // Review step is always valid
      default:
        return false;
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Stepper */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((step, index) => (
          <Step key={step.label}>
            <StepLabel
              optional={
                index === activeStep ? (
                  <Typography variant="caption">{step.description}</Typography>
                ) : null
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 4, mb: 3, minHeight: 400 }}>
        {children({
          activeStep,
          wizardState,
          updateWizardState,
          handleNext,
          handleBack,
        })}
      </Paper>

      {/* Navigation Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          variant="outlined"
        >
          Back
        </Button>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button onClick={handleReset} variant="text">
            Reset
          </Button>
          <Button
            onClick={handleNext}
            variant="contained"
            disabled={!isStepValid(activeStep)}
          >
            {activeStep === steps.length - 1 ? 'Generate Project' : 'Next'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};
