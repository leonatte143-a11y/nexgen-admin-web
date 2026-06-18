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
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';

export function PartnersPage() {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleting, setDeleting] = useState(false);

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
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((p) => (
            <TableRow key={String(p.id)}>
              <TableCell>{String(p.name)}</TableCell>
              <TableCell>{String(p.phone)}</TableCell>
              <TableCell>{p.isOnline ? <Chip label="Online" color="success" size="small" /> : <Chip label="Offline" size="small" />}</TableCell>
              <TableCell>₹{String(p.walletBalance ?? 0)}</TableCell>
              <TableCell>{String(p.rating)}</TableCell>
              <TableCell>{String(p.strikeCount ?? 0)}</TableCell>
              <TableCell>{String(p.verificationStatus)}</TableCell>
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
