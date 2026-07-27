import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';
import { useHoverMeta } from '../components/HoverMetaTooltip';

export function PartnersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [archived, setArchived] = useState<Record<string, unknown>[]>([]);
  const [archivedLoaded, setArchivedLoaded] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const { onEnter, onLeave, tooltip } = useHoverMeta('partner');

  const loadArchived = async () => {
    try {
      setArchived((await adminApi.archivedPartners()) as Record<string, unknown>[]);
      setArchivedLoaded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load archived partners');
    }
  };

  const restore = async (partnerId: string) => {
    setRestoringId(partnerId);
    try {
      await adminApi.restorePartner(partnerId);
      await Promise.all([load(), loadArchived()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Restore failed');
    } finally {
      setRestoringId(null);
    }
  };

  const load = async () => {
    setLoading(true);
    try {
      setRows((await adminApi.partners(q ? { q } : undefined)) as Record<string, unknown>[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleFreeze = async (id: string, frozen: boolean) => {
    try {
      if (frozen) await adminApi.unfreezePartner(id);
      else await adminApi.freezePartner(id, 30);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Freeze update failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await adminApi.archivePartner(deleteId);
      setDeleteId(null);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingState />;
  return (
    <>
      <PageHeader title="Partner Management" />
      <ErrorAlert message={error} />
      {tooltip}
      <TextField size="small" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} label="Search" sx={{ mb: 2 }} />
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>Online</TableCell>
            <TableCell>Wallet</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Strikes</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Freeze</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((p) => (
            <TableRow
              key={String(p.id)}
              hover
              onMouseEnter={(e) => onEnter(e, String(p.id))}
              onMouseLeave={onLeave}
            >
              <TableCell>{String(p.name)}</TableCell>
              <TableCell>{String(p.phone)}</TableCell>
              <TableCell>{p.isOnline ? <Chip label="Online" color="success" size="small" /> : <Chip label="Offline" size="small" />}</TableCell>
              <TableCell>₹{String(p.walletBalance ?? 0)}</TableCell>
              <TableCell>{String(p.rating)}</TableCell>
              <TableCell>{String(p.strikeCount ?? 0)}</TableCell>
              <TableCell>{String(p.verificationStatus)}</TableCell>
              <TableCell>
                <Can permission={PERMISSIONS.PARTNERS_COMPLIANCE}>
                  <FormControlLabel
                    control={
                      <Switch
                        size="small"
                        checked={Boolean(p.isFrozen)}
                        onChange={() => toggleFreeze(String(p.id), Boolean(p.isFrozen))}
                      />
                    }
                    label={p.isFrozen ? 'Frozen' : 'Active'}
                  />
                </Can>
              </TableCell>
              <TableCell align="right">
                <Can permission={PERMISSIONS.PARTNERS_COMPLIANCE}>
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => {
                      setDeleteId(String(p.id));
                      setDeleteName(String(p.name));
                    }}
                  >
                    Delete
                  </Button>
                </Can>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Can permission={PERMISSIONS.PARTNERS_COMPLIANCE}>
        <Accordion sx={{ mt: 3 }} onChange={(_, expanded) => { if (expanded && !archivedLoaded) loadArchived(); }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography sx={{ fontWeight: 600 }}>Archived Partners{archivedLoaded ? ` (${archived.length})` : ''}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Wallet at archive</TableCell>
                  <TableCell>Archived</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {archivedLoaded && archived.length === 0 && (
                  <TableRow><TableCell colSpan={5}><Typography color="text.secondary">No archived partners</Typography></TableCell></TableRow>
                )}
                {archived.map((row) => {
                  const snapshot = (row.snapshot ?? {}) as Record<string, unknown>;
                  const partnerId = String(row.partnerId ?? snapshot.id ?? '');
                  return (
                    <TableRow key={String(row.id)}>
                      <TableCell>{String(snapshot.name ?? '—')}</TableCell>
                      <TableCell>{String(snapshot.phone ?? '—')}</TableCell>
                      <TableCell>₹{String(snapshot.walletBalance ?? 0)}</TableCell>
                      <TableCell>{row.archivedAt ? new Date(String(row.archivedAt)).toLocaleString() : '—'}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={restoringId === partnerId}
                          onClick={() => restore(partnerId)}
                        >
                          Restore
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </AccordionDetails>
        </Accordion>
      </Can>

      <Dialog open={Boolean(deleteId)} onClose={() => setDeleteId(null)}>
        <DialogTitle>Delete Partner?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? This will remove {deleteName} from the app. Financial and booking history is retained for auditing.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            Delete Partner
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
