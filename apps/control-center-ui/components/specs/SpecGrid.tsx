'use client';

import React from 'react';
import { Box, Typography, CircularProgress, Button, Skeleton } from '@mui/material';
import { Inbox as EmptyIcon } from '@mui/icons-material';
import { SpecCard, Spec } from './SpecCard';

// =============================================================================
// Types
// =============================================================================

export interface SpecGridProps {
  specs: Spec[];
  loading: boolean;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
}

// =============================================================================
// Loading Skeleton
// =============================================================================

const SpecCardSkeleton: React.FC = () => (
  <Box>
    <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
    <Skeleton variant="text" sx={{ mt: 1 }} />
    <Skeleton variant="text" width="60%" />
  </Box>
);

// =============================================================================
// Empty State
// =============================================================================

const EmptyState: React.FC = () => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 2,
    }}
  >
    <EmptyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
    <Typography variant="h6" color="text.secondary" gutterBottom>
      No Specifications Found
    </Typography>
    <Typography variant="body2" color="text.secondary" align="center">
      Try adjusting your filters or search criteria
    </Typography>
  </Box>
);

// =============================================================================
// Component
// =============================================================================

export const SpecGrid: React.FC<SpecGridProps> = ({
  specs,
  loading,
  onView,
  onEdit,
  onDelete,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
}) => {
  // Initial loading state
  if (loading) {
    return (
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
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Box key={`skeleton-${n}`}>
            <SpecCardSkeleton />
          </Box>
        ))}
      </Box>
    );
  }

  // Empty state
  if (!specs || specs.length === 0) {
    return <EmptyState />;
  }

  // Specs grid
  return (
    <Box>
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
        {specs.map((spec) => (
          <Box key={spec.id}>
            <SpecCard
              spec={spec}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </Box>
        ))}
      </Box>

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={onLoadMore}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : null}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}
    </Box>
  );
};
