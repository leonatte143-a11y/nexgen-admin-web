import { useEffect, useState } from 'react';
import {
  Card, CardContent, Typography, Chip, Box, Stack, Button, Dialog, DialogTitle,
  DialogContent, MenuItem, Select, FormControl, InputLabel,
} from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { ErrorAlert } from '../components/ErrorAlert';
import { Can } from '../components/Can';
import { PERMISSIONS } from '../config/rbac';

export function LiveBookingsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [partners, setPartners] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reassignId, setReassignId] = useState<string | null>(null);
  const [newPartnerId, setNewPartnerId] = useState('');

  const load = async () => {
    try {
      setItems((await adminApi.liveBookings()) as Record<string, unknown>[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    }
  };

  const openReassign = async (bookingId: string) => {
    setReassignId(bookingId);
    try {
      setPartners((await adminApi.onlinePartners()) as Record<string, unknown>[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load partners');
    }
  };

  const confirmReassign = async () => {
    if (!reassignId || !newPartnerId) return;
    try {
      await adminApi.reassignBooking(reassignId, newPartnerId, 'Partner not moving');
      setReassignId(null);
      setNewPartnerId('');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reassign failed');
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <PageHeader title="Live Bookings Monitor" subtitle="Auto-refresh every 10s · Admin/Manager reassignment" />
      <ErrorAlert message={error} />
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 2, minHeight: 120 }}>
        <Typography variant="body2" color="text.secondary">
          Map view placeholder — wire VITE_GOOGLE_MAPS_KEY for live pins
        </Typography>
      </Box>
      <Stack spacing={2}>
        {items.length === 0 && <Typography sx={{ p: 2 }}>No active jobs right now</Typography>}
        {items.map((b) => (
          <Card key={String(b.id)} variant="outlined">
            <CardContent>
              <Typography variant="h6">{String(b.serviceName)}</Typography>
              <Typography variant="body2">{String(b.address)}</Typography>
              <Typography variant="body2" color="text.secondary">
                Partner: {String((b.partner as { name?: string })?.name || b.partnerName || 'Unassigned')}
              </Typography>
              <Box sx={{ mt: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={String(b.partnerStatus)} color="primary" size="small" />
                <Chip label={`₹${b.totalAmount}`} size="small" />
                <Can permission={PERMISSIONS.BOOKINGS_REASSIGN}>
                  <Button size="small" variant="outlined" onClick={() => openReassign(String(b.id))}>
                    Change Partner
                  </Button>
                </Can>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
      <Dialog open={Boolean(reassignId)} onClose={() => setReassignId(null)} fullWidth maxWidth="xs">
        <DialogTitle>Reassign Booking</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Online Partner</InputLabel>
            <Select value={newPartnerId} label="Online Partner" onChange={(e) => setNewPartnerId(e.target.value)}>
              {partners.map((p) => (
                <MenuItem key={String(p.id)} value={String(p.id)}>
                  {String(p.name)} · {String(p.primaryCity)} · ★{String(p.rating)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button fullWidth variant="contained" sx={{ mt: 2 }} onClick={confirmReassign} disabled={!newPartnerId}>
            Confirm Reassign
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
