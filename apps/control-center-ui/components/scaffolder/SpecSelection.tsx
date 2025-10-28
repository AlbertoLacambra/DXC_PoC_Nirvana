'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  Paper,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  CheckCircle as CompatibleIcon,
  Warning as WarningIcon,
  Error as ConflictIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { ProjectType } from './ProjectScaffolderStepper';

// =============================================================================
// Types
// =============================================================================

interface Spec {
  id: string;
  name: string;
  displayName: string;
  category: string;
  status: string;
  isRequired: boolean;
  tags: string[];
  dependencies?: string[]; // Spec IDs
  conflicts?: string[]; // Spec IDs
}

export interface CompatibilityStatus {
  status: 'compatible' | 'warning' | 'conflict';
  message?: string;
  missingDependencies?: string[];
  conflictingSpecs?: string[];
}

export interface SpecSelectionProps {
  projectType: ProjectType;
  selectedSpecs: string[];
  onSelectionChange: (specIds: string[]) => void;
}

// =============================================================================
// Compatibility Checker
// =============================================================================

function checkCompatibility(
  spec: Spec,
  selectedSpecs: string[],
  allSpecs: Spec[]
): CompatibilityStatus {
  const selectedSpecObjects = allSpecs.filter((s) =>
    selectedSpecs.includes(s.id)
  );

  // Check for conflicts
  const conflicts = spec.conflicts?.filter((conflictId) =>
    selectedSpecs.includes(conflictId)
  ) || [];

  if (conflicts.length > 0) {
    const conflictNames = allSpecs
      .filter((s) => conflicts.includes(s.id))
      .map((s) => s.displayName)
      .join(', ');
    
    return {
      status: 'conflict',
      message: `Conflicts with: ${conflictNames}`,
      conflictingSpecs: conflicts,
    };
  }

  // Check for missing dependencies
  const missingDeps = spec.dependencies?.filter(
    (depId) => !selectedSpecs.includes(depId)
  ) || [];

  if (missingDeps.length > 0) {
    const depNames = allSpecs
      .filter((s) => missingDeps.includes(s.id))
      .map((s) => s.displayName)
      .join(', ');
    
    return {
      status: 'warning',
      message: `Requires: ${depNames}`,
      missingDependencies: missingDeps,
    };
  }

  return { status: 'compatible' };
}

// =============================================================================
// Component
// =============================================================================

export const SpecSelection: React.FC<SpecSelectionProps> = ({
  projectType,
  selectedSpecs,
  onSelectionChange,
}) => {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch specs
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/specs?limit=100');
        const data = await response.json();
        
        if (data.success) {
          setSpecs(data.data);
          setError(null);
        } else {
          setError('Failed to load specifications');
        }
      } catch (err) {
        setError('An error occurred while loading specifications');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecs();
  }, []);

  const handleToggle = (specId: string) => {
    const spec = specs.find((s) => s.id === specId);
    if (!spec) return;

    const isSelected = selectedSpecs.includes(specId);
    
    if (isSelected) {
      // Deselect
      onSelectionChange(selectedSpecs.filter((id) => id !== specId));
    } else {
      // Select
      const compatibility = checkCompatibility(spec, selectedSpecs, specs);
      
      if (compatibility.status === 'conflict') {
        // Don't allow selection if there's a conflict
        return;
      }

      let newSelection = [...selectedSpecs, specId];

      // Auto-select dependencies
      if (spec.dependencies && spec.dependencies.length > 0) {
        const missingDeps = spec.dependencies.filter(
          (depId) => !selectedSpecs.includes(depId)
        );
        newSelection = [...newSelection, ...missingDeps];
      }

      onSelectionChange(newSelection);
    }
  };

  const handleSelectAll = () => {
    if (selectedSpecs.length === specs.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(specs.map((s) => s.id));
    }
  };

  const getCompatibilityIcon = (status: CompatibilityStatus) => {
    switch (status.status) {
      case 'compatible':
        return <CompatibleIcon color="success" fontSize="small" />;
      case 'warning':
        return <WarningIcon color="warning" fontSize="small" />;
      case 'conflict':
        return <ConflictIcon color="error" fontSize="small" />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Select Specifications
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the specifications to apply to your {projectType} project.
        Dependencies will be auto-selected.
      </Typography>

      {selectedSpecs.length > 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          {selectedSpecs.length} specification(s) selected
        </Alert>
      )}

      <TableContainer component={Paper} elevation={1}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedSpecs.length === specs.length && specs.length > 0}
                  indeterminate={
                    selectedSpecs.length > 0 && selectedSpecs.length < specs.length
                  }
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Tags</TableCell>
              <TableCell align="center">Compatibility</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {specs.map((spec) => {
              const isSelected = selectedSpecs.includes(spec.id);
              const compatibility = checkCompatibility(spec, selectedSpecs, specs);
              const isDisabled = !isSelected && compatibility.status === 'conflict';

              return (
                <TableRow
                  key={spec.id}
                  hover
                  onClick={() => !isDisabled && handleToggle(spec.id)}
                  sx={{
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    opacity: isDisabled ? 0.5 : 1,
                  }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => handleToggle(spec.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{spec.displayName}</Typography>
                      {spec.isRequired && (
                        <Chip label="Required" size="small" color="primary" />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip label={spec.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={spec.status}
                      size="small"
                      color={spec.status === 'active' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {spec.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                      {spec.tags.length > 3 && (
                        <Chip
                          label={`+${spec.tags.length - 3}`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      {getCompatibilityIcon(compatibility)}
                      {compatibility.message && (
                        <Tooltip title={compatibility.message}>
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
