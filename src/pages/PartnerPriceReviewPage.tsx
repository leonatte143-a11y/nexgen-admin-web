import { useCallback, useState } from 'react';
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
  DialogActions,
  TextField,
  Typography,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';
import { useMountedFetch } from '../hooks/useMountedFetch';
import { normalizeRole } from '../config/rbac';

export interface PendingPartnerPrice {
  id: string;
  partnerId: string;
  partnerName: string;
  serviceName: string;
  category: string;
  proposedPrice: number;
  currentPrice: number | null;
  status: string;
  submittedAt: string;
}

export function PartnerPriceReviewPage() {
  const role = useSelector((s: { auth: { admin: { role?: string } | null } }) => s.auth.admin?.role);
  const isAdmin = normalizeRole(role) === 'admin';
  const [rejectRow, setRejectRow] = useState<PendingPartnerPrice | null>(null);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState<string | null>(null);

  const fetchPending = useCallback(
    () => adminApi.pendingPartnerPrices() as Promise<PendingPartnerPrice[]>,
    [],
  );

  const { data: rows, loading, error, reload } = useMountedFetch(fetchPending, [fetchPending]);

  const approve = async (id: string) => {
    setActing(id);
    try {
      await adminApi.approvePartnerPrice(id);
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setActing(null);
    }
  };

  const reject = async () => {
    if (!rejectRow || !reason.trim()) return;
    setActing(rejectRow.id);
    try {
      await adminApi.rejectPartnerPrice(rejectRow.id, reason.trim());
      setRejectRow(null);
      setReason('');
      await reload();
    } catch (e) {
      console.error(e);
    } finally {
      setActing(null);
    }
  };

  const list = rows ?? [];

  return (
    <>
      <PageHeader
        title="Partner Price Review"
        subtitle="Approve or reject partner-submitted service prices"
      />
      <ErrorAlert message={error} />
      {loading && list.length === 0 ? (
        <LoadingState />
      ) : list.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          No prices pending review.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Partner</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Category</TableCell>
              <TableCell align="right">Proposed</TableCell>
              <TableCell align="right">Current</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.partnerName}</TableCell>
                <TableCell>{row.serviceName}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell align="right">₹{row.proposedPrice}</TableCell>
                <TableCell align="right">
                  {row.currentPrice != null ? `₹${row.currentPrice}` : '—'}
                </TableCell>
                <TableCell>
                  <Chip size="small" label={row.status} color="warning" />
                </TableCell>
                <TableCell>
                  {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : '—'}
                </TableCell>
                <TableCell align="right">
                  {isAdmin ? (
                    <>
                      <Button
                        size="small"
                        color="success"
                        disabled={acting === row.id}
                        onClick={() => approve(row.id)}
                      >
                        Approve
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        sx={{ ml: 1 }}
                        disabled={acting === row.id}
                        onClick={() => {
                          setRejectRow(row);
                          setReason('');
                        }}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Admin only
                    </Typography>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={Boolean(rejectRow)} onClose={() => setRejectRow(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Reject price</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            {rejectRow?.partnerName} — {rejectRow?.serviceName}
          </Typography>
          <TextField
            label="Rejection reason"
            fullWidth
            multiline
            minRows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectRow(null)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={!reason.trim() || acting === rejectRow?.id}
            onClick={reject}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
