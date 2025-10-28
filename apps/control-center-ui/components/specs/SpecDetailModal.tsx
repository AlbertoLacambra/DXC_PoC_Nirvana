'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Divider,
  Table,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  CheckCircle as RequiredIcon,
  RadioButtonUnchecked as OptionalIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Spec } from './SpecCard';

// =============================================================================
// Types
// =============================================================================

export interface SpecDetailModalProps {
  spec: Spec | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  versions?: Array<{
    id: string;
    version: string;
    createdAt: string;
    createdBy: string;
    changelog: string;
  }>;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// =============================================================================
// Tab Panel Component
// =============================================================================

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`spec-tabpanel-${index}`}
      aria-labelledby={`spec-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

// =============================================================================
// Category & Status Colors
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

const statusColors: Record<Spec['status'], string> = {
  draft: '#9e9e9e',
  active: '#4caf50',
  deprecated: '#ff9800',
  archived: '#757575',
};

// =============================================================================
// Component
// =============================================================================

export const SpecDetailModal: React.FC<SpecDetailModalProps> = ({
  spec,
  open,
  onClose,
  onEdit,
  versions = [],
}) => {
  const [currentTab, setCurrentTab] = useState(0);

  if (!spec) return null;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h5" component="div" gutterBottom>
              {spec.displayName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
              <Chip
                label={spec.category.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: categoryColors[spec.category],
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              <Chip
                label={spec.status.toUpperCase()}
                size="small"
                sx={{
                  backgroundColor: statusColors[spec.status],
                  color: 'white',
                  fontWeight: 'bold',
                }}
              />
              {spec.required && (
                <Chip
                  icon={<RequiredIcon />}
                  label="REQUIRED"
                  size="small"
                  color="success"
                />
              )}
            </Stack>
          </Box>
          <Box>
            {onEdit && (
              <IconButton
                aria-label="edit"
                onClick={() => onEdit(spec.id)}
                sx={{ mr: 1 }}
              >
                <EditIcon />
              </IconButton>
            )}
            <IconButton aria-label="close" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <Divider />

      <Tabs
        value={currentTab}
        onChange={handleTabChange}
        aria-label="spec detail tabs"
        sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}
      >
        <Tab label="Overview" />
        <Tab label="Content" />
        <Tab label={`Versions (${versions.length})`} />
        <Tab label="Usage" />
      </Tabs>

      <DialogContent dividers sx={{ p: 0, minHeight: '400px' }}>
        {/* Overview Tab */}
        <TabPanel value={currentTab} index={0}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold', width: '30%' }}>
                  Name
                </TableCell>
                <TableCell>{spec.name}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Version
                </TableCell>
                <TableCell>v{spec.version}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Description
                </TableCell>
                <TableCell>{spec.description || 'No description'}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Tags
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                    {spec.tags.map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Created
                </TableCell>
                <TableCell>{new Date(spec.createdAt).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Last Updated
                </TableCell>
                <TableCell>{new Date(spec.updatedAt).toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Popularity
                </TableCell>
                <TableCell>{spec.popularity}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>

        {/* Content Tab */}
        <TabPanel value={currentTab} index={1}>
          <Box
            sx={{
              '& h1': { fontSize: '1.75rem', mt: 2, mb: 1 },
              '& h2': { fontSize: '1.5rem', mt: 2, mb: 1 },
              '& h3': { fontSize: '1.25rem', mt: 1.5, mb: 1 },
              '& p': { mb: 1.5 },
              '& ul, & ol': { ml: 3, mb: 1.5 },
              '& code': {
                backgroundColor: '#f5f5f5',
                padding: '2px 6px',
                borderRadius: '3px',
                fontSize: '0.9em',
              },
              '& pre': {
                backgroundColor: '#f5f5f5',
                padding: 2,
                borderRadius: 1,
                overflow: 'auto',
              },
            }}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {spec.description || '# No content available'}
            </ReactMarkdown>
          </Box>
        </TabPanel>

        {/* Versions Tab */}
        <TabPanel value={currentTab} index={2}>
          {versions.length === 0 ? (
            <Typography color="text.secondary">No version history available</Typography>
          ) : (
            <Table size="small">
              <TableBody>
                {versions.map((version) => (
                  <TableRow key={version.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        v{version.version}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(version.createdAt).toLocaleDateString()} by {version.createdBy}
                      </Typography>
                    </TableCell>
                    <TableCell>{version.changelog}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabPanel>

        {/* Usage Tab */}
        <TabPanel value={currentTab} index={3}>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold', width: '50%' }}>
                  Total Projects Using This Spec
                </TableCell>
                <TableCell>{spec.projectCount}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Total Usages
                </TableCell>
                <TableCell>{spec._count?.usage || 0}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell component="th" sx={{ fontWeight: 'bold' }}>
                  Available Versions
                </TableCell>
                <TableCell>{spec._count?.versions || 1}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabPanel>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
