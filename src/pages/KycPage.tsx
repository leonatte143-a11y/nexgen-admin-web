import { useCallback, useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
} from '@mui/material';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { useMountedFetch } from '../hooks/useMountedFetch';

interface KycRow {
  id: string;
  name: string;
  phone: string;
  categories: string[] | string;
  verificationStatus: string;
  documents: { docType: string; fileUrl: string }[];
  customCategoryRequest?: string;
}

interface CategoryOption {
  id: string;
  nameEn: string;
}

function normalizeCategories(categories: string[] | string | undefined): string {
  if (Array.isArray(categories)) return categories.join(', ');
  if (typeof categories === 'string') {
    try {
      const parsed = JSON.parse(categories) as string[];
      return Array.isArray(parsed) ? parsed.join(', ') : categories;
    } catch {
      return categories;
    }
  }
  return '';
}

export function KycPage() {
  const [selected, setSelected] = useState<KycRow | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [customOnly, setCustomOnly] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [mapCategoryId, setMapCategoryId] = useState('');
  const [mapMode, setMapMode] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);

  const fetchPending = useCallback(() => adminApi.pendingKyc() as Promise<KycRow[]>, []);

  const { data: rows, loading, error, reload } = useMountedFetch(fetchPending, [fetchPending]);

  useEffect(() => {
    adminApi
      .categories()
      .then((cats) => setCategories(cats as CategoryOption[]))
      .catch(() => setCategories([]));
  }, []);

  const act = async (id: string, approve: boolean) => {
    try {
      if (approve) await adminApi.approveKyc(id);
      else await adminApi.rejectKyc(id, 'Documents unclear');
      setSelected(null);
      await reload();
    } catch (e) {
      // reload will surface errors; keep dialog open on action failure
      console.error(e);
    }
  };

  const approveAddCategory = async (id: string) => {
    setActionBusy(true);
    try {
      await adminApi.approveKycAddCategory(id);
      setSelected(null);
      setMapMode(false);
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionBusy(false);
    }
  };

  const approveMapCategory = async (id: string) => {
    if (!mapCategoryId) return;
    setActionBusy(true);
    try {
      await adminApi.approveKycMapCategory(id, mapCategoryId);
      setSelected(null);
      setMapMode(false);
      setMapCategoryId('');
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setActionBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await adminApi.archivePartner(selected.id);
      setDeleteOpen(false);
      setSelected(null);
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setDeleting(false);
    }
  };

  const allRows = rows ?? [];
  const list = customOnly ? allRows.filter((r) => !!r.customCategoryRequest) : allRows;

  if (loading && allRows.length === 0) return <LoadingState />;
  return (
    <>
      <PageHeader
        title="Partner Verification Hub"
        subtitle="Approve KYC before partners can earn"
        action={
          <Button
            variant={customOnly ? 'contained' : 'outlined'}
            color="warning"
            size="small"
            onClick={() => setCustomOnly((v) => !v)}
          >
            Pending Custom Categories
          </Button>
        }
      />
      <ErrorAlert message={error} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Partner</TableCell>
            <TableCell>Service</TableCell>
            <TableCell>Documents</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {list.length === 0 && !loading && (
            <TableRow>
              <TableCell colSpan={5} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  No pending KYC applications
                </Typography>
              </TableCell>
            </TableRow>
          )}
          {list.map((r) => (
            <TableRow key={r.id} hover>
              <TableCell>
                {r.name}
                <br />
                <Typography variant="caption">{r.phone}</Typography>
              </TableCell>
              <TableCell>
                {normalizeCategories(r.categories)}
                {r.customCategoryRequest && (
                  <Chip
                    label={`New category: ${r.customCategoryRequest}`}
                    size="small"
                    color="secondary"
                    sx={{ ml: 1 }}
                  />
                )}
              </TableCell>
              <TableCell>{r.documents?.length || 0} files</TableCell>
              <TableCell>
                <Chip label={r.verificationStatus} size="small" color="warning" />
              </TableCell>
              <TableCell align="right">
                <Button
                  size="small"
                  onClick={() => {
                    setMapMode(false);
                    setMapCategoryId('');
                    setSelected(r);
                  }}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        {selected && (
          <>
            <DialogTitle>{selected.name} — KYC Review</DialogTitle>
            <DialogContent>
              {selected.customCategoryRequest && (
                <Box
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'warning.main',
                    bgcolor: 'warning.light',
                  }}
                >
                  <Typography sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                    Requested new category: &quot;{selected.customCategoryRequest}&quot;
                  </Typography>
                </Box>
              )}
              <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 2, mb: 2 }}>
                {selected.documents?.map((d) => (
                  <Box key={d.docType}>
                    <Typography variant="caption">{d.docType}</Typography>
                    <Box
                      component="img"
                      src={d.fileUrl}
                      alt={d.docType}
                      sx={{ maxWidth: 280, borderRadius: 1, border: '1px solid #eee', display: 'block' }}
                    />
                  </Box>
                ))}
              </Stack>

              {selected.customCategoryRequest ? (
                <Stack spacing={1.5}>
                  <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="success"
                      disabled={actionBusy}
                      onClick={() => approveAddCategory(selected.id)}
                    >
                      Approve & Add to Master List
                    </Button>
                    <Button
                      variant={mapMode ? 'contained' : 'outlined'}
                      color="primary"
                      onClick={() => setMapMode((v) => !v)}
                    >
                      Approve & Map to Existing
                    </Button>
                    <Button variant="contained" color="error" onClick={() => act(selected.id, false)}>
                      Reject
                    </Button>
                  </Stack>
                  {mapMode && (
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                      <Select
                        size="small"
                        displayEmpty
                        value={mapCategoryId}
                        onChange={(e) => setMapCategoryId(e.target.value)}
                        sx={{ minWidth: 240 }}
                      >
                        <MenuItem value="">
                          <em>Select existing category</em>
                        </MenuItem>
                        {categories.map((c) => (
                          <MenuItem key={c.id} value={c.id}>
                            {c.nameEn}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button
                        variant="contained"
                        disabled={!mapCategoryId || actionBusy}
                        onClick={() => approveMapCategory(selected.id)}
                      >
                        Confirm Mapping
                      </Button>
                    </Stack>
                  )}
                </Stack>
              ) : (
                <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                  <Button variant="contained" color="success" onClick={() => act(selected.id, true)}>
                    Approve
                  </Button>
                  <Button variant="contained" color="error" onClick={() => act(selected.id, false)}>
                    Reject
                  </Button>
                </Stack>
              )}

              <Can permission={PERMISSIONS.PARTNERS_COMPLIANCE}>
                <Box sx={{ mt: 1.5 }}>
                  <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
                    Delete Partner
                  </Button>
                </Box>
              </Can>
            </DialogContent>
          </>
        )}
      </Dialog>

      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Partner?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? This will remove the partner from the app. Their booking and financial history will be retained for auditing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            Delete Partner
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
