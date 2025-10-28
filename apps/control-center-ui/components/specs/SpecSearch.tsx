'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Box,
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

// =============================================================================
// Types
// =============================================================================

export interface SpecSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

// =============================================================================
// Component
// =============================================================================

export const SpecSearch: React.FC<SpecSearchProps> = ({
  value,
  onChange,
  placeholder = 'Search specifications...',
  debounceMs = 300,
}) => {
  const [localValue, setLocalValue] = useState(value);

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [localValue, debounceMs, onChange, value]);

  // Sync with external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(event.target.value);
  };

  const handleClear = useCallback(() => {
    setLocalValue('');
    onChange('');
  }, [onChange]);

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        size="medium"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: localValue && (
            <InputAdornment position="end">
              <IconButton
                aria-label="clear search"
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.default',
          },
        }}
      />
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', px: 1 }}>
        <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
          Search by name, description, or tags
        </Box>
        {localValue && (
          <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Searching...
          </Box>
        )}
      </Box>
    </Paper>
  );
};
