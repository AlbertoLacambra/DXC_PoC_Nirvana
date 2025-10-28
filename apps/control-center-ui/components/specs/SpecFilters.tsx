'use client';

import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
  Paper,
  Typography,
  Stack,
  SelectChangeEvent,
} from '@mui/material';
import { FilterList as FilterIcon, Clear as ClearIcon } from '@mui/icons-material';

// =============================================================================
// Types
// =============================================================================

export interface FilterState {
  category?: string;
  status?: string;
  tags: string[];
  required?: boolean;
}

export interface SpecFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableTags?: string[];
}

// =============================================================================
// Constants
// =============================================================================

const CATEGORIES = [
  { value: 'development', label: 'Development' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'security', label: 'Security' },
  { value: 'testing', label: 'Testing' },
  { value: 'observability', label: 'Observability' },
  { value: 'finops', label: 'FinOps' },
  { value: 'compliance', label: 'Compliance' },
];

const STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'active', label: 'Active' },
  { value: 'deprecated', label: 'Deprecated' },
  { value: 'archived', label: 'Archived' },
];

// =============================================================================
// Component
// =============================================================================

export const SpecFilters: React.FC<SpecFiltersProps> = ({
  filters,
  onChange,
  onReset,
  availableTags = [],
}) => {
  const handleCategoryChange = (event: SelectChangeEvent) => {
    onChange({
      ...filters,
      category: event.target.value || undefined,
    });
  };

  const handleStatusChange = (event: SelectChangeEvent) => {
    onChange({
      ...filters,
      status: event.target.value || undefined,
    });
  };

  const handleTagsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    onChange({
      ...filters,
      tags: typeof value === 'string' ? value.split(',') : value,
    });
  };

  const handleRequiredChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange({
      ...filters,
      required: event.target.checked ? true : undefined,
    });
  };

  const hasActiveFilters =
    filters.category || filters.status || filters.tags.length > 0 || filters.required;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <FilterIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          Filters
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<ClearIcon />}
            onClick={onReset}
            sx={{ ml: 'auto' }}
          >
            Clear All
          </Button>
        )}
      </Box>

      <Stack spacing={2}>
        {/* Category Filter */}
        <FormControl fullWidth size="small">
          <InputLabel id="category-filter-label">Category</InputLabel>
          <Select
            labelId="category-filter-label"
            id="category-filter"
            value={filters.category || ''}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">
              <em>All Categories</em>
            </MenuItem>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat.value} value={cat.value}>
                {cat.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Status Filter */}
        <FormControl fullWidth size="small">
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            id="status-filter"
            value={filters.status || ''}
            label="Status"
            onChange={handleStatusChange}
          >
            <MenuItem value="">
              <em>All Statuses</em>
            </MenuItem>
            {STATUSES.map((status) => (
              <MenuItem key={status.value} value={status.value}>
                {status.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Tags Filter */}
        {availableTags.length > 0 && (
          <FormControl fullWidth size="small">
            <InputLabel id="tags-filter-label">Tags</InputLabel>
            <Select
              labelId="tags-filter-label"
              id="tags-filter"
              multiple
              value={filters.tags}
              label="Tags"
              onChange={handleTagsChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={value} size="small" />
                  ))}
                </Box>
              )}
            >
              {availableTags.map((tag) => (
                <MenuItem key={tag} value={tag}>
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Required Checkbox */}
        <FormControlLabel
          control={
            <Checkbox
              checked={filters.required || false}
              onChange={handleRequiredChange}
            />
          }
          label="Required Specs Only"
        />
      </Stack>
    </Paper>
  );
};
