'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Rocket as RocketIcon,
  AccountTree as AccountTreeIcon,
  Visibility as PreviewIcon,
} from '@mui/icons-material';

const STEPS = ['AI Generation', 'Preview', 'Deploy'];

interface ProjectPlan {
  project?: {
    name: string;
    description: string;
    timeline?: string;
    success_metrics?: string[];
  };
  epics?: any[];
  features?: any[];
  stories?: any[];
  enablers?: any[];
  tests?: any[];
  dependencies?: any[];
  sprint_plan?: any[];
}

export default function ProjectWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get params from URL (passed from /projects/new)
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [timeline, setTimeline] = useState('');
  const [constraints, setConstraints] = useState('');
  const [mustHave, setMustHave] = useState<string[]>([]);
  const [niceToHave, setNiceToHave] = useState<string[]>([]);
  const [repositoryOwner, setRepositoryOwner] = useState('');
  const [repositoryName, setRepositoryName] = useState('');

  // Load parameters from URL on mount
  useEffect(() => {
    const params = searchParams;
    setProjectName(params.get('projectName') || '');
    setDescription(params.get('description') || '');
    setTimeline(params.get('timeline') || '6 weeks');
    setConstraints(params.get('constraints') || '');
    setRepositoryOwner(params.get('repositoryOwner') || 'AlbertoLacambra');
    setRepositoryName(params.get('repositoryName') || '');
    
    try {
      const mustHaveParam = params.get('mustHave');
      const niceToHaveParam = params.get('niceToHave');
      setMustHave(mustHaveParam ? JSON.parse(mustHaveParam) : []);
      setNiceToHave(niceToHaveParam ? JSON.parse(niceToHaveParam) : []);
    } catch (e) {
      console.error('Error parsing requirements:', e);
    }
  }, [searchParams]);

  // Step 1: AI Generation
  const [generatedPlan, setGeneratedPlan] = useState<ProjectPlan | null>(null);
  const [logId, setLogId] = useState<string | null>(null);

  // Step 2: Preview (uses generatedPlan)
  
  // Step 3: Deploy (uses repositoryOwner/Name from URL params)
  const [deployResult, setDeployResult] = useState<any>(null);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleGeneratePlan = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          description,
          timeline,
          constraints,
          mustHave,
          niceToHave,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate plan');
      }

      setGeneratedPlan(result.data.plan);
      setLogId(result.data.log_id);
      handleNext();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeployToGitHub = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/projects/deploy-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: generatedPlan,
          repositoryOwner,
          repositoryName,
          createProjectBoard: true,
          logId,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to deploy to GitHub');
      }

      setDeployResult(result.data);
      handleNext();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        // AI Generation Step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <AccountTreeIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Generate AI Project Plan
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>Project:</strong> {projectName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Repository:</strong> {repositoryOwner}/{repositoryName}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Timeline:</strong> {timeline}
              </Typography>
            </Alert>

            <Typography variant="body1" color="text.secondary" paragraph>
              Click below to generate a comprehensive project plan using AI. This will create:
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="• Epics - High-level business capabilities" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Features - User-facing functionality groups" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Stories - Specific implementable units of work" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Enablers - Technical infrastructure tasks" />
              </ListItem>
              <ListItem>
                <ListItemText primary="• Tests - Validation and QA requirements" />
              </ListItem>
            </List>

            {loading ? (
              <Box sx={{ textAlign: 'center', py: 4, mt: 3 }}>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Generating project plan with AI (gpt-4o)...
                </Typography>
              </Box>
            ) : !generatedPlan ? (
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={handleGeneratePlan}
                disabled={!projectName || !description}
                startIcon={<RocketIcon />}
                sx={{ mt: 3 }}
              >
                Generate Plan with AI
              </Button>
            ) : (
              <Alert severity="success" sx={{ mt: 3 }}>
                ✅ Plan generated successfully! Click "Next" to preview.
              </Alert>
            )}
          </Box>
        );

      case 1:
        // Preview Step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              <PreviewIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Review Generated Plan
            </Typography>
            <Alert severity="info" sx={{ mb: 3 }}>
              Review the AI-generated project structure below. You can proceed to deploy or go back to regenerate.
            </Alert>
            {generatedPlan && (
              <Grid container spacing={3}>
                {/* Project Overview */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {generatedPlan.project?.name || projectName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {generatedPlan.project?.description || description}
                      </Typography>
                      {generatedPlan.project?.success_metrics && (
                        <Box>
                          <Typography variant="subtitle2" gutterBottom>
                            Success Metrics:
                          </Typography>
                          <List dense>
                            {generatedPlan.project.success_metrics.map((metric, i) => (
                              <ListItem key={i}>
                                <CheckIcon sx={{ mr: 1, fontSize: 16 }} color="success" />
                                <ListItemText primary={metric} />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Issue Breakdown */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Epics
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {generatedPlan.epics?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Features
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {generatedPlan.features?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Stories
                      </Typography>
                      <Typography variant="h4">
                        {generatedPlan.stories?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Enablers
                      </Typography>
                      <Typography variant="h4">
                        {generatedPlan.enablers?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom>
                        Tests
                      </Typography>
                      <Typography variant="h4">
                        {generatedPlan.tests?.length || 0}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Epics List */}
                {generatedPlan.epics && generatedPlan.epics.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Epic Breakdown
                    </Typography>
                    <List>
                      {generatedPlan.epics.map((epic, i) => (
                        <Card key={i} variant="outlined" sx={{ mb: 1 }}>
                          <CardContent>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={epic.priority || 'P1'} size="small" color="primary" />
                              <Typography variant="subtitle2">{epic.title}</Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            )}
          </Box>
        );

      case 2:
        // Deploy Step
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Deploy to GitHub
            </Typography>
            {deployResult ? (
              <>
                <Alert severity="success" sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckIcon /> Deployment Successful!
                  </Typography>
                </Alert>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Repository
                        </Typography>
                        <Typography variant="h6">
                          <a
                            href={`https://github.com/${deployResult.repository}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            {deployResult.repository}
                          </a>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {deployResult.issues_created} issues created
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  {deployResult.project_board && (
                    <Grid item xs={12} md={4}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Project Board
                          </Typography>
                          <Typography variant="h6">
                            <a
                              href={deployResult.project_board.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                              #{deployResult.project_board.number} - {generatedPlan?.project?.name}
                            </a>
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            With 5 custom fields configured
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  )}

                  <Grid item xs={12} md={4}>
                    <Card variant="outlined">
                      <CardContent>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          📋 Configuration Guide
                        </Typography>
                        <Typography variant="h6">
                          <a
                            href={`https://github.com/${deployResult.repository}/blob/main/PROJECT_INSTRUCTIONS.md`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', color: 'inherit' }}
                          >
                            PROJECT_INSTRUCTIONS.md
                          </a>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Complete setup guide created
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Issues Breakdown */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      📊 Created Issues Breakdown
                    </Typography>
                    <Grid container spacing={2}>
                      {deployResult.issues && (
                        <>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'primary.50', borderRadius: 1 }}>
                              <Typography variant="h4" color="primary">
                                {deployResult.issues.filter((i: any) => i.issueType === 'epic').length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Epics
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                              <Typography variant="h4" color="info.main">
                                {deployResult.issues.filter((i: any) => i.issueType === 'feature').length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Features
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'success.50', borderRadius: 1 }}>
                              <Typography variant="h4" color="success.main">
                                {deployResult.issues.filter((i: any) => i.issueType === 'story').length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Stories
                              </Typography>
                            </Box>
                          </Grid>
                          <Grid item xs={6} sm={3}>
                            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.50', borderRadius: 1 }}>
                              <Typography variant="h4" color="warning.main">
                                {deployResult.issues.filter((i: any) => ['enabler', 'test'].includes(i.issueType)).length}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Enablers & Tests
                              </Typography>
                            </Box>
                          </Grid>
                        </>
                      )}
                    </Grid>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card variant="outlined" sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      🚀 Next Steps
                    </Typography>
                    <Stack spacing={2}>
                      <Button
                        variant="contained"
                        fullWidth
                        href={`https://github.com/${deployResult.repository}/blob/main/PROJECT_INSTRUCTIONS.md`}
                        target="_blank"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        📋 Read Setup Guide (PROJECT_INSTRUCTIONS.md)
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        href={`https://github.com/${deployResult.repository}/issues`}
                        target="_blank"
                        sx={{ justifyContent: 'flex-start' }}
                      >
                        📝 View Issues in GitHub
                      </Button>
                      {deployResult.project_board && (
                        <>
                          <Button
                            variant="outlined"
                            fullWidth
                            href={deployResult.project_board.url}
                            target="_blank"
                            sx={{ justifyContent: 'flex-start' }}
                          >
                            📋 Open Project Board
                          </Button>
                          <Button
                            variant="outlined"
                            fullWidth
                            href={`${deployResult.project_board.url}?layout=roadmap`}
                            target="_blank"
                            sx={{ justifyContent: 'flex-start' }}
                          >
                            🗺️ View Roadmap (Timeline)
                          </Button>
                        </>
                      )}
                    </Stack>
                    
                    <Alert severity="info" sx={{ mt: 3 }}>
                      <Typography variant="body2" gutterBottom>
                        <strong>📋 Project Board Configured!</strong> We've created 5 custom fields: Start Date, Target Date, Sprint, Priority, Story Points.
                      </Typography>
                      {deployResult.recommended_sprints && (
                        <Typography variant="body2" gutterBottom sx={{ mt: 1 }}>
                          <strong>⏱️ Timeline:</strong> {deployResult.timeline} → Recommended: {deployResult.recommended_sprints} sprints (2 weeks each)
                        </Typography>
                      )}
                      <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                        <strong>Next Steps:</strong>
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary={`1. Set up ${deployResult.recommended_sprints || 3} Sprint iterations in project settings`}
                            secondary="Go to Project Board → Settings → Sprint field → Configure iterations (2-week cycles)"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="2. Enable automated workflows"
                            secondary="Project Settings → Workflows → Enable 'Auto-add to project', 'Auto-archive closed items'"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="3. Assign Start/Target dates to stories"
                            secondary="In Roadmap view → Click each story → Set dates to enable timeline visualization"
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="4. Set Story Points for velocity tracking"
                            secondary="Use Fibonacci sequence (1,2,3,5,8,13) in Story Points field for each issue"
                          />
                        </ListItem>
                      </List>
                    </Alert>
                  </CardContent>
                </Card>
                
                {deployResult.manual_steps && (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      ⚠️ Project Board Not Created
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {deployResult.manual_steps.message}
                    </Typography>
                    <List dense>
                      {deployResult.manual_steps.steps.map((step: string, index: number) => (
                        <ListItem key={index}>
                          <ListItemText primary={step} />
                        </ListItem>
                      ))}
                    </List>
                    <Typography variant="body2" sx={{ mt: 2 }}>
                      <strong>Note:</strong> GitHub Projects V2 requires special token permissions (project, read:project). 
                      Creating the project manually is quick and easy from the GitHub UI.
                    </Typography>
                  </Alert>
                )}
              </>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 3 }}>
                  <Typography variant="body2">
                    <strong>Repository:</strong> {repositoryOwner}/{repositoryName}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    Ready to deploy {generatedPlan?.stories?.length || 0} stories and create project board
                  </Typography>
                </Alert>
                
                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <LinearProgress sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">
                      Creating GitHub issues, project board, and PROJECT_INSTRUCTIONS.md...
                    </Typography>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleDeployToGitHub}
                    startIcon={<RocketIcon />}
                  >
                    🚀 Deploy to {repositoryOwner}/{repositoryName}
                  </Button>
                )}
              </>
            )}
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Create New Project
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Automated GitHub project planning with AI-powered breakdown
      </Typography>

      <Paper sx={{ p: 3, mt: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {renderStepContent()}

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          <Box>
            {/* Step 0: Show "Generate Plan" button */}
            {activeStep === 0 && !generatedPlan && (
              <Button
                variant="contained"
                onClick={handleGeneratePlan}
                disabled={loading || !projectName || !repositoryOwner || !repositoryName}
              >
                {loading ? 'Generating...' : 'Generate AI Plan'}
              </Button>
            )}
            
            {/* Steps 0-1: Show "Next" button if plan is ready */}
            {activeStep < STEPS.length - 1 && generatedPlan && activeStep !== 0 && (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            )}
            
            {/* After generating, allow to proceed */}
            {activeStep === 0 && generatedPlan && (
              <Button
                variant="contained"
                onClick={handleNext}
              >
                Next
              </Button>
            )}
            
            {/* Final step: Show "View Projects" button */}
            {activeStep === STEPS.length - 1 && deployResult && (
              <Button
                variant="contained"
                onClick={() => router.push('/projects')}
              >
                View Projects
              </Button>
            )}
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}
