import { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Chip, Box, Stack } from '@mui/material';
import { adminApi } from '../api/adminApi';
import { PageHeader } from '../components/PageHeader';
import { ErrorAlert } from '../components/ErrorAlert';

export function LiveBookingsPage() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setItems((await adminApi.liveBookings()) as Record<string, unknown>[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Load failed');
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <PageHeader title="Live Bookings Monitor" subtitle="Auto-refresh every 10s" />
      <ErrorAlert message={error} />
      <Box sx={{ mb: 2, p: 2, bgcolor: '#f0f0f0', borderRadius: 2, minHeight: 200 }}>
        <Typography variant="body2" color="text.secondary">
          Google Maps placeholder — wire VITE_GOOGLE_MAPS_KEY for live map pins
        </Typography>
      </Box>
      <Stack spacing={2}>
        {items.length === 0 && <Typography sx={{ p: 2 }}>No active jobs right now</Typography>}
        {items.map((b) => (
          <Card key={String(b.id)} variant="outlined">
            <CardContent>
              <Typography variant="h6">{String(b.serviceName)}</Typography>
              <Typography variant="body2">{String(b.address)}</Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label={String(b.partnerStatus)} color="primary" size="small" />
                <Chip label={`₹${b.totalAmount}`} size="small" sx={{ ml: 1 }} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </>
  );
}
