import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  MenuItem,
  Chip,
  Box,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

export function BookingsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (q) params.q = q;
      const res = await adminApi.bookings(params);
      setItems(res.items as Record<string, unknown>[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [status]);

  return (
    <>
      <PageHeader title="Booking Management" />
      <ErrorAlert message={error} />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField select size="small" label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="partner_assigned">Pending</MenuItem>
          <MenuItem value="accepted">Accepted</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <TextField size="small" label="Search" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && load()} />
      </Box>
      {loading ? <LoadingState /> : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Partner</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((b) => (
              <TableRow key={String(b.id)} hover>
                <TableCell>{String(b.id).slice(0, 12)}…</TableCell>
                <TableCell>{String(b.serviceName)}</TableCell>
                <TableCell>{String(b.customerName)}</TableCell>
                <TableCell>{String(b.partnerName)}</TableCell>
                <TableCell>₹{String(b.totalAmount)}</TableCell>
                <TableCell>
                  <Chip size="small" label={String(b.userStatus)} />
                  <Chip size="small" label={String(b.partnerStatus)} sx={{ ml: 0.5 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </>
  );
}
