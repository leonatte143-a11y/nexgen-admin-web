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
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

interface LineItem {
  title: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

interface BookingRow {
  id: string;
  serviceName: string;
  customerName: string;
  partnerName: string;
  totalAmount: number;
  userStatus: string;
  partnerStatus: string;
  lineItems?: LineItem[];
  visitingFee?: number;
  promoDiscount?: number;
  itemsSubtotal?: number;
  distanceKm?: number;
}

export function BookingsPage() {
  const [items, setItems] = useState<BookingRow[]>([]);
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detail, setDetail] = useState<BookingRow | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      if (q) params.q = q;
      const res = await adminApi.bookings(params);
      setItems(res.items as BookingRow[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    try {
      const b = (await adminApi.getBooking(id)) as unknown as BookingRow;
      setDetail(b);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load booking');
    } finally {
      setDetailLoading(false);
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
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All</MenuItem>
          <MenuItem value="partner_assigned">Pending</MenuItem>
          <MenuItem value="accepted">Accepted</MenuItem>
          <MenuItem value="in_progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="cancelled">Cancelled</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load()}
        />
      </Box>
      {loading ? (
        <LoadingState />
      ) : (
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
              <TableRow key={b.id} hover sx={{ cursor: 'pointer' }} onClick={() => openDetail(b.id)}>
                <TableCell>{String(b.id).slice(0, 12)}…</TableCell>
                <TableCell>{b.serviceName}</TableCell>
                <TableCell>{b.customerName}</TableCell>
                <TableCell>{b.partnerName}</TableCell>
                <TableCell>₹{b.totalAmount}</TableCell>
                <TableCell>
                  <Chip size="small" label={b.userStatus} />
                  <Chip size="small" label={b.partnerStatus} sx={{ ml: 0.5 }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={Boolean(detail || detailLoading)} onClose={() => setDetail(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Booking details</DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <LoadingState />
          ) : detail ? (
            <>
              <Typography variant="body2" gutterBottom>
                {detail.serviceName} · {detail.customerName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Partner: {detail.partnerName}
                {detail.distanceKm != null ? ` · ${detail.distanceKm} km` : ''}
              </Typography>
              {detail.lineItems && detail.lineItems.length > 0 ? (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 2 }}>
                    Selected services
                  </Typography>
                  <List dense>
                    {detail.lineItems.map((li, i) => (
                      <ListItem key={i} disablePadding>
                        <ListItemText
                          primary={`${li.title} × ${li.quantity}`}
                          secondary={`₹${li.unitPrice} each · line ₹${li.lineTotal}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  No line items stored (legacy booking).
                </Typography>
              )}
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Bill
              </Typography>
              {detail.itemsSubtotal != null && (
                <Typography variant="body2">Items subtotal: ₹{detail.itemsSubtotal}</Typography>
              )}
              {detail.visitingFee != null && (
                <Typography variant="body2">Visiting charges: ₹{detail.visitingFee}</Typography>
              )}
              {detail.promoDiscount != null && detail.promoDiscount > 0 && (
                <Typography variant="body2">Promo discount: −₹{detail.promoDiscount}</Typography>
              )}
              <Typography variant="body1" sx={{ mt: 1, fontWeight: 700 }}>
                Total: ₹{detail.totalAmount}
              </Typography>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
