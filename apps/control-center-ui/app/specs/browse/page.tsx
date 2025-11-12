'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container, Typography, Box, Alert, Button } from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import Link from 'next/link';
import { SpecGrid } from '@/components/specs/SpecGrid';
import { SpecFilters, FilterState } from '@/components/specs/SpecFilters';
import { SpecSearch } from '@/components/specs/SpecSearch';
import { SpecDetailModal } from '@/components/specs/SpecDetailModal';
import { Spec } from '@/components/specs/SpecCard';

// =============================================================================
// Types
// =============================================================================

interface ApiResponse {
  success: boolean;
  data: Spec[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// =============================================================================
// Page Component
// =============================================================================

export default function SpecBrowsePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filters from URL
  const [filters, setFilters] = useState<FilterState>({
    category: searchParams.get('category') || undefined,
    status: searchParams.get('status') || undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || [],
    required: searchParams.get('required') === 'true' ? true : undefined,
  });

  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    
    if (filters.category) params.set('category', filters.category);
    if (filters.status) params.set('status', filters.status);
    if (filters.tags.length > 0) params.set('tags', filters.tags.join(','));
    if (filters.required) params.set('required', 'true');
    if (searchQuery) params.set('search', searchQuery);

    const queryString = params.toString();
    const newUrl = queryString ? `/specs/browse?${queryString}` : '/specs/browse';
    
    router.push(newUrl, { scroll: false });
  }, [filters, searchQuery, router]);

  // Fetch specs
  const fetchSpecs = async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setOffset(0);
      }

      const params = new URLSearchParams();
      const currentOffset = loadMore ? offset + 12 : 0;
      
      params.set('limit', '12');
      params.set('offset', currentOffset.toString());
      
      if (filters.category) params.set('category', filters.category);
      if (filters.status) params.set('status', filters.status);
      if (filters.required) params.set('required', 'true');
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/specs?${params.toString()}`);
      const data: ApiResponse = await response.json();

      if (data.success) {
        if (loadMore) {
          setSpecs((prev) => [...prev, ...data.data]);
          setOffset(currentOffset);
        } else {
          setSpecs(data.data);
        }
        setHasMore(data.meta.hasMore);
        setError(null);
      } else {
        setError('Failed to load specifications');
      }
    } catch (err) {
      setError('An error occurred while loading specifications');
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Fetch specs when filters or search change
  useEffect(() => {
    fetchSpecs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, searchQuery]);

  // Handlers
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({
      category: undefined,
      status: undefined,
      tags: [],
      required: undefined,
    });
    setSearchQuery('');
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleViewSpec = async (id: string) => {
    const spec = specs.find((s) => s.id === id);
    if (spec) {
      // Fetch full spec details with versions
      try {
        const response = await fetch(`/api/specs/${id}`);
        const data = await response.json();
        if (data.success) {
          setSelectedSpec(data.data);
          setModalOpen(true);
        }
      } catch (err) {
        console.error('Failed to fetch spec details:', err);
        setSelectedSpec(spec);
        setModalOpen(true);
      }
    }
  };

  const handleEditSpec = (id: string) => {
    router.push(`/specs/edit/${id}`);
  };

  const handleDeleteSpec = async (id: string) => {
    if (!confirm('Are you sure you want to delete this specification?')) {
      return;
    }

    try {
      const response = await fetch(`/api/specs/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        // Refresh the list
        fetchSpecs();
      } else {
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err) {
      alert('An error occurred while deleting the specification');
      console.error(err);
    }
  };

  const handleLoadMore = () => {
    fetchSpecs(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSpec(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Typography variant="h3" component="h1" gutterBottom>
          Specification Library
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and search through all available specifications
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Filters Sidebar */}
        <Box sx={{ width: { xs: '100%', md: '300px' }, flexShrink: 0 }}>
          <Box sx={{ position: { md: 'sticky' }, top: { md: 80 } }}>
            <SpecFilters
              filters={filters}
              onChange={handleFilterChange}
              onReset={handleFilterReset}
              availableTags={['git', 'security', 'terraform', 'ci-cd', 'oauth']}
            />
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Search */}
          <SpecSearch value={searchQuery} onChange={handleSearchChange} />

          {/* Results Count */}
          {!loading && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {specs.length === 0
                ? 'No specifications found'
                : `Showing ${specs.length} specification${specs.length !== 1 ? 's' : ''}`}
            </Typography>
          )}

          {/* Specs Grid */}
          <SpecGrid
            specs={specs}
            loading={loading}
            onView={handleViewSpec}
            onEdit={handleEditSpec}
            onDelete={handleDeleteSpec}
            onLoadMore={handleLoadMore}
            hasMore={hasMore}
            loadingMore={loadingMore}
          />
        </Box>
      </Box>

      {/* Detail Modal */}
      <SpecDetailModal
        spec={selectedSpec}
        open={modalOpen}
        onClose={handleCloseModal}
        onEdit={handleEditSpec}
      />
    </Container>
  );
}
