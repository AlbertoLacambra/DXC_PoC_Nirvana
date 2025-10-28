'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Chip,
} from '@mui/material';
import {
  Web as NextIcon,
  Storage as TerraformIcon,
  Code as PythonIcon,
  Functions as AzureFunctionIcon,
  Widgets as ReactIcon,
  Dns as NodeIcon,
} from '@mui/icons-material';
import { ProjectType } from './ProjectScaffolderStepper';

// =============================================================================
// Types
// =============================================================================

export interface ProjectTypeOption {
  type: ProjectType;
  name: string;
  description: string;
  icon: React.ReactNode;
  tags: string[];
  color: string;
}

export interface ProjectTypeSelectionProps {
  selected: ProjectType | null;
  onSelect: (type: ProjectType) => void;
}

// =============================================================================
// Project Type Options
// =============================================================================

const projectTypes: ProjectTypeOption[] = [
  {
    type: 'nextjs-app',
    name: 'Next.js App',
    description: 'Full-stack React application with server-side rendering',
    icon: <NextIcon sx={{ fontSize: 48 }} />,
    tags: ['React', 'TypeScript', 'SSR', 'API Routes'],
    color: '#000000',
  },
  {
    type: 'react-spa',
    name: 'React SPA',
    description: 'Single Page Application with React and Vite',
    icon: <ReactIcon sx={{ fontSize: 48 }} />,
    tags: ['React', 'TypeScript', 'Vite', 'SPA'],
    color: '#61DAFB',
  },
  {
    type: 'terraform-infra',
    name: 'Terraform Infrastructure',
    description: 'Infrastructure as Code for Azure resources',
    icon: <TerraformIcon sx={{ fontSize: 48 }} />,
    tags: ['IaC', 'Azure', 'Terraform', 'DevOps'],
    color: '#7B42BC',
  },
  {
    type: 'python-api',
    name: 'Python API',
    description: 'FastAPI or Flask REST API with Python',
    icon: <PythonIcon sx={{ fontSize: 48 }} />,
    tags: ['Python', 'FastAPI', 'REST', 'API'],
    color: '#3776AB',
  },
  {
    type: 'azure-function',
    name: 'Azure Function',
    description: 'Serverless function app for Azure',
    icon: <AzureFunctionIcon sx={{ fontSize: 48 }} />,
    tags: ['Serverless', 'Azure', 'Python/Node', 'Functions'],
    color: '#0078D4',
  },
  {
    type: 'nodejs-microservice',
    name: 'Node.js Microservice',
    description: 'Express or Fastify microservice with Node.js',
    icon: <NodeIcon sx={{ fontSize: 48 }} />,
    tags: ['Node.js', 'Express', 'TypeScript', 'API'],
    color: '#339933',
  },
];

// =============================================================================
// Component
// =============================================================================

export const ProjectTypeSelection: React.FC<ProjectTypeSelectionProps> = ({
  selected,
  onSelect,
}) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Project Type
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Choose the type of project you want to generate. This will determine the
        available specifications and configuration options.
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 3,
        }}
      >
        {projectTypes.map((project) => (
          <Card
            key={project.type}
            elevation={selected === project.type ? 8 : 1}
            sx={{
              border: selected === project.type ? 2 : 0,
              borderColor: 'primary.main',
              transition: 'all 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4,
              },
            }}
          >
            <CardActionArea onClick={() => onSelect(project.type)}>
              <CardContent sx={{ p: 3 }}>
                {/* Icon */}
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mb: 2,
                    color: project.color,
                  }}
                >
                  {project.icon}
                </Box>

                {/* Name */}
                <Typography
                  variant="h6"
                  component="div"
                  align="center"
                  gutterBottom
                >
                  {project.name}
                </Typography>

                {/* Description */}
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                  sx={{ mb: 2, minHeight: 40 }}
                >
                  {project.description}
                </Typography>

                {/* Tags */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 0.5,
                    justifyContent: 'center',
                  }}
                >
                  {project.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      variant={selected === project.type ? 'filled' : 'outlined'}
                      color={selected === project.type ? 'primary' : 'default'}
                    />
                  ))}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
