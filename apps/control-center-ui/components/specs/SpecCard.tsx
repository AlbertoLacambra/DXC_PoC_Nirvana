'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as RequiredIcon,
  RadioButtonUnchecked as OptionalIcon,
} from '@mui/icons-material';

// =============================================================================
// Types
// =============================================================================

export interface Spec {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  category: 'development' | 'infrastructure' | 'security' | 'testing' | 'observability' | 'finops' | 'compliance';
  version: string;
  status: 'draft' | 'active' | 'deprecated' | 'archived';
  tags: string[];
  required: boolean;
  projectCount: number;
  popularity: number;
  createdAt: string;
  updatedAt: string;
  _count?: {
    versions: number;
    usage: number;
  };
}

export interface SpecCardProps {
  spec: Spec;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// =============================================================================
// Category Colors
// =============================================================================

const categoryColors: Record<Spec['category'], string> = {
  development: '#2196f3',
  infrastructure: '#ff9800',
  security: '#f44336',
  testing: '#4caf50',
  observability: '#9c27b0',
  finops: '#00bcd4',
  compliance: '#795548',
};

// =============================================================================
// Status Colors
// =============================================================================

const statusColors: Record<Spec['status'], string> = {
  draft: '#9e9e9e',
  active: '#4caf50',
  deprecated: '#ff9800',
  archived: '#757575',
};

// =============================================================================
// Component
// =============================================================================

export const SpecCard: React.FC<SpecCardProps> = ({
  spec,
  onView,
  onEdit,
  onDelete,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header: Status and Required badge */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Chip
            label={spec.status.toUpperCase()}
            size="small"
            sx={{
              backgroundColor: statusColors[spec.status],
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.7rem',
            }}
          />
          <Tooltip title={spec.required ? 'Required for all projects' : 'Optional'}>
            {spec.required ? (
              <RequiredIcon sx={{ color: '#4caf50', fontSize: 20 }} />
            ) : (
              <OptionalIcon sx={{ color: '#9e9e9e', fontSize: 20 }} />
            )}
          </Tooltip>
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {spec.displayName}
        </Typography>

        {/* Category */}
        <Chip
          label={spec.category.toUpperCase()}
          size="small"
          sx={{
            backgroundColor: categoryColors[spec.category],
            color: 'white',
            fontWeight: 'bold',
            fontSize: '0.65rem',
            mb: 1.5,
          }}
        />

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            minHeight: '3.6em',
          }}
        >
          {spec.description || 'No description available'}
        </Typography>

        {/* Tags */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
          {spec.tags.slice(0, 3).map((tag, index) => (
            <Chip
              key={`${spec.id}-tag-${index}`}
              label={tag}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          ))}
          {spec.tags.length > 3 && (
            <Chip
              label={`+${spec.tags.length - 3}`}
              size="small"
              variant="outlined"
              sx={{ fontSize: '0.7rem' }}
            />
          )}
        </Stack>

        {/* Metadata */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
          <Typography variant="caption" color="text.secondary">
            v{spec.version}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {spec._count?.versions || 0} versions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {spec.projectCount} projects
          </Typography>
        </Box>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
        <Tooltip title="View Details">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onView(spec.id)}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
        {onEdit && (
          <Tooltip title="Edit Spec">
            <IconButton
              size="small"
              color="secondary"
              onClick={() => onEdit(spec.id)}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete Spec">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(spec.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};
